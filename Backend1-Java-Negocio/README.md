# business-service

Gestión Empresarial — **Java 21 + Spring Boot 3 + GraphQL (Netflix DGS)**.
Cubre **CU1** (Clientes), **CU2** (Carpinteros) y **CU4** (Pedidos/Entregas).

- Arquitectura hexagonal: `domain/` (puro) · `application/` (use cases) · `infrastructure/` (adaptadores)
- GraphQL `/graphql` + GraphiQL `/graphiql` + subscriptions WS `/subscriptions`
- REST inter-service `/api/internal/*` (consultado por ai-service/MCP)
- Flyway en `src/main/resources/db/migration`
- RabbitMQ: publica `order.created`, `order.status_changed`, `client.registered`, `material.low_stock`; consume `quotation.approved`, `payment.completed`

## Dev

```bash
cp .env.example .env
./gradlew bootRun          # :8080
# Windows: gradlew.bat bootRun
```

GraphiQL: `http://localhost:8080/graphiql`

```graphql
mutation { createClient(input: {name:"Ana", email:"ana@x.com"}) { id name } }
subscription { orderStatusChanged { id status } }
```

## Docker

```bash
docker build -t carpinteria/business-service .
docker run -p 8080:8080 --env-file .env carpinteria/business-service
```
