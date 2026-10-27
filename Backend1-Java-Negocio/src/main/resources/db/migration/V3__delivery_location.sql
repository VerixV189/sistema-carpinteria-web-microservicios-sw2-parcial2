-- ============================================================
-- V3: Ubicación GPS y tipo de entrega (recojo en taller / envío)
-- ============================================================

ALTER TABLE deliveries
    ADD COLUMN delivery_type VARCHAR(20) NOT NULL DEFAULT 'DELIVERY',
    ADD COLUMN latitude      NUMERIC(10,7),
    ADD COLUMN longitude     NUMERIC(10,7);

ALTER TABLE orders
    ADD COLUMN delivery_type    VARCHAR(20) NOT NULL DEFAULT 'DELIVERY',
    ADD COLUMN delivery_address VARCHAR(255),
    ADD COLUMN delivery_lat     NUMERIC(10,7),
    ADD COLUMN delivery_lng     NUMERIC(10,7);
