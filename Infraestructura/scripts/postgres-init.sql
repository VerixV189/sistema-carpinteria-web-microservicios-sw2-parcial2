-- Init completo: carpinteria + carpinteria_billing (regenerado con pg_dump)
--
-- PostgreSQL database dump
--

\restrict ZJtobZhZEFFbUA9d0vtMEVY2bPanX8dYw7BeGuSlnWy7G6BDS6B3nHPX5XtkCUd

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.production_steps DROP CONSTRAINT IF EXISTS production_steps_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_carpenters DROP CONSTRAINT IF EXISTS order_carpenters_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.order_carpenters DROP CONSTRAINT IF EXISTS order_carpenters_carpenter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_order_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_client_id_fkey;
ALTER TABLE IF EXISTS ONLY public.invoice_lines DROP CONSTRAINT IF EXISTS invoice_lines_invoice_id_fkey;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_order_id_fkey;
DROP INDEX IF EXISTS public.idx_orders_status;
DROP INDEX IF EXISTS public.idx_orders_client;
DROP INDEX IF EXISTS public.idx_deliveries_date;
DROP INDEX IF EXISTS public.idx_clients_email;
DROP INDEX IF EXISTS public.flyway_schema_history_s_idx;
ALTER TABLE IF EXISTS ONLY public.production_steps DROP CONSTRAINT IF EXISTS production_steps_pkey;
ALTER TABLE IF EXISTS ONLY public.orders DROP CONSTRAINT IF EXISTS orders_pkey;
ALTER TABLE IF EXISTS ONLY public.order_items DROP CONSTRAINT IF EXISTS order_items_pkey;
ALTER TABLE IF EXISTS ONLY public.order_carpenters DROP CONSTRAINT IF EXISTS order_carpenters_pkey;
ALTER TABLE IF EXISTS ONLY public.materials DROP CONSTRAINT IF EXISTS materials_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.invoice_lines DROP CONSTRAINT IF EXISTS invoice_lines_pkey;
ALTER TABLE IF EXISTS ONLY public.flyway_schema_history DROP CONSTRAINT IF EXISTS flyway_schema_history_pk;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_pkey;
ALTER TABLE IF EXISTS ONLY public.deliveries DROP CONSTRAINT IF EXISTS deliveries_order_id_key;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE IF EXISTS ONLY public.clients DROP CONSTRAINT IF EXISTS clients_email_key;
ALTER TABLE IF EXISTS ONLY public.carpenters DROP CONSTRAINT IF EXISTS carpenters_pkey;
ALTER TABLE IF EXISTS ONLY public.carpenters DROP CONSTRAINT IF EXISTS carpenters_email_key;
ALTER TABLE IF EXISTS public.production_steps ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.orders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.order_items ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.materials ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoice_lines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.deliveries ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.clients ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.carpenters ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.production_steps_id_seq;
DROP TABLE IF EXISTS public.production_steps;
DROP SEQUENCE IF EXISTS public.orders_id_seq;
DROP TABLE IF EXISTS public.orders;
DROP SEQUENCE IF EXISTS public.order_items_id_seq;
DROP TABLE IF EXISTS public.order_items;
DROP TABLE IF EXISTS public.order_carpenters;
DROP SEQUENCE IF EXISTS public.materials_id_seq;
DROP TABLE IF EXISTS public.materials;
DROP SEQUENCE IF EXISTS public.invoices_id_seq;
DROP TABLE IF EXISTS public.invoices;
DROP SEQUENCE IF EXISTS public.invoice_lines_id_seq;
DROP TABLE IF EXISTS public.invoice_lines;
DROP TABLE IF EXISTS public.flyway_schema_history;
DROP SEQUENCE IF EXISTS public.deliveries_id_seq;
DROP TABLE IF EXISTS public.deliveries;
DROP SEQUENCE IF EXISTS public.clients_id_seq;
DROP TABLE IF EXISTS public.clients;
DROP SEQUENCE IF EXISTS public.carpenters_id_seq;
DROP TABLE IF EXISTS public.carpenters;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: carpenters; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.carpenters (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    phone character varying(40),
    specialty character varying(60) DEFAULT 'GENERAL'::character varying NOT NULL,
    years_experience integer DEFAULT 0 NOT NULL,
    hourly_rate numeric(10,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.carpenters OWNER TO carpinteria;

--
-- Name: carpenters_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.carpenters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carpenters_id_seq OWNER TO carpinteria;

--
-- Name: carpenters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.carpenters_id_seq OWNED BY public.carpenters.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.clients (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    phone character varying(40),
    address character varying(255),
    segment character varying(40) DEFAULT 'REGULAR'::character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clients OWNER TO carpinteria;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO carpinteria;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.deliveries (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    scheduled_date date NOT NULL,
    time_slot character varying(30) DEFAULT 'MORNING'::character varying NOT NULL,
    address character varying(255),
    status character varying(30) DEFAULT 'SCHEDULED'::character varying NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.deliveries OWNER TO carpinteria;

--
-- Name: deliveries_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.deliveries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.deliveries_id_seq OWNER TO carpinteria;

--
-- Name: deliveries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.deliveries_id_seq OWNED BY public.deliveries.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO carpinteria;

--
-- Name: invoice_lines; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.invoice_lines (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    line_total numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.invoice_lines OWNER TO carpinteria;

--
-- Name: invoice_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.invoice_lines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_lines_id_seq OWNER TO carpinteria;

--
-- Name: invoice_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.invoice_lines_id_seq OWNED BY public.invoice_lines.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    invoice_number character varying(40) NOT NULL,
    client_id bigint,
    order_id bigint,
    payment_id character varying(64),
    subtotal numeric(12,2) DEFAULT 0 NOT NULL,
    tax_rate numeric(5,2) DEFAULT 16.00 NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'ISSUED'::character varying NOT NULL,
    pdf_path character varying(255),
    issued_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO carpinteria;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO carpinteria;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: materials; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.materials (
    id bigint NOT NULL,
    name character varying(120) NOT NULL,
    wood_type character varying(60),
    stock_m3 numeric(10,3) DEFAULT 0 NOT NULL,
    min_stock_m3 numeric(10,3) DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.materials OWNER TO carpinteria;

--
-- Name: materials_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.materials_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materials_id_seq OWNER TO carpinteria;

--
-- Name: materials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.materials_id_seq OWNED BY public.materials.id;


--
-- Name: order_carpenters; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.order_carpenters (
    order_id bigint NOT NULL,
    carpenter_id bigint NOT NULL,
    assigned_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.order_carpenters OWNER TO carpinteria;

--
-- Name: order_items; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.order_items (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    furniture_type character varying(60),
    wood_type character varying(60),
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) DEFAULT 0 NOT NULL,
    length_m numeric(8,3),
    width_m numeric(8,3),
    height_m numeric(8,3)
);


ALTER TABLE public.order_items OWNER TO carpinteria;

--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.order_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO carpinteria;

--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.orders (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    quotation_id character varying(64),
    description text,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    total_price numeric(12,2) DEFAULT 0 NOT NULL,
    delivery_date date,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orders OWNER TO carpinteria;

--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.orders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO carpinteria;

--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: production_steps; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.production_steps (
    id bigint NOT NULL,
    order_id bigint NOT NULL,
    name character varying(120) NOT NULL,
    status character varying(30) DEFAULT 'PENDING'::character varying NOT NULL,
    sequence integer DEFAULT 0 NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.production_steps OWNER TO carpinteria;

--
-- Name: production_steps_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.production_steps_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.production_steps_id_seq OWNER TO carpinteria;

--
-- Name: production_steps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.production_steps_id_seq OWNED BY public.production_steps.id;


--
-- Name: carpenters id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.carpenters ALTER COLUMN id SET DEFAULT nextval('public.carpenters_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: deliveries id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.deliveries ALTER COLUMN id SET DEFAULT nextval('public.deliveries_id_seq'::regclass);


--
-- Name: invoice_lines id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_lines ALTER COLUMN id SET DEFAULT nextval('public.invoice_lines_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: materials id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.materials ALTER COLUMN id SET DEFAULT nextval('public.materials_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: production_steps id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.production_steps ALTER COLUMN id SET DEFAULT nextval('public.production_steps_id_seq'::regclass);


--
-- Data for Name: carpenters; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.carpenters (id, name, email, phone, specialty, years_experience, hourly_rate, active, created_at, updated_at) FROM stdin;
1	Carlos Vargas	carlos.vargas@carpinteria.com	+591 70110001	MUEBLES	12	80.00	t	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
2	Pedro Mamani	pedro.mamani@carpinteria.com	+591 70110002	COCINAS	8	65.00	t	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
3	Luis Quispe	luis.quispe@carpinteria.com	+591 70110003	PUERTAS_VENTANAS	5	50.00	t	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
4	Jorge Salinas	jorge.salinas@carpinteria.com	+591 70110004	RESTAURACION	20	120.00	t	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.clients (id, name, email, phone, address, segment, created_at, updated_at) FROM stdin;
1	María González	maria.gonzalez@mail.com	+591 70010001	Av. Arce 123, La Paz	VIP	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
2	José Ramírez	jose.ramirez@mail.com	+591 70010002	Calle Comercio 45, Cochabamba	REGULAR	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
3	Ana Flores	ana.flores@mail.com	+591 70010003	Zona Sur Oruro	REGULAR	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
4	Hotel Los Andes	compras@hotelandes.bo	+591 70010004	Centro, Santa Cruz	VIP	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
5	Mueblería Pino	contacto@muebleriapino.bo	+591 70010005	El Alto	WHOLESALE	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
\.


--
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.deliveries (id, order_id, scheduled_date, time_slot, address, status, notes, created_at, updated_at) FROM stdin;
1	1	2026-10-31	MORNING	Av. Arce 123, La Paz	SCHEDULED	Tercer piso, sin ascensor	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
2	4	2026-10-06	AFTERNOON	Centro, Santa Cruz	DELIVERED	Entregado sin novedad	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
3	5	2026-10-26	AFTERNOON	Zona Sur Oruro	SCHEDULED	\N	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
4	3	2026-11-06	MORNING	\N	SCHEDULED	\N	2026-10-23 03:09:05.242979	2026-10-23 03:09:05.242979
5	2	2026-10-23	MORNING	\N	SCHEDULED	\N	2026-10-23 03:14:58.262001	2026-10-23 03:14:58.262001
6	6	2026-11-20	MORNING	\N	SCHEDULED	\N	2026-10-23 03:30:27.202307	2026-10-23 03:30:27.202307
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init	SQL	V1__init.sql	-1034288204	carpinteria	2026-10-21 17:23:44.509109	798	t
2	2	seed	SQL	V2__seed.sql	-1964870174	carpinteria	2026-10-21 17:23:45.442862	154	t
\.


--
-- Data for Name: invoice_lines; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.invoice_lines (id, invoice_id, description, quantity, unit_price, line_total) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.invoices (id, invoice_number, client_id, order_id, payment_id, subtotal, tax_rate, tax_amount, total, status, pdf_path, issued_at) FROM stdin;
\.


--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.materials (id, name, wood_type, stock_m3, min_stock_m3, unit_price) FROM stdin;
1	Tablón cedro 2.4m	CEDRO	4.500	2.000	950.00
2	Tablón roble 2.4m	ROBLE	1.200	2.000	1400.00
3	Placa melamina 18mm	MELAMINA	15.000	5.000	320.00
4	Tablón pino 2.4m	PINO	8.000	3.000	480.00
5	Tablón mara 2.4m	MARA	0.500	1.000	2100.00
\.


--
-- Data for Name: order_carpenters; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.order_carpenters (order_id, carpenter_id, assigned_at) FROM stdin;
1	1	2026-10-21 17:23:45.491034
3	4	2026-10-21 17:23:45.491034
4	2	2026-10-21 17:23:45.491034
5	3	2026-10-21 17:23:45.491034
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.order_items (id, order_id, description, furniture_type, wood_type, quantity, unit_price, length_m, width_m, height_m) FROM stdin;
1	1	Ropero 3 puertas	WARDROBE	CEDRO	1	8500.00	1.800	0.600	2.100
2	2	Mesa comedor	TABLE	ROBLE	1	5200.00	1.800	0.900	0.750
3	3	Mueble recepción	DESK	MARA	1	42000.00	3.200	0.800	1.100
4	4	Cocina integral	KITCHEN_CABINET	MELAMINA	1	12800.00	3.000	0.600	2.200
5	5	Estantería	BOOKSHELF	PINO	1	3600.00	1.200	0.350	2.000
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.orders (id, client_id, quotation_id, description, status, total_price, delivery_date, created_at, updated_at) FROM stdin;
1	1	\N	Ropero 3 puertas de cedro	IN_PRODUCTION	8500.00	2026-10-31	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
3	4	\N	Amueblado recepción hotel	APPROVED	42000.00	2026-11-20	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
4	2	\N	Cocina integral melamina	DELIVERED	12800.00	2026-10-06	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
5	3	\N	Estantería biblioteca pino	IN_PRODUCTION	3600.00	2026-10-26	2026-10-21 17:23:45.491034	2026-10-21 17:23:45.491034
2	1	\N	Mesa de comedor 6 personas	APPROVED	5200.00	2026-11-10	2026-10-21 17:23:45.491034	2026-10-21 23:25:43.73714
6	1	quo-test-1	Mesa de comedor roble	PENDING	0.00	\N	2026-10-22 19:24:21.194643	2026-10-22 19:24:21.194667
\.


--
-- Data for Name: production_steps; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.production_steps (id, order_id, name, status, sequence, completed_at) FROM stdin;
1	1	Corte de madera	COMPLETED	1	2026-10-19 17:23:45.491034
2	1	Armado de estructura	IN_PROGRESS	2	\N
3	1	Lijado y barnizado	PENDING	3	\N
4	4	Entrega e instalación	COMPLETED	4	2026-10-06 17:23:45.491034
\.


--
-- Name: carpenters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.carpenters_id_seq', 4, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.clients_id_seq', 5, true);


--
-- Name: deliveries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.deliveries_id_seq', 6, true);


--
-- Name: invoice_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.invoice_lines_id_seq', 1, false);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.invoices_id_seq', 1, false);


--
-- Name: materials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.materials_id_seq', 5, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.order_items_id_seq', 5, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.orders_id_seq', 6, true);


--
-- Name: production_steps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.production_steps_id_seq', 4, true);


--
-- Name: carpenters carpenters_email_key; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.carpenters
    ADD CONSTRAINT carpenters_email_key UNIQUE (email);


--
-- Name: carpenters carpenters_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.carpenters
    ADD CONSTRAINT carpenters_pkey PRIMARY KEY (id);


--
-- Name: clients clients_email_key; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_order_id_key; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_order_id_key UNIQUE (order_id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: invoice_lines invoice_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_lines
    ADD CONSTRAINT invoice_lines_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: materials materials_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.materials
    ADD CONSTRAINT materials_pkey PRIMARY KEY (id);


--
-- Name: order_carpenters order_carpenters_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_carpenters
    ADD CONSTRAINT order_carpenters_pkey PRIMARY KEY (order_id, carpenter_id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: production_steps production_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.production_steps
    ADD CONSTRAINT production_steps_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_clients_email; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX idx_clients_email ON public.clients USING btree (email);


--
-- Name: idx_deliveries_date; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX idx_deliveries_date ON public.deliveries USING btree (scheduled_date);


--
-- Name: idx_orders_client; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX idx_orders_client ON public.orders USING btree (client_id);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: deliveries deliveries_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: invoice_lines invoice_lines_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_lines
    ADD CONSTRAINT invoice_lines_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: invoices invoices_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_carpenters order_carpenters_carpenter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_carpenters
    ADD CONSTRAINT order_carpenters_carpenter_id_fkey FOREIGN KEY (carpenter_id) REFERENCES public.carpenters(id);


--
-- Name: order_carpenters order_carpenters_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_carpenters
    ADD CONSTRAINT order_carpenters_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: orders orders_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: production_steps production_steps_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.production_steps
    ADD CONSTRAINT production_steps_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZJtobZhZEFFbUA9d0vtMEVY2bPanX8dYw7BeGuSlnWy7G6BDS6B3nHPX5XtkCUd


CREATE DATABASE carpinteria_billing;
\connect carpinteria_billing
--
-- PostgreSQL database dump
--

\restrict Sr7tGjst1x9y5K9SMHEvvsxDO0d5bxxuvY6GbzqfbwNdZP7zB46HjvbBbX4NXlJ

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_invoice_id_foreign;
DROP INDEX IF EXISTS public.invoices_client_email_status_index;
ALTER TABLE IF EXISTS ONLY public.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices DROP CONSTRAINT IF EXISTS invoices_number_unique;
ALTER TABLE IF EXISTS ONLY public.invoice_items DROP CONSTRAINT IF EXISTS invoice_items_pkey;
ALTER TABLE IF EXISTS public.migrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoices ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.invoice_items ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.migrations_id_seq;
DROP TABLE IF EXISTS public.migrations;
DROP SEQUENCE IF EXISTS public.invoices_id_seq;
DROP TABLE IF EXISTS public.invoices;
DROP SEQUENCE IF EXISTS public.invoice_items_id_seq;
DROP TABLE IF EXISTS public.invoice_items;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.invoice_items (
    id bigint NOT NULL,
    invoice_id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    line_total numeric(12,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoice_items OWNER TO carpinteria;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.invoice_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoice_items_id_seq OWNER TO carpinteria;

--
-- Name: invoice_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.invoice_items_id_seq OWNED BY public.invoice_items.id;


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.invoices (
    id bigint NOT NULL,
    number bigint NOT NULL,
    series character varying(5) DEFAULT 'A'::character varying NOT NULL,
    client_name character varying(255) NOT NULL,
    client_nit character varying(20) DEFAULT '0'::character varying NOT NULL,
    client_email character varying(255),
    order_id bigint,
    payment_id character varying(255),
    subtotal numeric(12,2) NOT NULL,
    tax numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    status character varying(20) DEFAULT 'ISSUED'::character varying NOT NULL,
    issued_at timestamp(0) without time zone,
    pdf_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.invoices OWNER TO carpinteria;

--
-- Name: invoices_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.invoices_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.invoices_id_seq OWNER TO carpinteria;

--
-- Name: invoices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.invoices_id_seq OWNED BY public.invoices.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: carpinteria
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO carpinteria;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: carpinteria
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO carpinteria;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: carpinteria
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: invoice_items id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_items ALTER COLUMN id SET DEFAULT nextval('public.invoice_items_id_seq'::regclass);


--
-- Name: invoices id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices ALTER COLUMN id SET DEFAULT nextval('public.invoices_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.invoice_items (id, invoice_id, description, quantity, unit_price, line_total, created_at, updated_at) FROM stdin;
1	1	Ropero 3 puertas - madera pino	1.00	3200.00	3200.00	2026-10-21 17:13:14	2026-10-21 17:13:14
2	2	Pedido #?	1.00	4750.00	4750.00	2026-10-21 18:31:18	2026-10-21 18:31:18
3	3	Pedido #?	1.00	4800.00	4800.00	2026-10-21 18:31:40	2026-10-21 18:31:40
4	37	Pedido #1	1.00	4500.00	4500.00	2026-10-22 15:24:04	2026-10-22 15:24:04
5	38	Pedido #?	1.00	4800.00	4800.00	2026-10-22 15:54:56	2026-10-22 15:54:56
6	40	Pedido #?	1.00	3200.00	3200.00	2026-10-22 16:08:05	2026-10-22 16:08:05
7	42	Pedido #?	1.00	6100.00	6100.00	2026-10-22 16:20:19	2026-10-22 16:20:19
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.invoices (id, number, series, client_name, client_nit, client_email, order_id, payment_id, subtotal, tax, total, status, issued_at, pdf_path, created_at, updated_at) FROM stdin;
1	1	A	María López	4567890	maria@example.com	\N	\N	3200.00	416.00	3616.00	ISSUED	2026-10-21 17:13:13	\N	2026-10-21 17:13:13	2026-10-21 17:13:13
2	2	A	Cliente	0	\N	\N	pay-06a21fac-d317-4132-a9d7-4645b862a9ba	4750.00	617.50	5367.50	ISSUED	2026-10-21 18:31:18	receipts/A-2.pdf	2026-10-21 18:31:18	2026-10-21 18:31:33
3	3	A	Cliente	0	\N	\N	pay-969e6840-0e8d-406b-9da8-8502d1d164e4	4800.00	624.00	5424.00	ISSUED	2026-10-21 18:31:40	receipts/A-3.pdf	2026-10-21 18:31:40	2026-10-21 18:31:40
37	4	A	Ana L�pez	0	ana@cliente.com	1	pay-test-1	4500.00	585.00	5085.00	ISSUED	2026-10-22 15:24:04	receipts/A-4.pdf	2026-10-22 15:24:04	2026-10-22 15:24:06
38	5	A	Cliente	0	\N	\N	pay-1e876d92-eff9-49be-aa59-eb8b5fbac9c5	4800.00	624.00	5424.00	ISSUED	2026-10-22 15:54:56	receipts/A-5.pdf	2026-10-22 15:54:56	2026-10-22 15:54:58
40	6	A	Cliente	0	\N	\N	pay-995dfa57-abb9-4c76-9a59-453611a81b87	3200.00	416.00	3616.00	ISSUED	2026-10-22 16:08:05	receipts/A-6.pdf	2026-10-22 16:08:05	2026-10-22 16:08:06
42	7	A	Cliente	0	\N	\N	pay-e73c8879-a8aa-40fa-a2ac-ab1e247025a8	6100.00	793.00	6893.00	ISSUED	2026-10-22 16:20:19	receipts/A-7.pdf	2026-10-22 16:20:19	2026-10-22 16:20:20
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: carpinteria
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	2024_01_01_000001_create_invoices_table	1
2	2024_01_01_000002_create_invoice_items_table	1
\.


--
-- Name: invoice_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.invoice_items_id_seq', 7, true);


--
-- Name: invoices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.invoices_id_seq', 44, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: carpinteria
--

SELECT pg_catalog.setval('public.migrations_id_seq', 2, true);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_number_unique; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_number_unique UNIQUE (number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: invoices_client_email_status_index; Type: INDEX; Schema: public; Owner: carpinteria
--

CREATE INDEX invoices_client_email_status_index ON public.invoices USING btree (client_email, status);


--
-- Name: invoice_items invoice_items_invoice_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: carpinteria
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_invoice_id_foreign FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Sr7tGjst1x9y5K9SMHEvvsxDO0d5bxxuvY6GbzqfbwNdZP7zB46HjvbBbX4NXlJ


--
-- Rol read-only para Text-to-SQL (ai-service CU7). Nunca superuser.
--
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='carpinteria_ro') THEN
    CREATE ROLE carpinteria_ro LOGIN PASSWORD 'carpinteria_ro_dev';
  END IF;
END $$;
GRANT CONNECT ON DATABASE carpinteria TO carpinteria_ro;
GRANT USAGE ON SCHEMA public TO carpinteria_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO carpinteria_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO carpinteria_ro;
