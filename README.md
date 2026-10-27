# 🪵 Sistema Integral de Gestión para Carpintería (SW2)

Sistema distribuido basado en arquitectura de microservicios y microfrontends para la gestión de carpintería (cotizaciones con IA, pagos, producción, taller y facturación).

Consulta la guía detallada de ejecución en:  
👉 **[COMANDOS_INICIO.md](./COMANDOS_INICIO.md)**

---

## 🏗️ Arquitectura del Sistema

```
                                  ┌───────────────────────────────┐
                                  │      Host Shell (React 19)    │
                                  │     http://localhost:4200     │
                                  └───┬───────────────────────┬───┘
                                      │ (Single-SPA)          │ (Single-SPA)
                                      ▼                       ▼
                        ┌───────────────────────────┐   ┌───────────────────────────┐
                        │   Admin App (Angular 18)  │   │ Workshop App (SvelteKit)  │
                        │   http://localhost:4202   │   │   http://localhost:4204   │
                        └─────────────┬─────────────┘   └─────────────┬─────────────┘
                                      │                               │
                                      ▼                               ▼
                        ┌───────────────────────────────────────────────────────────┐
                        │              API Gateway — NestJS (:3000)                │
                        │           (Autenticación JWT, Rate-limit, Proxy)          │
                        └─────────────┬──────────────┬───────────────┬──────────────┘
                                      │              │               │
               ┌──────────────────────┘              │               └──────────────────────┐
               ▼                                     ▼                                      ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐     ┌───────────────────────────────┐
│ Business Service (Java/Spring)│     │     AI Service (Python/FastAPI)│     │ Billing Service (PHP/Laravel) │
│            :8080              │     │         :8100 y :8110         │     │             :8001             │
│    PostgreSQL (:15432)        │     │  ONNX + Scikit-Learn + MCP    │     │   DomPDF + MinIO (:9000)      │
└──────────────┬────────────────┘     └──────────────┬────────────────┘     └──────────────┬────────────────┘
               │                                     │                                     │
               └─────────────────────────────────────┴─────────────────────────────────────┘
                                            RabbitMQ (:5672) Events
```

---

## ⚡ Comandos Rápidos de Inicio

### 1. Infraestructura Base
```powershell
docker network create carpinteria-net   # (Solo la primera vez)
cd Infraestructura && docker compose up -d
```

### 2. Backends (En terminales separadas)
* **Java Negocio:** `cd Backend1-Java-Negocio && .\gradlew.bat bootRun` (`:8080`)
* **NestJS Gateway:** `cd Backend2-NestJS-Gateway && npm run start:dev` (`:3000`)
* **Python IA & MCP:** `cd Backend3-Python-IA-MCP && .\.venv\Scripts\Activate.ps1 && python main.py` (`:8100` / `:8110`)
* **PHP Recibos:** `cd Backend4-PHP-Recibos && php artisan serve --port=8001` (`:8001`)

### 3. Frontends (En terminales separadas)
* **Angular Admin:** `cd Frontend2-Angular-Admin && npm run dev` (`:4202`)
* **Svelte Taller:** `cd Frontend3-Svelte-Taller && npm run dev` (`:4204`)
* **React Portal Shell:** `cd Frontend1-React-Portal && npm run dev` (`:4200`)

---

## 🔑 Credenciales de Prueba

* **Admin:** `admin@carpinteria.com` / `admin123`
* **Carpintero:** `carpintero@carpinteria.com` / `carp123`
* **Cliente:** `cliente@carpinteria.com` / `cliente123`
* **MinIO Console (`:19001`):** `carpinteria` / `carpinteria123`
* **RabbitMQ Dashboard (`:15672`):** `carpinteria` / `carpinteria`
