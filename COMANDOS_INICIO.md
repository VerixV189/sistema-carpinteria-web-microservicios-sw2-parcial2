# 🚀 Guía de Comandos e Inicio del Sistema de Carpintería

Este documento reúne todos los comandos necesarios para instalar dependencias y levantar cada uno de los servicios del sistema (Infraestructura, Backends y Frontends / Microfrontends), así como las credenciales y puertos de acceso.

---

## 📌 Tabla Resumen de Puertos y Servicios

| Componente | Carpeta / Servicio | Puerto Local | Tecnología |
| :--- | :--- | :--- | :--- |
| **Infraestructura** | `Infraestructura` (Docker) | Varios (ver abajo) | PostgreSQL, Mongo, Redis, RabbitMQ, MinIO, etc. |
| **Backend 1** | `Backend1-Java-Negocio` | `:8080` | Java 21, Spring Boot 3, GraphQL (DGS) |
| **Backend 2** | `Backend2-NestJS-Gateway` | `:3000` | NestJS 11, TypeScript, JWT, Auth Gateway |
| **Backend 3** | `Backend3-Python-IA-MCP` | `:8100` y `:8110` | Python 3.12, FastAPI (REST) + MCP (SSE) |
| **Backend 4** | `Backend4-PHP-Recibos` | `:8001` | Laravel 11/12, PHP 8.2+, DomPDF |
| **Frontend 1** | `Frontend1-React-Portal` | `:4200` | React 19, Single-SPA (Host / Shell Principal) |
| **Frontend 2** | `Frontend2-Angular-Admin` | `:4202` | Angular 18, Native Federation (Remoto Admin) |
| **Frontend 3** | `Frontend3-Svelte-Taller` | `:4204` | SvelteKit, Vite (Remoto Taller) |

---

## 1️⃣ Paso 1: Infraestructura Base (Docker)

Antes de levantar cualquier backend o frontend, debes iniciar la infraestructura compartida:

```powershell
# 1. Asegúrate de tener Docker Desktop abierto y en ejecución.

# 2. Crear la red compartida (solo es necesario la primera vez):
docker network create carpinteria-net

# 3. Entrar a la carpeta y levantar todos los contenedores en segundo plano:
cd c:\Desarrollo\carpinteria-sistema-sw2\Infraestructura
docker compose up -d
```

