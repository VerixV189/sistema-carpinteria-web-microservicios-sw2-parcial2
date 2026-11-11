# Guía de Particionamiento y Despliegue Multi-Cloud (AWS + Microsoft Azure + Alibaba Cloud)

Este documento detalla cómo **particionar de forma limpia y ordenada el Segundo VPS (`VPS-GATEWAY-IA-WEB`)** para distribuir los microservicios y micro-frontends del sistema **Carpintería El Roble** entre **AWS**, **Microsoft Azure** y **Alibaba Cloud**, cumpliendo con las mejores prácticas de arquitectura distribuida exigidas en la defensa.

---

## 1. ¿Cómo partir el VPS 2 de forma ordenada sin romper lo que ya funciona?

Actualmente tu infraestructura tiene **2 VPS en AWS**:
* **VPS 1 (`54.242.234.96` — Core y Datos):** `Backend1-Java-Negocio`, `Backend4-PHP-Recibos`, `n8n`, `PostgreSQL`, `MongoDB`, `Redis` y `RabbitMQ`.
* **VPS 2 (`100.24.9.235` — Gateway, IA y Web):** `Backend2-NestJS-Gateway`, `Backend3-Python-IA-MCP` y los **3 Micro-Frontends** (`React`, `Angular`, `Svelte`).

La forma más limpia, profesional y fácil de defender ante el docente consiste en **dividir las 3 responsabilidades que hoy viven en el VPS 2** en **nodos especializados por nube (4 Nodos en 3 Nubes: AWS + Azure + Alibaba Cloud)**:

```mermaid
flowchart LR
    subgraph ALIBABA["☁️ NUBE 3: Alibaba Cloud ECS<br/>(Capa de Presentación / Micro-Frontends)"]
        NGX["Nginx Reverse Proxy + SSL<br/>(ramio.tech)"]
        F1["Frontend 1: React 19 Portal<br/>(Shell Host + Tienda + Cotizador)"]
        F2["Frontend 2: Angular 18 Admin<br/>(Dashboard + Reportes Whisper ONNX)"]
        F3["Frontend 3: Svelte 5 Taller<br/>(Web Component <carpinteria-workshop>)"]
        NGX --> F1
        NGX --> F2
        NGX --> F3
    end

    subgraph AWS_GW["☁️ NUBE 1 (Nodo B): AWS EC2 VPS 2<br/>(Capa de Borde, SSO y Orquestación)"]
        GW["Backend 2: NestJS API Gateway<br/>(api.ramio.tech :3000)<br/>JWT + Google OIDC + Saga + WebSockets"]
        S3["AWS S3<br/>(Fotos Muebles)"]
        DYN["AWS DynamoDB<br/>(payment_logs)"]
        GW --> S3
        GW --> DYN
    end

    subgraph AZURE["☁️ NUBE 2: Microsoft Azure VM<br/>(Capa de Inteligencia Artificial y MCP)"]
        PY["Backend 3: Python FastAPI IA + MCP<br/>(Puerto :8003)<br/>YOLOv8 + EasyOCR + K-Means + Regresión ML + MCP"]
    end

    subgraph AWS_CORE["☁️ NUBE 1 (Nodo A): AWS EC2 VPS 1<br/>(Core Transaccional, Mensajería y Datos)"]
        JAVA["Backend 1: Java Spring Boot<br/>(GraphQL :8080)"]
        PHP["Backend 4: PHP Laravel<br/>(Recibos PDF :8004)"]
        N8N["n8n Workflows<br/>(:5678)"]
        PG[("PostgreSQL :5432")]
        MONGO[("MongoDB :27017")]
        REDIS[("Redis :6379")]
        RMQ[["RabbitMQ :5672"]]
        JAVA --> PG
        JAVA --> RMQ
        PHP --> RMQ
    end

    ALIBABA == "HTTPS REST / GraphQL / WSS<br/>(https://api.ramio.tech)" ==> GW
    GW == "HTTP REST Interno<br/>(AI_SERVICE_URL :8003)" ==> PY
    GW == "GraphQL / REST / AMQP / Redis" ==> AWS_CORE
    PY -. "SQL Solo Lectura (:5432)<br/>+ GraphQL (:8080)" .-> AWS_CORE
```

---

## 2. Matriz de Distribución Multi-Cloud (Qué va en cada Nube y Por Qué)

