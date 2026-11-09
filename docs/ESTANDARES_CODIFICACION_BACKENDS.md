# Estándares de Codificación y Arquitectura de los Backends
**Sistema de Gestión Empresarial — Carpintería Artesanal «El Roble» (SW2)**

El proyecto está construido sobre una **Arquitectura de Microservicios Políglota** donde cada uno de los 4 backends aplica tanto **estándares transversales de ingeniería de software (DDD, Arquitectura Hexagonal / Clean Architecture, SOLID)** como los **estándares oficiales de codificación idiomática de cada lenguaje**.

---

## 1. Estándares Transversales Comunes a los 4 Backends

1. **Arquitectura Hexagonal (Puertos y Adaptadores) + Domain-Driven Design (DDD):**
   - Separación estricta en 3 capas (`domain`, `application`, `infrastructure` / `adapters`).
   - El **Dominio** (`domain/`) no depende de frameworks externos ni de bases de datos (regla de dependencia concéntrica de Clean Architecture).
   - Uso de **Entidades**, **Agregados (Aggregate Roots)**, **Objetos de Valor Inmutables (Value Objects)**, **Repositorios (Puertos)** y **Eventos de Dominio**.
2. **Principios SOLID e Inyección de Dependencias por Constructor:**
   - Todos los servicios y casos de uso reciben sus dependencias por constructor (`final` en Java, `readonly` en TypeScript y PHP 8.2), facilitando las pruebas unitarias con *mocks*.
3. **Nomenclatura Semántica Bilingüe Consistente:**
   - **Código fuente, clases, métodos, tablas y contratos API/GraphQL:** 100% en inglés técnico estándar (`CreateOrderUseCase`, `ProcessPaymentHandler`, `InvoiceService`, `ClusterClientsUseCase`).
   - **Documentación (`Javadoc`, `TSDoc`, `Docstrings`, `PHPDoc`) y mensajes de dominio al usuario:** En español claro y orientado al negocio de carpintería.
4. **Configuración Doce Factores (The Twelve-Factor App):**
   - Cero credenciales quemadas en código (*hardcoded*). Todo se inyecta mediante variables de entorno (`.env`, `@nestjs/config`, `pydantic-settings`, `application.yml`, `config/*.php`).

---

## 2. Estándares por cada Microservicio Backend

### 2.1. Backend 1 — Negocio Core (`Backend1-Java-Negocio` · Java 21 + Spring Boot 3.5)
* **Estándar de Lenguaje y Estilo:**
  - **Google Java Style Guide / Oracle Java Code Conventions** con **Java 21 LTS** ([`build.gradle`](../Backend1-Java-Negocio/build.gradle)).
  - Indentación de 4 espacios, llaves estilo K&R, `UpperCamelCase` para clases/interfaces, `lowerCamelCase` para métodos/atributos y `UPPER_SNAKE_CASE` para constantes y `enum` (`OrderStatus`, `StepStatus`, `DeliveryType`).
* **Uso de Características Modernas de Java 21:**
  - **`record` inmutables** para Comandos, Consultas, Eventos y DTOs (`CreateOrderCommand`, `OrderResponse`, `OrderCreatedEvent`), eliminando código repetitivo y garantizando inmutabilidad.
  - **Value Objects tipados** (`Money`, `Dimensions`, `OrderId`, `WoodType`, `ContactInfo`) con validación en el constructor para evitar *Primitive Obsession*.
  - **Lombok** (`@Getter`, `@Setter`, `@NoArgsConstructor`) controlado en entidades para mantener el código limpio.
* **Estándar de Persistencia y Versionado de Base de Datos:**
  - Separación entre el modelo de dominio (`Order.java`) y la entidad JPA (`OrderJpaEntity.java`) con métodos mapeadores explícitos `toDomain()` y `from(domain)`.
  - Migraciones SQL versionadas con **Flyway** (`V1__init.sql`, `V2__seed.sql`, `V3__delivery_location.sql`, `V4__gps_double_precision.sql`).

---

