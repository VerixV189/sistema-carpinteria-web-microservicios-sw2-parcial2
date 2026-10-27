-- ============================================================
-- V1: Esquema inicial — Gestión Empresarial (CU1, CU2, CU4)
-- ============================================================

CREATE TABLE clients (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    email       VARCHAR(160) NOT NULL UNIQUE,
    phone       VARCHAR(40),
    address     VARCHAR(255),
    segment     VARCHAR(40) DEFAULT 'REGULAR',
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE carpenters (
    id               BIGSERIAL PRIMARY KEY,
    name             VARCHAR(120) NOT NULL,
    email            VARCHAR(160) NOT NULL UNIQUE,
    phone            VARCHAR(40),
    specialty        VARCHAR(60) NOT NULL DEFAULT 'GENERAL',
    years_experience INT NOT NULL DEFAULT 0,
    hourly_rate      NUMERIC(10,2) NOT NULL DEFAULT 0,
    active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id            BIGSERIAL PRIMARY KEY,
    client_id     BIGINT NOT NULL REFERENCES clients(id),
    quotation_id  VARCHAR(64),
    description   TEXT,
    status        VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    total_price   NUMERIC(12,2) NOT NULL DEFAULT 0,
    delivery_date DATE,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id             BIGSERIAL PRIMARY KEY,
    order_id       BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    description    VARCHAR(255) NOT NULL,
    furniture_type VARCHAR(60),
    wood_type      VARCHAR(60),
    quantity       INT NOT NULL DEFAULT 1,
    unit_price     NUMERIC(12,2) NOT NULL DEFAULT 0,
    length_m       NUMERIC(8,3),
    width_m        NUMERIC(8,3),
    height_m       NUMERIC(8,3)
);

CREATE TABLE order_carpenters (
    order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    carpenter_id BIGINT NOT NULL REFERENCES carpenters(id),
    assigned_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (order_id, carpenter_id)
);

CREATE TABLE production_steps (
    id           BIGSERIAL PRIMARY KEY,
    order_id     BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name         VARCHAR(120) NOT NULL,
    status       VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sequence     INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMP
);

CREATE TABLE deliveries (
    id             BIGSERIAL PRIMARY KEY,
    order_id       BIGINT NOT NULL REFERENCES orders(id) UNIQUE,
    scheduled_date DATE NOT NULL,
    time_slot      VARCHAR(30) NOT NULL DEFAULT 'MORNING',
    address        VARCHAR(255),
    status         VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    notes          TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE materials (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    wood_type     VARCHAR(60),
    stock_m3      NUMERIC(10,3) NOT NULL DEFAULT 0,
    min_stock_m3  NUMERIC(10,3) NOT NULL DEFAULT 1,
    unit_price    NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Facturas (pobladas por billing-service; las lee el reporte CU7)
CREATE TABLE IF NOT EXISTS invoices (
    id            BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(40) NOT NULL UNIQUE,
    client_id     BIGINT REFERENCES clients(id),
    order_id      BIGINT REFERENCES orders(id),
    payment_id    VARCHAR(64),
    subtotal      NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate      NUMERIC(5,2) NOT NULL DEFAULT 16.00,
    tax_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    total         NUMERIC(12,2) NOT NULL DEFAULT 0,
    status        VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    pdf_path      VARCHAR(255),
    issued_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_lines (
    id          BIGSERIAL PRIMARY KEY,
    invoice_id  BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_total  NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_deliveries_date ON deliveries(scheduled_date);
CREATE INDEX idx_clients_email ON clients(email);
