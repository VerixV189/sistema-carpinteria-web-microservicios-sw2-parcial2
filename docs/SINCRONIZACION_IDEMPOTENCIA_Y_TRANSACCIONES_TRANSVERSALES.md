# Sincronización, Idempotencia y Transacciones Transversales (Distribuidas)
**Sistema de Gestión Empresarial — Carpintería Artesanal «El Roble» (SW2)**

> **Nota Arquitectónica:** En una arquitectura de microservicios políglota con bases de datos heterogéneas (**PostgreSQL**, **MongoDB**, **DynamoDB**, **Redis** y **AWS S3**), no se utiliza un bloqueo distribuido rígido (*Two-Phase Commit / 2PC*) porque degrada la disponibilidad (Teorema CAP). En su lugar, este sistema implementa **Transacciones Transversales mediante el Patrón Saga (Coreografiada por RabbitMQ + Orquestada por n8n)** combinadas con **Cerrojos Transaccionales Locales (ACID)** y **Llaves Globales de Idempotencia**.

---

## Parte 1: ¿Dónde se aplican las Transacciones Transversales que cruzan todos los Microservicios?

Una **transacción transversal (o transacción distribuida)** es una operación de negocio que nace en una acción del usuario y **debe actualizar de forma consistente el estado en múltiples microservicios y motores de base de datos distintos**.

En el proyecto existen **3 Transacciones Transversales Principales (Sagas Distribuidas)**:

### 1.1. Saga Transversal #1: Compra y Pago de Cotización / Tienda (Cruza los 4 Microservicios + n8n + 5 Bases de Datos)

Esta es la **transacción transversal más completa del sistema**, ya que involucra simultáneamente al **Gateway (NestJS)**, **Negocio (Java Spring Boot)**, **Facturación (PHP Laravel)**, **IA/MCP (Python FastAPI)** y **Automatización (n8n)**.

#### Flujo paso a paso a través de todos los microservicios:
1. **Paso 1 — `Backend2-NestJS-Gateway` (`MongoDB` + `AWS DynamoDB` + `Stripe`):**
   - Archivos: `src/application/payment/commands/process-payment.handler.ts`, `src/infrastructure/adapters/inbound/rest/payment.controller.ts` y `product.controller.ts`.
   - Valida que la cotización esté aprobada o que haya stock disponible del mueble en MongoDB.
   - Genera la llave única transversal `PaymentId` (UUID v4) y escribe el log `INITIATED` en **DynamoDB**.
   - Ejecuta el cargo en **Stripe** (`stripe.adapter.ts`).
   - Si Stripe aprueba, registra `APPROVED` y el documento final `COMPLETED` en **DynamoDB**, descuenta el stock en **MongoDB** y publica el evento de dominio `payment.completed` (y `quotation.approved`) en **RabbitMQ**.
   - **Compensación si falla:** Si la tarjeta es declinada, registra `DECLINED` en DynamoDB, **no descuenta stock** en MongoDB y **no publica** `payment.completed`, abortando limpiamente la saga.
2. **Paso 2 — `Backend1-Java-Negocio` (`PostgreSQL Core`):**
   - Archivo: `src/main/java/com/carpinteria/business/infrastructure/messaging/DomainEventListener.java`.
   - Escucha las colas `business.quotation_approved` y `business.payment_completed`.
   - Resuelve o auto-registra al cliente en PostgreSQL (`resolveClientId`), crea el pedido con sus ítems, coordenadas GPS de entrega y sus 3 pasos de fabricación en taller (`production_steps`), cambia el estado del pedido a `IN_PRODUCTION` y auto-asigna al maestro carpintero.
3. **Paso 3 — `Backend4-PHP-Recibos` (`PostgreSQL Billing` + `AWS S3`):**
   - Archivo: `app/Services/InvoiceService.php`.
   - Recibe la orden de facturación por **RabbitMQ** y/o **n8n**.
   - Dentro de una transacción ACID en PostgreSQL (`DB::transaction`), calcula el IVA (13%), emite la factura correlativa serie `A`, renderiza el PDF con DomPDF y lo sube al bucket **AWS S3** (`nestjs-archivos-proyecto-erik-2026`).
4. **Paso 4 — `Automatizacion-N8N` + WhatsApp Cloud API (`Meta`) + `Backend3-Python-IA-MCP`:**
   - Una vez confirmada la transacción en base de datos (`DB::afterCommit`), Laravel avisa a **n8n**, el cual descarga el PDF y lo envía al WhatsApp oficial del cliente y a su correo electrónico.
   - El servicio de **IA/MCP en Python** refleja de inmediato el nuevo estado del pedido, el nuevo volumen facturado y la factura emitida tanto en el chatbot como en los reportes ejecutivos.

