--
-- PostgreSQL database dump
--

\restrict dtWfIWTPBF45m9CvMbuDdEkjPiuYhVumNYfyyoLOA8xSpaRneZepYAOIl4ZrNvE

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aprendiz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprendiz (
    id_aprendiz integer NOT NULL,
    documento character varying(10) NOT NULL,
    nombre character varying(100) NOT NULL,
    apellido character varying(100) NOT NULL,
    id_formacion integer NOT NULL,
    fecha_registro timestamp without time zone DEFAULT now(),
    estado boolean DEFAULT true
);


ALTER TABLE public.aprendiz OWNER TO postgres;

--
-- Name: aprendiz_computador; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprendiz_computador (
    id integer NOT NULL,
    id_aprendiz integer,
    id_computador integer,
    principal boolean DEFAULT false,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aprendiz_computador OWNER TO postgres;

--
-- Name: aprendiz_computador_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aprendiz_computador_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aprendiz_computador_id_seq OWNER TO postgres;

--
-- Name: aprendiz_computador_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aprendiz_computador_id_seq OWNED BY public.aprendiz_computador.id;


--
-- Name: aprendiz_id_aprendiz_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aprendiz_id_aprendiz_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aprendiz_id_aprendiz_seq OWNER TO postgres;

--
-- Name: aprendiz_id_aprendiz_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aprendiz_id_aprendiz_seq OWNED BY public.aprendiz.id_aprendiz;


--
-- Name: aprendiz_vehiculo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprendiz_vehiculo (
    id integer NOT NULL,
    id_aprendiz integer,
    id_vehiculo integer,
    principal boolean DEFAULT false,
    fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.aprendiz_vehiculo OWNER TO postgres;

--
-- Name: aprendiz_vehiculo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aprendiz_vehiculo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aprendiz_vehiculo_id_seq OWNER TO postgres;

--
-- Name: aprendiz_vehiculo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aprendiz_vehiculo_id_seq OWNED BY public.aprendiz_vehiculo.id;


--
-- Name: computadores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.computadores (
    id_computador integer NOT NULL,
    serial character varying(50) NOT NULL,
    marca character varying(50) NOT NULL,
    activo boolean DEFAULT true
);


ALTER TABLE public.computadores OWNER TO postgres;

--
-- Name: computadores_id_computador_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.computadores_id_computador_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.computadores_id_computador_seq OWNER TO postgres;

--
-- Name: computadores_id_computador_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.computadores_id_computador_seq OWNED BY public.computadores.id_computador;


--
-- Name: detalles_ingreso; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_ingreso (
    id_ingreso integer NOT NULL,
    id_aprendiz integer NOT NULL,
    id_detallemaquina integer,
    hora_ingreso timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.detalles_ingreso OWNER TO postgres;

--
-- Name: detalles_ingreso_id_ingreso_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalles_ingreso_id_ingreso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalles_ingreso_id_ingreso_seq OWNER TO postgres;

--
-- Name: detalles_ingreso_id_ingreso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalles_ingreso_id_ingreso_seq OWNED BY public.detalles_ingreso.id_ingreso;


--
-- Name: detalles_maquinas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_maquinas (
    id_detallemaquina integer NOT NULL,
    id_computador integer,
    id_vehiculo integer,
    firma_ingreso text NOT NULL,
    firma_salida text,
    estado_equipo character varying(20) DEFAULT 'dentro'::character varying,
    hora_retiro_equipo timestamp without time zone,
    CONSTRAINT detalles_maquinas_estado_equipo_check CHECK (((estado_equipo)::text = ANY ((ARRAY['dentro'::character varying, 'retirado'::character varying])::text[])))
);


ALTER TABLE public.detalles_maquinas OWNER TO postgres;

--
-- Name: detalles_maquinas_id_detallemaquina_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalles_maquinas_id_detallemaquina_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalles_maquinas_id_detallemaquina_seq OWNER TO postgres;

--
-- Name: detalles_maquinas_id_detallemaquina_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalles_maquinas_id_detallemaquina_seq OWNED BY public.detalles_maquinas.id_detallemaquina;


--
-- Name: detalles_salida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalles_salida (
    id_salida integer NOT NULL,
    id_ingreso integer NOT NULL,
    hora_salida timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.detalles_salida OWNER TO postgres;

--
-- Name: detalles_salida_id_salida_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalles_salida_id_salida_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalles_salida_id_salida_seq OWNER TO postgres;

--
-- Name: detalles_salida_id_salida_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalles_salida_id_salida_seq OWNED BY public.detalles_salida.id_salida;


--
-- Name: formaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formaciones (
    id_formacion integer NOT NULL,
    nombre character varying(100) NOT NULL,
    nivel character varying(15) NOT NULL
);


ALTER TABLE public.formaciones OWNER TO postgres;

--
-- Name: formaciones_id_formacion_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formaciones_id_formacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formaciones_id_formacion_seq OWNER TO postgres;

--
-- Name: formaciones_id_formacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formaciones_id_formacion_seq OWNED BY public.formaciones.id_formacion;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_rol_seq OWNER TO postgres;

--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(120) NOT NULL,
    password text NOT NULL,
    id_rol integer NOT NULL,
    activo boolean DEFAULT true,
    creado_en timestamp without time zone DEFAULT now(),
    ultimo_login timestamp without time zone
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_usuario_seq OWNER TO postgres;

--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id_vehiculo integer NOT NULL,
    tipo_vehiculo character varying(255),
    placa character varying(10) NOT NULL,
    modelo character varying(50) NOT NULL
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- Name: vehiculos_id_vehiculo_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_vehiculo_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_vehiculo_seq OWNER TO postgres;

--
-- Name: vehiculos_id_vehiculo_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_vehiculo_seq OWNED BY public.vehiculos.id_vehiculo;


--
-- Name: aprendiz id_aprendiz; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz ALTER COLUMN id_aprendiz SET DEFAULT nextval('public.aprendiz_id_aprendiz_seq'::regclass);


--
-- Name: aprendiz_computador id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_computador ALTER COLUMN id SET DEFAULT nextval('public.aprendiz_computador_id_seq'::regclass);


--
-- Name: aprendiz_vehiculo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_vehiculo ALTER COLUMN id SET DEFAULT nextval('public.aprendiz_vehiculo_id_seq'::regclass);


--
-- Name: computadores id_computador; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.computadores ALTER COLUMN id_computador SET DEFAULT nextval('public.computadores_id_computador_seq'::regclass);


--
-- Name: detalles_ingreso id_ingreso; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_ingreso ALTER COLUMN id_ingreso SET DEFAULT nextval('public.detalles_ingreso_id_ingreso_seq'::regclass);


--
-- Name: detalles_maquinas id_detallemaquina; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_maquinas ALTER COLUMN id_detallemaquina SET DEFAULT nextval('public.detalles_maquinas_id_detallemaquina_seq'::regclass);


--
-- Name: detalles_salida id_salida; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_salida ALTER COLUMN id_salida SET DEFAULT nextval('public.detalles_salida_id_salida_seq'::regclass);


--
-- Name: formaciones id_formacion; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones ALTER COLUMN id_formacion SET DEFAULT nextval('public.formaciones_id_formacion_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Name: vehiculos id_vehiculo; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id_vehiculo SET DEFAULT nextval('public.vehiculos_id_vehiculo_seq'::regclass);


--
-- Data for Name: aprendiz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz (id_aprendiz, documento, nombre, apellido, id_formacion, fecha_registro, estado) FROM stdin;
1	1117784339	Jhonatan	Castro Calderón	1	2026-06-11 13:27:42.785881	t
2	1051065897	Luis Esteban	Morales Gasca	1	2026-06-11 13:27:42.785881	t
3	1117496648	Manuel Andres	Cardenas Suarez	1	2026-06-11 13:27:42.785881	t
4	1006510328	Daniel Felipe	Vera Perdomo	1	2026-06-11 13:27:42.785881	t
5	1118368446	Juan David	Trujillo Naranjo	1	2026-06-11 13:27:42.785881	t
6	1117511568	Jhoan Steven	Zambrano Vera	1	2026-06-11 13:27:42.785881	t
7	1118364706	Patrick Damian	Ortiz Hernández	1	2026-06-11 13:27:42.785881	t
8	1117497987	Estefany	Cuellar Anturi	1	2026-06-11 13:27:42.785881	t
9	1118471476	Jaiber Julian	Gutierrez Rivera	1	2026-06-11 13:27:42.785881	t
10	1099742508	Jorge Alejandro	Peña Motta	1	2026-06-11 13:27:42.785881	t
11	1116205722	Ingri Julieth	Gasca Tenorio	1	2026-06-11 13:27:42.785881	t
12	1084331945	Andrés Julián	Cruz Hernández	1	2026-06-11 13:27:42.785881	t
13	1006508852	Cristian	Cantillo Mejia	1	2026-06-11 13:27:42.785881	t
14	1006508766	Ibsen Alexis	Soto Artunduaga	1	2026-06-11 13:27:42.785881	t
15	1006419673	Brayan Stiven	Hoyos Cespedes	1	2026-06-11 13:27:42.785881	t
16	1118367962	Santiago	Lizcano Suárez	1	2026-06-11 13:27:42.785881	t
17	1115942896	Yefry	Serna Puentes	1	2026-06-11 13:27:42.785881	t
18	1120498200	Anggie Marcela	Olmos Bernal	1	2026-06-11 13:27:42.785881	t
19	1122726863	William Santiago	Barrero Romero	1	2026-06-11 13:27:42.785881	t
20	1117512328	Yuleiny	Lugo Quimbayo	1	2026-06-11 13:27:42.785881	t
21	1116204178	Paula Daniela	Cuellar Rondon	1	2026-06-11 13:27:42.785881	t
22	1080361991	Juan Sebastian	Carvajal Home	1	2026-06-11 13:27:42.785881	t
23	1088255893	Brayan Steven	Velázquez Roa	1	2026-06-11 13:27:42.785881	t
24	1118471378	Leider Fabián	Ramos Cano	1	2026-06-11 13:27:42.785881	t
25	1117513057	Yessica Yulieth	Jaramillo Herran	1	2026-06-11 13:27:42.785881	t
26	1118367954	Gustavo Adolfo	Cabrera Vanegas	1	2026-06-11 13:27:42.785881	t
27	1117811948	Emerson	Corredor Murcia	1	2026-06-11 13:27:42.785881	t
28	1117931191	Sahira Mirleth	Vargas Sánchez	1	2026-06-11 13:27:42.785881	t
29	1130268455	Mary Jane	Romero Rivas	1	2026-06-11 13:27:42.785881	t
30	1118368430	Isabella	Lopera	1	2026-06-11 13:27:42.785881	t
\.


--
-- Data for Name: aprendiz_computador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz_computador (id, id_aprendiz, id_computador, principal, fecha_asignacion) FROM stdin;
\.


--
-- Data for Name: aprendiz_vehiculo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz_vehiculo (id, id_aprendiz, id_vehiculo, principal, fecha_asignacion) FROM stdin;
\.


--
-- Data for Name: computadores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.computadores (id_computador, serial, marca, activo) FROM stdin;
\.


--
-- Data for Name: detalles_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_ingreso (id_ingreso, id_aprendiz, id_detallemaquina, hora_ingreso) FROM stdin;
1	24	\N	2026-06-11 13:42:00.839816
2	10	\N	2026-06-11 13:50:13.38261
\.


--
-- Data for Name: detalles_maquinas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_maquinas (id_detallemaquina, id_computador, id_vehiculo, firma_ingreso, firma_salida, estado_equipo, hora_retiro_equipo) FROM stdin;
\.


--
-- Data for Name: detalles_salida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_salida (id_salida, id_ingreso, hora_salida) FROM stdin;
\.


--
-- Data for Name: formaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formaciones (id_formacion, nombre, nivel) FROM stdin;
1	Análisis y Desarrollo de Software	Tecnólogo
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id_rol, nombre) FROM stdin;
1	ADMIN
2	CELADOR
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id_usuario, nombre, email, password, id_rol, activo, creado_en, ultimo_login) FROM stdin;
1	Administrador	admin@gedasc.com	$2b$10$JZeitk51jbFy9MrlEVXhFOPzpYpvp0uhRfqR39PoX4Ij9ZQOjdw/i	1	t	2026-06-11 13:29:10.366971	\N
2	Celador Turno Mañana	celador@gedasc.com	$2b$10$47E2jRGGV1RSXa6w0XztXeySxecPTM9pPL2KChGwgGd8tqOFDmd.6	2	t	2026-06-11 13:29:10.366971	\N
\.


--
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (id_vehiculo, tipo_vehiculo, placa, modelo) FROM stdin;
\.


--
-- Name: aprendiz_computador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_computador_id_seq', 1, false);


--
-- Name: aprendiz_id_aprendiz_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_id_aprendiz_seq', 30, true);


--
-- Name: aprendiz_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_vehiculo_id_seq', 1, false);


--
-- Name: computadores_id_computador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.computadores_id_computador_seq', 1, false);


--
-- Name: detalles_ingreso_id_ingreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_ingreso_id_ingreso_seq', 2, true);


--
-- Name: detalles_maquinas_id_detallemaquina_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_maquinas_id_detallemaquina_seq', 1, false);


--
-- Name: detalles_salida_id_salida_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_salida_id_salida_seq', 1, false);


--
-- Name: formaciones_id_formacion_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formaciones_id_formacion_seq', 1, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 2, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 2, true);


--
-- Name: vehiculos_id_vehiculo_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculos_id_vehiculo_seq', 1, false);


--
-- Name: aprendiz_computador aprendiz_computador_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_computador
    ADD CONSTRAINT aprendiz_computador_pkey PRIMARY KEY (id);


--
-- Name: aprendiz aprendiz_documento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz
    ADD CONSTRAINT aprendiz_documento_key UNIQUE (documento);


--
-- Name: aprendiz aprendiz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz
    ADD CONSTRAINT aprendiz_pkey PRIMARY KEY (id_aprendiz);


--
-- Name: aprendiz_vehiculo aprendiz_vehiculo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_vehiculo
    ADD CONSTRAINT aprendiz_vehiculo_pkey PRIMARY KEY (id);


--
-- Name: computadores computadores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.computadores
    ADD CONSTRAINT computadores_pkey PRIMARY KEY (id_computador);


--
-- Name: computadores computadores_serial_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.computadores
    ADD CONSTRAINT computadores_serial_key UNIQUE (serial);


--
-- Name: detalles_ingreso detalles_ingreso_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_ingreso
    ADD CONSTRAINT detalles_ingreso_pkey PRIMARY KEY (id_ingreso);


--
-- Name: detalles_maquinas detalles_maquinas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_maquinas
    ADD CONSTRAINT detalles_maquinas_pkey PRIMARY KEY (id_detallemaquina);


--
-- Name: detalles_salida detalles_salida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_salida
    ADD CONSTRAINT detalles_salida_pkey PRIMARY KEY (id_salida);


--
-- Name: formaciones formaciones_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones
    ADD CONSTRAINT formaciones_nombre_key UNIQUE (nombre);


--
-- Name: formaciones formaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones
    ADD CONSTRAINT formaciones_pkey PRIMARY KEY (id_formacion);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id_vehiculo);


--
-- Name: aprendiz_computador aprendiz_computador_id_aprendiz_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_computador
    ADD CONSTRAINT aprendiz_computador_id_aprendiz_fkey FOREIGN KEY (id_aprendiz) REFERENCES public.aprendiz(id_aprendiz);


--
-- Name: aprendiz_computador aprendiz_computador_id_computador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_computador
    ADD CONSTRAINT aprendiz_computador_id_computador_fkey FOREIGN KEY (id_computador) REFERENCES public.computadores(id_computador);


--
-- Name: aprendiz aprendiz_id_formacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz
    ADD CONSTRAINT aprendiz_id_formacion_fkey FOREIGN KEY (id_formacion) REFERENCES public.formaciones(id_formacion);


--
-- Name: aprendiz_vehiculo aprendiz_vehiculo_id_aprendiz_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_vehiculo
    ADD CONSTRAINT aprendiz_vehiculo_id_aprendiz_fkey FOREIGN KEY (id_aprendiz) REFERENCES public.aprendiz(id_aprendiz);


--
-- Name: aprendiz_vehiculo aprendiz_vehiculo_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_vehiculo
    ADD CONSTRAINT aprendiz_vehiculo_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id_vehiculo);


--
-- Name: detalles_ingreso detalles_ingreso_id_aprendiz_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_ingreso
    ADD CONSTRAINT detalles_ingreso_id_aprendiz_fkey FOREIGN KEY (id_aprendiz) REFERENCES public.aprendiz(id_aprendiz);


--
-- Name: detalles_ingreso detalles_ingreso_id_detallemaquina_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_ingreso
    ADD CONSTRAINT detalles_ingreso_id_detallemaquina_fkey FOREIGN KEY (id_detallemaquina) REFERENCES public.detalles_maquinas(id_detallemaquina);


--
-- Name: detalles_maquinas detalles_maquinas_id_computador_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_maquinas
    ADD CONSTRAINT detalles_maquinas_id_computador_fkey FOREIGN KEY (id_computador) REFERENCES public.computadores(id_computador);


--
-- Name: detalles_maquinas detalles_maquinas_id_vehiculo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_maquinas
    ADD CONSTRAINT detalles_maquinas_id_vehiculo_fkey FOREIGN KEY (id_vehiculo) REFERENCES public.vehiculos(id_vehiculo);


--
-- Name: detalles_salida detalles_salida_id_ingreso_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_salida
    ADD CONSTRAINT detalles_salida_id_ingreso_fkey FOREIGN KEY (id_ingreso) REFERENCES public.detalles_ingreso(id_ingreso);


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- PostgreSQL database dump complete
--

\unrestrict dtWfIWTPBF45m9CvMbuDdEkjPiuYhVumNYfyyoLOA8xSpaRneZepYAOIl4ZrNvE