### 🔍 Servicios que quedan activos en Docker:
* **PostgreSQL 16:** `localhost:15432` *(BDs `carpinteria` y `carpinteria_billing`)*
* **MongoDB 7:** `localhost:27017`
* **Redis 7:** `localhost:6379`
* **RabbitMQ Broker:** `localhost:5672`
* **RabbitMQ Panel Web:** [http://localhost:15672](http://localhost:15672) *(Usuario: `carpinteria` / Clave: `carpinteria`)*
* **MinIO Storage (S3):** `localhost:9000`
* **MinIO Consola Web:** [http://localhost:19001](http://localhost:19001) *(Usuario: `carpinteria` / Clave: `carpinteria123`)*
* **DynamoDB Local:** `localhost:8000`
* **Ollama (IA Local):** `localhost:11434`
* **n8n (Automatización):** [http://localhost:5678](http://localhost:5678) *(Usuario: `admin` / Clave: `carpinteria`)*
* **Mailpit (Webmail de prueba):** [http://localhost:8025](http://localhost:8025)
* **WAHA (WhatsApp API):** [http://localhost:8002](http://localhost:8002)

---

## 2️⃣ Paso 2: Backends (Abrir 4 terminales)

Abre una terminal independiente para cada backend:

### ☕ Terminal 1 — Backend 1: Java Negocio
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Backend1-Java-Negocio
.\gradlew.bat bootRun
```
* **Puerto:** `http://localhost:8080`
* **Consola GraphiQL:** [http://localhost:8080/graphiql](http://localhost:8080/graphiql)
* **Health Actuator:** [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

### 🐱 Terminal 2 — Backend 2: NestJS Gateway
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Backend2-NestJS-Gateway
npm run start:dev
```
* **Puerto:** `http://localhost:3000`
* **Función:** Gateway unificado del sistema, autenticación JWT y proxy hacia Java, Python y PHP.

---

### 🐍 Terminal 3 — Backend 3: Python IA & MCP
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Backend3-Python-IA-MCP

# Activar el entorno virtual (creado con Python 3.12)
.\.venv\Scripts\Activate.ps1

# Iniciar servidor REST y servidor MCP
python main.py
```
* **API REST:** [http://localhost:8100/health](http://localhost:8100/health)
* **Servidor MCP SSE:** `http://localhost:8110/sse`

---

### 🐘 Terminal 4 — Backend 4: PHP Recibos y Facturación
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Backend4-PHP-Recibos
php artisan serve --port=8001
```
* **API Invoices:** [http://localhost:8001/api/invoices](http://localhost:8001/api/invoices)

*(Opcional: Si deseas tener el consumidor de pagos de RabbitMQ en segundo plano, abre otra terminal y ejecuta: `php artisan billing:consume-payments`)*.

---

## 3️⃣ Paso 3: Frontends / Microfrontends (Abrir 3 terminales)

Para disfrutar de la integración completa de **Microfrontends (Single-SPA)**, levanta los tres proyectos:

### 🅰️ Terminal 5 — Frontend 2: Angular Admin (MFE Remoto)
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Frontend2-Angular-Admin
npm run dev
```
* **Puerto:** `http://localhost:4202`
* **Acceso directo Standalone:** [http://localhost:4202/admin/login](http://localhost:4202/admin/login)

---

### 🧡 Terminal 6 — Frontend 3: Svelte Taller (MFE Remoto)
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Frontend3-Svelte-Taller
npm run dev
```
* **Puerto:** `http://localhost:4204`
* **Acceso directo Standalone:** [http://localhost:4204](http://localhost:4204)

---

### ⚛️ Terminal 7 — Frontend 1: React Portal (Host / Shell Principal)
```powershell
cd c:\Desarrollo\carpinteria-sistema-sw2\Frontend1-React-Portal
npm run dev
```
* **Puerto Principal:** 👉 **[http://localhost:4200](http://localhost:4200)**

---

## 👥 Credenciales de Acceso (Usuarios Semilla)

Todos los usuarios están precargados en el sistema con los siguientes roles y contraseñas:

| Rol | Correo Electrónico | Contraseña | ¿Qué permite hacer? |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@carpinteria.com` | `admin123` | Acceso a vitrina cliente y al panel completo de **Administración en Angular** (`/admin`). |
| **Carpintero** | `carpintero@carpinteria.com` | `carp123` | Acceso a la app de **Taller en Svelte** (`/taller`) para fechas de entrega y capacidad. |
| **Cliente** | `cliente@carpinteria.com` | `cliente123` | Acceso al **Portal de Cliente en React** (`/cotizar`, `/pagar`, `/recibos`). |

---

## 💡 Modo de Prueba Recomendado

1. Abre tu navegador en **[http://localhost:4200](http://localhost:4200)** (Host React).
2. Haz clic en **Iniciar Sesión** (`/login`).
3. Ingresa con **`admin@carpinteria.com`** / **`admin123`**.
4. Haz clic en **Administración** en la barra de navegación:
   * React montará de forma transparente la aplicación de **Angular 18** dentro de la misma interfaz.
5. Haz clic en **Taller**:
   * React montará la aplicación de **SvelteKit**.
6. Para probar pagos en la zona de cliente, puedes usar cualquier tarjeta de crédito de prueba que comience con **`4242424242424242`**.

---

## 🛑 Detener los Servicios

* Para detener cada backend o frontend en su respectiva terminal: presiona **`Ctrl + C`**.
* Para detener toda la infraestructura de Docker:
  ```powershell
  cd c:\Desarrollo\carpinteria-sistema-sw2\Infraestructura
  docker compose down
  ```