### 2.2. Backend 2 — API Gateway, Cotizaciones y Pagos (`Backend2-NestJS-Gateway` · TypeScript 5.6 + NestJS 11)
* **Estándar de Lenguaje y Estilo:**
  - **Estándar Oficial de NestJS / Google TypeScript Style Guide** con compilación a `ES2021` ([`tsconfig.json`](../Backend2-NestJS-Gateway/tsconfig.json)).
  - Convención de nombres de archivos en **`kebab-case`** con sufijo arquitectónico explícito:
    - `*.controller.ts` (Adaptadores de entrada REST)
    - `*.handler.ts` / `*.command.ts` / `*.query.ts` (Patrón **CQRS** en capa de aplicación)
    - `*.entity.ts` / `*.vo.ts` / `*.repository.ts` / `*.event.ts` (Capa de dominio DDD)
    - `*.adapter.ts` / `*.guard.ts` / `*.strategy.ts` (Infraestructura y seguridad)
* **Validación y Seguridad por Contrato:**
  - Validación declarativa de DTOs de entrada con decoradores de **`class-validator`** y **`class-transformer`** (`@IsString()`, `@IsEmail()`, `@Min()`, `@ValidateNested()`).
  - Inversión de dependencias mediante tokens simbólicos (`QUOTATION_REPOSITORY`, `PAYMENT_LOG_REPOSITORY`, `PAYMENT_GATEWAY`) inyectados con `@Inject(...)`.
  - Protección por capas con `JwtAuthGuard`, `RolesGuard` (`@Roles('ADMIN', 'CARPENTER', 'CLIENT')`) y `@Throttle` contra fuerza bruta.

---

### 2.3. Backend 3 — Inteligencia Artificial y Servidor MCP (`Backend3-Python-IA-MCP` · Python 3.12 + FastAPI + MCP)
* **Estándar de Lenguaje y Estilo:**
  - **PEP 8** (Guía de estilo de código Python), **PEP 257** (Docstrings) y **PEP 484 / PEP 585** (**Type Hints estrictos** con `from __future__ import annotations`).
  - Nomenclatura `snake_case` para módulos, funciones y variables (`estimate_furniture.py`, `cluster_clients.py`, `generate_report.py`), `PascalCase` para clases y modelos (`AgentService`, `EstimateCostUseCase`), y prefijo `_` para funciones privadas de módulo (`_synthesize_with_llm`, `_SAFE_SQL`).
* **Modelado y Validación de Datos:**
  - Uso de **`@dataclass(frozen=True)`** en la capa de dominio (`app/domain/furniture/models.py`, `app/domain/pricing/models.py`) para garantizar objetos de valor inmutables.
  - Uso de **Pydantic v2 (`BaseModel`, `Field`)** y `pydantic-settings` en los adaptadores REST (`ai_router.py`) y configuración.
* **Estándar de Protocolo MCP (Model Context Protocol):**
  - Separación modular según la especificación oficial de Anthropic MCP en 3 primitivas dentro de `app/mcp/`:
    1. `tools/tools_impl.py` (Herramientas ejecutables por el LLM)
    2. `resources/resources_impl.py` (Recursos de contexto de solo lectura)
    3. `prompts/prompts_impl.py` (Plantillas de prompts estandarizadas)

---

### 2.4. Backend 4 — Facturación y Recibos PDF (`Backend4-PHP-Recibos` · PHP 8.2 + Laravel 12)
* **Estándar de Lenguaje y Estilo:**
  - **PSR-12** (*Extended Coding Style Guide*) y **PSR-4** (*Autoloader Standard*), verificados automáticamente con **Laravel Pint** ([`composer.json`](../Backend4-PHP-Recibos/composer.json)).
  - Uso de características modernas de **PHP 8.2**:
    - *Constructor Property Promotion* con propiedades `private readonly` (`public function __construct(private readonly PdfReceiptService $pdf, private readonly N8nNotifier $n8n) {}`).
    - Tipado estricto en parámetros y retornos (`array`, `Invoice`, `JsonResponse`, `?string`) complementado con anotaciones genéricas PHPDoc (`@param array<int, array{description:string,quantity:float,unit_price:float}> $items`).
* **Arquitectura orientadas a Servicios (Service Layer Pattern):**
  - Los controladores ([`InvoiceController.php`](../Backend4-PHP-Recibos/app/Http/Controllers/InvoiceController.php)) son delgados (*Thin Controllers*): solo validan el `Request` y delegan toda la lógica transaccional, cálculo de impuestos (IVA 13%), almacenamiento en S3 y notificación de eventos a la capa `App\Services\` (`InvoiceService`, `PdfReceiptService`, `N8nNotifier`).
