# Inicio de Sesión Único (SSO — Single Sign-On) en el Proyecto
**Sistema de Gestión Empresarial — Carpintería Artesanal «El Roble» (SW2)**

---

## 1. ¿Cuántos tipos de Inicio de Sesión Único (SSO) existen?

En Ingeniería de Software y Ciberseguridad existen **5 tipos principales de SSO**, clasificados según el protocolo y la arquitectura donde se aplican:

| # | Tipo de SSO | Protocolo / Mecanismo | ¿Dónde se usa principalmente? |
| :-: | :--- | :--- | :--- |
| **1** | **SSO Basado en Tokens Centralizados y Propagación en API Gateway** *(Implementado en tu proyecto)* | **JWT (JSON Web Token — RFC 7519)** + Redis + *Token Handoff* / *Identity Propagation* | Arquitecturas de **Microservicios y Microfrontends** propias de una organización (Web React/Angular/Svelte + App Móvil Flutter). |
| **2** | **SSO Federado Moderno (Identidad Social y Cloud)** | **OpenID Connect (OIDC) sobre OAuth 2.0** | Botones *"Iniciar sesión con Google / Microsoft / GitHub"*, Auth0, Firebase Auth, AWS Cognito, Keycloak. |
| **3** | **SSO Empresarial Corporativo ( XML Federado )** | **SAML 2.0** (*Security Assertion Markup Language*) | Portales corporativos, bancos, universidades e integraciones B2B (Okta, Azure AD / Entra ID, PingIdentity). |
| **4** | **SSO por Cookie de Dominio Compartido / Reverse Proxy** | `Set-Cookie: Domain=.ramio.tech; HttpOnly; Secure` + Nginx / Envoy Auth Request | Subdominios web bajo un mismo dominio raíz (`ramio.tech`, `admin.ramio.tech`, `taller.ramio.tech`). |
| **5** | **SSO de Red Local / Directorio Activo (Intranet)** | **Kerberos / LDAP / NTLM** (Tickets de sesión de SO) | Redes internas Windows Server (Active Directory) donde al iniciar sesión en la PC ya entras sin clave a los sistemas internos. |

---

## 2. ¿Cómo YA está implementado el Inicio de Sesión Único (SSO) en tu proyecto?

Tu proyecto **YA implementa un esquema completo de Inicio de Sesión Único (Tipo 1)** en dos niveles: **SSO entre Microfrontends** y **SSO entre Microservicios**.

### 2.1. Nivel 1: SSO entre los 3 Microfrontends (`React`, `Angular` y `Svelte`)
Aunque el sistema web está compuesto por **3 aplicaciones construidas en 3 frameworks distintos** (`Frontend1-React-Portal`, `Frontend2-Angular-Admin` y `Frontend3-Svelte-Taller`), el usuario **inicia sesión una sola vez** en `https://ramio.tech/login` y queda autenticado automáticamente en los 3:

1. **Almacén de Sesión Unificado (`carpinteria_session`):**
   - [`Frontend1-React-Portal/src/auth.ts`](../Frontend1-React-Portal/src/auth.ts)
   - [`Frontend2-Angular-Admin/src/app/auth.service.ts`](../Frontend2-Angular-Admin/src/app/auth.service.ts)
   - [`Frontend3-Svelte-Taller/src/lib/auth.ts`](../Frontend3-Svelte-Taller/src/lib/auth.ts)
   - Los tres microfrontends leen y validan exactamente el mismo contrato de sesión `{ token, email, role }` y verifican la expiración del payload JWT (`exp * 1000 < Date.now()`).
2. **Mecanismo de *Token Handoff* entre dominios/puertos (`acceptHandoff()`):**
   - Cuando un microfrontend corre en un subdominio o puerto independiente (`admin.ramio.tech` / `:4202` o `taller.ramio.tech` / `:4203`), el portal le transfiere la sesión por URL (`?token=...&email=...`).
   - El método `acceptHandoff()` en [`auth.service.ts` (líneas 56–74)](../Frontend2-Angular-Admin/src/app/auth.service.ts) y [`auth.ts` (líneas 54–64)](../Frontend3-Svelte-Taller/src/lib/auth.ts) captura el token, lo persiste en su almacenamiento local y limpia la URL con `window.history.replaceState` para no exponer el token en la barra de direcciones.

### 2.2. Nivel 2: SSO entre los 4 Microservicios Backend (*Token Offloading & Identity Propagation*)
El usuario **no tiene que autenticarse por separado** contra Java (Negocio), Python (IA) ni PHP (Recibos).
* **Archivo clave:** [`Backend2-NestJS-Gateway/src/proxy/proxy.factory.ts` (líneas 35–91)](../Backend2-NestJS-Gateway/src/proxy/proxy.factory.ts)
* **Cómo funciona:**
  1. El cliente se autentica una sola vez en `POST /auth/login` del Gateway (`NestJS` + `Redis`).
  2. En cada petición hacia cualquier microservicio (`/graphql`, `/api/ai/*`, `/api/invoices/*`), el Gateway intercepta la llamada en `jwtGuard()`:
     - Primero **elimina cualquier cabecera falsificada** que pudiera enviar un atacante (`stripIdentityHeaders`: borra `x-user-id`, `x-user-email`, `x-user-role`, `x-internal-secret`).
     - Verifica la firma criptográfica del JWT (`JwtVerifyService`) y evalúa la matriz de control de acceso basado en roles (**RBAC**).
     - **Propaga la identidad verificada** inyectando en la petición interna hacia Java, Python o PHP las cabeceras confiables:
       ```ts
       req.headers['x-user-id'] = payload.sub;
       req.headers['x-user-email'] = payload.email;
       req.headers['x-user-role'] = payload.role;
       req.headers['x-internal-secret'] = internalSecret;
       ```

---

## 3. ¿Cómo se podría agregar un SSO Federado Externo (OAuth 2.0 / OpenID Connect, ej. "Iniciar sesión con Google" o Keycloak)?

Si en la defensa te preguntan **«¿Cómo escalarías tu login actual a un SSO Federado con Google, Microsoft o Keycloak?»**, gracias a tu arquitectura centralizada en el **API Gateway**, **no tendrías que tocar ni Java, ni Python, ni PHP**:

1. **En `Backend2-NestJS-Gateway` (`src/auth/`):**
   - Se agrega la estrategia Passport OIDC/OAuth2 (`passport-google-oauth20` o `passport-openidconnect`) con dos rutas en `AuthController`:
     - `GET /auth/sso/google`: Redirige al proveedor de identidad (IdP).
     - `GET /auth/sso/google/callback`: Recibe el perfil verificado (`email`, `name`), busca o auto-crea el usuario en `UsersService` (`Redis` + ficha en `PostgreSQL`) y emite el mismo JWT interno con `this.tokenFor(user)`.
2. **En `Frontend1-React-Portal` (`LoginPage.tsx`) y App Móvil (`Flutter`):**
   - Se añade el botón **"Continuar con Google / SSO Institucional"** que redirige a `https://api.ramio.tech/auth/sso/google`, recibe el JWT en el callback y llama a `saveSession(token, email)`.
3. **Impacto cero en el resto de microservicios:**
   - Como `proxy.factory.ts` traduce el JWT a las cabeceras `x-user-*` y `x-internal-secret`, los microservicios en **Java**, **Python** y **PHP** siguen funcionando sin cambiar una sola línea de código.