| Nodo / Proveedor Cloud | Componentes Desplegados | Puerto(s) | Justificación Arquitectónica para el Docente |
| :--- | :--- | :--- | :--- |
| **Nodo 1: AWS EC2 (VPS 1)**<br>*(Core Transaccional y Datos)* | • `Backend1-Java-Negocio` (Spring Boot)<br>• `Backend4-PHP-Recibos` (Laravel)<br>• `Automatizacion-N8N`<br>• `PostgreSQL`, `MongoDB`, `Redis`, `RabbitMQ` | `8080`, `8004`, `5678`, `5432`, `27017`, `6379`, `5672` | Mantiene los motores transaccionales (Java/PHP) junto a las bases de datos y el broker RabbitMQ en la misma VPC de AWS para **latencia de sub-milisegundo (< 1 ms)** en operaciones ACID y colas de eventos. |
| **Nodo 2: AWS EC2 (VPS 2)**<br>*(API Gateway, SSO y Sagas)* | • `Backend2-NestJS-Gateway`<br>• Conexión nativa a `AWS S3` y `AWS DynamoDB` | `3000` (expuesto en `https://api.ramio.tech`) | Actúa como **Punto Único de Entrada (Single Entry Point / BFF)** para Web y Móvil, gestionando autenticación SSO (JWT/Google OIDC), Orquestación Saga y WebSockets en tiempo real. |
| **Nodo 3: Microsoft Azure VM**<br>*(Nodo Dedicado de IA y MCP)* | • `Backend3-Python-IA-MCP` (FastAPI + YOLOv8 + EasyOCR + Scikit-Learn + Servidor MCP) | `8003` | **Aislamiento de Cómputo Pesado (CPU/RAM):** La inferencia de Visión por Computadora (YOLO/OCR) y Machine Learning consume mucha memoria y CPU. Al separarla en una VM de **Microsoft Azure**, nunca degrada el rendimiento del API Gateway ni de las bases de datos. |
| **Nodo 4: Alibaba Cloud ECS**<br>*(Cluster de Micro-Frontends Web)* | • `Nginx` + Certbot SSL<br>• `Frontend1-React-Portal`<br>• `Frontend2-Angular-Admin`<br>• `Frontend3-Svelte-Taller` | `80`, `443` (expuesto en `https://ramio.tech`) | **Desacoplamiento Total de Presentación (CDN/Edge):** Demuestra que los 3 Micro-Frontends son 100% independientes del backend y pueden servirse desde **Alibaba Cloud** consumiendo únicamente `https://api.ramio.tech`. |

> [!TIP]
> **Variante alternativa si también quieres dividir los 3 Micro-Frontends en distintas nubes:**
> Gracias a que tu arquitectura usa **Micro-Frontends con federación de activos y SSO Handoff (`?token=...`)**, incluso puedes poner:
> * `Frontend1-React-Portal` + `Frontend3-Svelte-Taller` en **Alibaba Cloud ECS** (`https://ramio.tech`).
> * `Frontend2-Angular-Admin` en **Microsoft Azure** (`https://admin.ramio.tech`) junto al servicio de IA.

---

## 3. Paso a Paso: Cómo mover `Backend3-Python-IA-MCP` a Microsoft Azure

### 3.1 Preparar la VM en Microsoft Azure (Ubuntu 24.04 LTS)
1. En el portal de Azure crea una **Virtual Machine** (`Ubuntu Server 24.04 LTS`, tamaño `Standard B2s` — 2 vCPU, 4 GB RAM).
2. En **Networking (Network Security Group)** de Azure, abre el puerto **`8003` (TCP)** (idealmente permitiendo el origen desde la IP pública de tu VPS 2 de AWS `100.24.9.235`, o `0.0.0.0/0` para pruebas).
3. En tu **VPS 1 de AWS (`54.242.234.96`)**, agrega en el Security Group de AWS la IP pública de tu nueva VM de Azure a los puertos `8080` (Java GraphQL) y `5432` (PostgreSQL Read-Only para reportes Text-to-SQL).

### 3.2 Comandos en la VM de Microsoft Azure
```bash
sudo apt update && sudo apt install -y git python3-pip python3-venv tesseract-ocr libgl1
git clone https://github.com/<TU_USUARIO>/sistema-carpinteria-web-microservicios-sw2-parcial2.git
cd ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Backend3-Python-IA-MCP

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Crea el archivo `.env` en `~/sistema-carpinteria-web-microservicios-sw2-parcial2/Backend3-Python-IA-MCP/.env` apuntando a tu VPS 1 de AWS:
```env
PORT=8003
BUSINESS_GRAPHQL_URL=http://54.242.234.96:8080/graphql
INTERNAL_SECRET=carpinteria-internal-secret-2026
POSTGRES_READONLY_DSN=postgresql://carpinteria:carpinteria123@54.242.234.96:5432/carpinteria_business
OPENAI_API_KEY=tu_api_key_opcional
GEMINI_API_KEY=tu_api_key_opcional
```

Inícialo como servicio `systemd` o con PM2:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8003
```

### 3.3 Conectar el API Gateway (AWS VPS 2) con el nodo de IA en Azure
En tu **VPS 2 de AWS (`100.24.9.235`)**, edita `~/sistema-carpinteria-web-microservicios-sw2-parcial2/Backend2-NestJS-Gateway/.env` y cambia únicamente **`AI_SERVICE_URL`**:
```env
AI_SERVICE_URL=http://<IP_PUBLICA_DE_TU_VM_AZURE>:8003
```
Y reinicia el Gateway:
```bash
pm2 restart gateway-service
```
¡Listo! Ahora cada vez que un usuario cotice un mueble con foto, use el Agente IA o genere un reporte en el Admin, el Gateway en **AWS** invocará transparentemente al motor de IA en **Microsoft Azure**.

