-- ============================================================
-- V2: Datos semilla mínimos para demo
-- ============================================================

INSERT INTO clients (name, email, phone, address, segment) VALUES
  ('María González', 'maria.gonzalez@mail.com', '+591 70010001', 'Av. Arce 123, La Paz', 'VIP'),
  ('José Ramírez',   'jose.ramirez@mail.com',   '+591 70010002', 'Calle Comercio 45, Cochabamba', 'REGULAR'),
  ('Ana Flores',     'ana.flores@mail.com',     '+591 70010003', 'Zona Sur Oruro', 'REGULAR'),
  ('Hotel Los Andes', 'compras@hotelandes.bo',  '+591 70010004', 'Centro, Santa Cruz', 'VIP'),
  ('Mueblería Pino', 'contacto@muebleriapino.bo','+591 70010005', 'El Alto', 'WHOLESALE');

INSERT INTO carpenters (name, email, phone, specialty, years_experience, hourly_rate) VALUES
  ('Carlos Vargas',  'carlos.vargas@carpinteria.com',  '+591 70110001', 'MUEBLES', 12, 80.00),
  ('Pedro Mamani',   'pedro.mamani@carpinteria.com',   '+591 70110002', 'COCINAS', 8, 65.00),
  ('Luis Quispe',    'luis.quispe@carpinteria.com',    '+591 70110003', 'PUERTAS_VENTANAS', 5, 50.00),
  ('Jorge Salinas',  'jorge.salinas@carpinteria.com',  '+591 70110004', 'RESTAURACION', 20, 120.00);

INSERT INTO orders (client_id, description, status, total_price, delivery_date) VALUES
  (1, 'Ropero 3 puertas de cedro', 'IN_PRODUCTION', 8500.00, CURRENT_DATE + 10),
  (1, 'Mesa de comedor 6 personas', 'PENDING', 5200.00, CURRENT_DATE + 20),
  (4, 'Amueblado recepción hotel',  'APPROVED', 42000.00, CURRENT_DATE + 30),
  (2, 'Cocina integral melamina',   'DELIVERED', 12800.00, CURRENT_DATE - 15),
  (3, 'Estantería biblioteca pino', 'IN_PRODUCTION', 3600.00, CURRENT_DATE + 5);

INSERT INTO order_items (order_id, description, furniture_type, wood_type, quantity, unit_price, length_m, width_m, height_m) VALUES
  (1, 'Ropero 3 puertas', 'WARDROBE', 'CEDRO', 1, 8500.00, 1.8, 0.6, 2.1),
  (2, 'Mesa comedor', 'TABLE', 'ROBLE', 1, 5200.00, 1.8, 0.9, 0.75),
  (3, 'Mueble recepción', 'DESK', 'MARA', 1, 42000.00, 3.2, 0.8, 1.1),
  (4, 'Cocina integral', 'KITCHEN_CABINET', 'MELAMINA', 1, 12800.00, 3.0, 0.6, 2.2),
  (5, 'Estantería', 'BOOKSHELF', 'PINO', 1, 3600.00, 1.2, 0.35, 2.0);

INSERT INTO order_carpenters (order_id, carpenter_id) VALUES (1, 1), (3, 4), (4, 2), (5, 3);

INSERT INTO production_steps (order_id, name, status, sequence, completed_at) VALUES
  (1, 'Corte de madera', 'COMPLETED', 1, NOW() - interval '2 days'),
  (1, 'Armado de estructura', 'IN_PROGRESS', 2, NULL),
  (1, 'Lijado y barnizado', 'PENDING', 3, NULL),
  (4, 'Entrega e instalación', 'COMPLETED', 4, NOW() - interval '15 days');

INSERT INTO deliveries (order_id, scheduled_date, time_slot, address, status, notes) VALUES
  (1, CURRENT_DATE + 10, 'MORNING', 'Av. Arce 123, La Paz', 'SCHEDULED', 'Tercer piso, sin ascensor'),
  (4, CURRENT_DATE - 15, 'AFTERNOON', 'Centro, Santa Cruz', 'DELIVERED', 'Entregado sin novedad'),
  (5, CURRENT_DATE + 5, 'AFTERNOON', 'Zona Sur Oruro', 'SCHEDULED', NULL);

INSERT INTO materials (name, wood_type, stock_m3, min_stock_m3, unit_price) VALUES
  ('Tablón cedro 2.4m',  'CEDRO', 4.5, 2.0, 950.00),
  ('Tablón roble 2.4m',  'ROBLE', 1.2, 2.0, 1400.00),
  ('Placa melamina 18mm','MELAMINA', 15.0, 5.0, 320.00),
  ('Tablón pino 2.4m',   'PINO', 8.0, 3.0, 480.00),
  ('Tablón mara 2.4m',   'MARA', 0.5, 1.0, 2100.00);