---

### 1.2. Saga Transversal #2: Solicitud de Cotización a Medida con Estimación IA (`NestJS` ↔ `S3` ↔ `Python IA` ↔ `RabbitMQ` ↔ `Java`)
- `uploads.controller.ts`: Subida de foto de referencia del mueble a **AWS S3**.
- `create-quotation.handler.ts`: Persistencia en **MongoDB** + llamada síncrona/evento a **Python IA** para cálculo inteligente de costos según dimensiones y tipo de madera.
- `quotation.controller.ts`: Negociación cliente-taller y publicación de `quotation.approved` hacia **Java Spring Boot** para crear la orden de producción.

---

### 1.3. Saga Transversal #3: Alta Unificada de Identidad y Ficha de Negocio (`NestJS Auth/Redis` ↔ `Java GraphQL/PostgreSQL`)
- `auth.service.ts`: Crea credenciales con hash `bcrypt` en **Redis** y sincroniza la ficha en **PostgreSQL** vía GraphQL interno con `x-internal-secret`, o auto-aprovisiona la cuenta en Redis al primer login si el registro fue creado por el administrador en PostgreSQL.

---

## Parte 2: Mecanismos de Sincronización que resuelven Problemas de Idempotencia

### 2.1. Bloqueo Exclusivo de Tabla (`LOCK TABLE`) + Idempotencia por `payment_id` + `DB::afterCommit` (PHP / Laravel)
* **Archivo:** `Backend4-PHP-Recibos/app/Services/InvoiceService.php` (líneas 22–89)
* **Qué resuelve:** Evita que RabbitMQ y n8n generen dos facturas para el mismo pago o colisionen en el número correlativo de factura.
* **Implementación:**
  1. `DB::statement('LOCK TABLE invoices IN SHARE ROW EXCLUSIVE MODE')` dentro de `DB::transaction(...)`.
  2. Verificación previa `Invoice::where('payment_id', $data['payment_id'])->first()`: si ya existe, retorna la misma factura de manera idempotente.
  3. `DB::afterCommit(fn () => $this->n8n->notifyInvoiceGenerated($invoice))` para evitar condiciones de carrera antes del commit.

### 2.2. Exclusión Mutua de Hilos (`synchronized`) + Deduplicación por `quotationId` (Java / Spring Boot)
* **Archivo:** `Backend1-Java-Negocio/src/main/java/com/carpinteria/business/application/order/CreateOrderUseCase.java` (líneas 28–60)
* **Qué resuelve:** Evita que eventos concurrentes de aprobación/pago creen dos pedidos para la misma cotización.
* **Implementación:**
  1. Método `public synchronized OrderResponse execute(CreateOrderCommand command)` (Mutex en JVM).
  2. Consulta `repository.findByQuotationId(command.quotationId())`: si ya existe el pedido para esa cotización, lo retorna sin duplicarlo.

### 2.3. Consumidor Idempotente en la Máquina de Estados del Pedido (Java / Spring Boot)
* **Archivo:** `Backend1-Java-Negocio/src/main/java/com/carpinteria/business/infrastructure/messaging/DomainEventListener.java` (líneas 144–166)
* **Qué resuelve:** Evita errores de transición inválida cuando `payment.completed` llega más de una vez para un pedido que ya está en `IN_PRODUCTION`.

### 2.4. Trazabilidad e Idempotencia de Pagos con UUID Transversal (`NestJS` + `DynamoDB` + `Stripe`)
* **Archivo:** `Backend2-NestJS-Gateway/src/application/payment/commands/process-payment.handler.ts` (líneas 19–79)
* **Qué resuelve:** Genera un `PaymentId` (UUID v4) único que viaja a Stripe (`metadata.reference`), DynamoDB (`payment_logs`), RabbitMQ, Java y PHP como llave global de idempotencia.

### 2.5. Cola Secuencial FIFO de Sincronización Offline-First (Móvil Flutter & Web)
* **Archivos:** `offline_sync_service.dart` (Móvil) y `offline-ai.service.ts` / `reports.component.ts` (Web).
* **Qué resuelve:** Semáforo `_isSyncing` en móvil para vaciar la cola SQLite `pending_sync_queue` una sola vez en orden FIFO al recuperar internet, y aislamiento de llaves en `localStorage` entre Taller y Administración en la web.