---

## 4. Paso a Paso: Cómo desplegar los Micro-Frontends en Alibaba Cloud ECS

### 4.1 Preparar la instancia ECS en Alibaba Cloud (Ubuntu 24.04 LTS)
1. En **Alibaba Cloud Console** crea una instancia **ECS** (`Ubuntu 24.04`, 2 vCPU / 2 o 4 GB RAM).
2. En el **Security Group** de Alibaba Cloud habilita los puertos **`22` (SSH)**, **`80` (HTTP)** y **`443` (HTTPS)**.

### 4.2 Comandos en la instancia ECS de Alibaba Cloud
```bash
# 1. Instalar Node.js 20, Nginx y Certbot
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git

# 2. Clonar el repositorio
cd ~
git clone https://github.com/<TU_USUARIO>/sistema-carpinteria-web-microservicios-sw2-parcial2.git

# 3. Compilar el Micro-Frontend 3 (Svelte Taller) e inyectarlo en React Portal
cd ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend3-Svelte-Taller
npm install
npm run build:mfe
mkdir -p ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend1-React-Portal/public/mfe-taller
cp -r dist-mfe/* ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend1-React-Portal/public/mfe-taller/

# 4. Compilar el Micro-Frontend 2 (Angular Admin)
cd ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend2-Angular-Admin
npm install
npm run build

# 5. Compilar el Micro-Frontend 1 (React Portal Shell)
cd ~/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend1-React-Portal
npm install
VITE_GATEWAY_URL=https://api.ramio.tech npm run build
```

### 4.3 Configurar Nginx en Alibaba Cloud (`/etc/nginx/sites-available/carpinteria-web`)
Como en `Frontend1-React-Portal/src/api.ts`, `Frontend2-Angular-Admin/src/environments/environment.ts` y `Frontend3-Svelte-Taller/src/lib/api.ts` la URL del Gateway se resuelve automáticamente a **`https://api.ramio.tech`**, Nginx en Alibaba Cloud solo necesita servir los archivos compilados de los 3 Micro-Frontends:

```nginx
server {
    listen 80;
    server_name ramio.tech www.ramio.tech;

    root /home/ubuntu/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend1-React-Portal/dist;
    index index.html;

    # Micro-Frontend 2: Panel Administrativo Angular (/admin/)
    location ^~ /admin/ {
        alias /home/ubuntu/sistema-carpinteria-web-microservicios-sw2-parcial2/Frontend2-Angular-Admin/dist/admin-app/browser/;
        try_files $uri $uri/ /admin/index.html;
    }

    # Micro-Frontend 1 (React Shell) + Micro-Frontend 3 (Svelte Taller en /taller)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Finalmente, en tu proveedor de dominio (`ramio.tech`):
* Registro `A` de **`@` (`ramio.tech`)** y **`www`** $\rightarrow$ apunta a la **`<IP_PUBLICA_ALIBABA_CLOUD>`**.
* Registro `A` de **`api` (`api.ramio.tech`)** $\rightarrow$ sigue apuntando a la **`100.24.9.235` (AWS VPS 2)**.

---

## 5. Resumen de Defensa ante el Docente: ¿Por qué esta partición Multi-Cloud es la ideal?

1. **Separación por Perfil de Recursos (Compute vs. I/O vs. Edge):**
   * **AWS VPS 1 (Intensivo en Disco e I/O):** Bases de datos (`PostgreSQL`, `MongoDB`, `Redis`), colas (`RabbitMQ`) y transacciones del negocio (`Java Spring Boot`, `PHP Laravel`).
   * **AWS VPS 2 (Intensivo en Red y Concurrencia):** `NestJS API Gateway`, WebSockets (`Socket.IO`), SSO Federado (`Google OIDC`) y Orquestador Saga.
   * **Microsoft Azure VM (Intensivo en CPU/RAM para IA):** `Python FastAPI`, redes neuronales de visión (`YOLOv8` + `EasyOCR`), modelos `Scikit-Learn` y servidor `MCP`.
   * **Alibaba Cloud ECS (Entrega de Contenido Estático y Micro-Frontends):** `Nginx` sirviendo los bundles de `React 19`, `Angular 18` y `Svelte 5` junto con los modelos `Whisper ONNX` en el navegador.
2. **Cero Acoplamiento de Código:**
   * Mover el servicio de IA a **Azure** o los Micro-Frontends a **Alibaba Cloud** se logra **100% por configuración de variables de entorno (`.env`) y DNS**, cumpliendo el factor *III (Config)* de **The Twelve-Factor App** y los principios de **Arquitectura Hexagonal**.
