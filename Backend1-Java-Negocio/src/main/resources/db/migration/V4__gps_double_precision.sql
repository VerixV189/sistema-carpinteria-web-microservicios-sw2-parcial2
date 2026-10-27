-- ============================================================
-- V4: columnas GPS como DOUBLE PRECISION (lo que valida Hibernate
-- para campos Double; NUMERIC rompía el schema-validation).
-- ============================================================

ALTER TABLE deliveries
    ALTER COLUMN latitude  TYPE DOUBLE PRECISION,
    ALTER COLUMN longitude TYPE DOUBLE PRECISION;

ALTER TABLE orders
    ALTER COLUMN delivery_lat TYPE DOUBLE PRECISION,
    ALTER COLUMN delivery_lng TYPE DOUBLE PRECISION;
