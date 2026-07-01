--
-- PostgreSQL database dump
--

\restrict 0GYvqiWDSsc5aaZ8xYSDJzuiG7cE7HQnXJZFRiRidpaQjxPM6bJIwqyBQrd9y7N

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
    fecha_registro timestamp without time zone DEFAULT now(),
    estado boolean DEFAULT true,
    es_monitor boolean DEFAULT false
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
-- Name: aprendiz_formacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.aprendiz_formacion (
    id integer NOT NULL,
    id_aprendiz integer NOT NULL,
    id_formacion integer NOT NULL,
    estado character varying(20) DEFAULT 'activo'::character varying,
    fecha_inicio timestamp without time zone DEFAULT now(),
    fecha_fin timestamp without time zone,
    CONSTRAINT aprendiz_formacion_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'inactivo'::character varying, 'finalizado'::character varying])::text[])))
);


ALTER TABLE public.aprendiz_formacion OWNER TO postgres;

--
-- Name: aprendiz_formacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.aprendiz_formacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.aprendiz_formacion_id_seq OWNER TO postgres;

--
-- Name: aprendiz_formacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.aprendiz_formacion_id_seq OWNED BY public.aprendiz_formacion.id;


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
    hora_ingreso timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo_sesion character varying(20) DEFAULT 'formacion'::character varying,
    CONSTRAINT detalles_ingreso_tipo_sesion_check CHECK (((tipo_sesion)::text = ANY ((ARRAY['formacion'::character varying, 'monitoria'::character varying])::text[])))
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
-- Name: aprendiz_formacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion ALTER COLUMN id SET DEFAULT nextval('public.aprendiz_formacion_id_seq'::regclass);


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

COPY public.aprendiz (id_aprendiz, documento, nombre, apellido, fecha_registro, estado, es_monitor) FROM stdin;
1	1117784339	Jhonatan	Castro Calderón	2026-06-11 13:27:42.785881	t	f
3	1117496648	Manuel Andres	Cardenas Suarez	2026-06-11 13:27:42.785881	t	f
4	1006510328	Daniel Felipe	Vera Perdomo	2026-06-11 13:27:42.785881	t	f
5	1118368446	Juan David	Trujillo Naranjo	2026-06-11 13:27:42.785881	t	f
6	1117511568	Jhoan Steven	Zambrano Vera	2026-06-11 13:27:42.785881	t	f
7	1118364706	Patrick Damian	Ortiz Hernández	2026-06-11 13:27:42.785881	t	f
8	1117497987	Estefany	Cuellar Anturi	2026-06-11 13:27:42.785881	t	f
9	1118471476	Jaiber Julian	Gutierrez Rivera	2026-06-11 13:27:42.785881	t	f
11	1116205722	Ingri Julieth	Gasca Tenorio	2026-06-11 13:27:42.785881	t	f
12	1084331945	Andrés Julián	Cruz Hernández	2026-06-11 13:27:42.785881	t	f
13	1006508852	Cristian	Cantillo Mejia	2026-06-11 13:27:42.785881	t	f
14	1006508766	Ibsen Alexis	Soto Artunduaga	2026-06-11 13:27:42.785881	t	f
15	1006419673	Brayan Stiven	Hoyos Cespedes	2026-06-11 13:27:42.785881	t	f
16	1118367962	Santiago	Lizcano Suárez	2026-06-11 13:27:42.785881	t	f
17	1115942896	Yefry	Serna Puentes	2026-06-11 13:27:42.785881	t	f
18	1120498200	Anggie Marcela	Olmos Bernal	2026-06-11 13:27:42.785881	t	f
19	1122726863	William Santiago	Barrero Romero	2026-06-11 13:27:42.785881	t	f
20	1117512328	Yuleiny	Lugo Quimbayo	2026-06-11 13:27:42.785881	t	f
21	1116204178	Paula Daniela	Cuellar Rondon	2026-06-11 13:27:42.785881	t	f
22	1080361991	Juan Sebastian	Carvajal Home	2026-06-11 13:27:42.785881	t	f
23	1088255893	Brayan Steven	Velázquez Roa	2026-06-11 13:27:42.785881	t	f
24	1118471378	Leider Fabián	Ramos Cano	2026-06-11 13:27:42.785881	t	f
25	1117513057	Yessica Yulieth	Jaramillo Herran	2026-06-11 13:27:42.785881	t	f
26	1118367954	Gustavo Adolfo	Cabrera Vanegas	2026-06-11 13:27:42.785881	t	f
27	1117811948	Emerson	Corredor Murcia	2026-06-11 13:27:42.785881	t	f
28	1117931191	Sahira Mirleth	Vargas Sánchez	2026-06-11 13:27:42.785881	t	f
29	1130268455	Mary Jane	Romero Rivas	2026-06-11 13:27:42.785881	t	f
30	1118368430	Isabella	Lopera	2026-06-11 13:27:42.785881	t	f
2	1051065897	Luis Esteban	Morales Gasca	2026-06-11 13:27:42.785881	t	t
10	1099742508	Jorge Alejandro	Peña Motta	2026-06-11 13:27:42.785881	t	t
\.


--
-- Data for Name: aprendiz_computador; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz_computador (id, id_aprendiz, id_computador, principal, fecha_asignacion) FROM stdin;
1	10	1	t	2026-06-30 18:06:31.786298
\.


--
-- Data for Name: aprendiz_formacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz_formacion (id, id_aprendiz, id_formacion, estado, fecha_inicio, fecha_fin) FROM stdin;
1	1	1	activo	2026-06-30 18:12:40.23351	\N
2	3	1	activo	2026-06-30 18:12:40.23351	\N
3	4	1	activo	2026-06-30 18:12:40.23351	\N
4	5	1	activo	2026-06-30 18:12:40.23351	\N
5	6	1	activo	2026-06-30 18:12:40.23351	\N
6	7	1	activo	2026-06-30 18:12:40.23351	\N
7	8	1	activo	2026-06-30 18:12:40.23351	\N
8	9	1	activo	2026-06-30 18:12:40.23351	\N
9	11	1	activo	2026-06-30 18:12:40.23351	\N
10	12	1	activo	2026-06-30 18:12:40.23351	\N
11	13	1	activo	2026-06-30 18:12:40.23351	\N
12	14	1	activo	2026-06-30 18:12:40.23351	\N
13	15	1	activo	2026-06-30 18:12:40.23351	\N
14	16	1	activo	2026-06-30 18:12:40.23351	\N
15	17	1	activo	2026-06-30 18:12:40.23351	\N
16	18	1	activo	2026-06-30 18:12:40.23351	\N
17	19	1	activo	2026-06-30 18:12:40.23351	\N
18	20	1	activo	2026-06-30 18:12:40.23351	\N
19	21	1	activo	2026-06-30 18:12:40.23351	\N
20	22	1	activo	2026-06-30 18:12:40.23351	\N
21	23	1	activo	2026-06-30 18:12:40.23351	\N
22	24	1	activo	2026-06-30 18:12:40.23351	\N
23	25	1	activo	2026-06-30 18:12:40.23351	\N
24	26	1	activo	2026-06-30 18:12:40.23351	\N
25	27	1	activo	2026-06-30 18:12:40.23351	\N
26	28	1	activo	2026-06-30 18:12:40.23351	\N
27	29	1	activo	2026-06-30 18:12:40.23351	\N
28	30	1	activo	2026-06-30 18:12:40.23351	\N
29	2	1	activo	2026-06-30 18:12:40.23351	\N
30	10	1	activo	2026-06-30 18:12:40.23351	\N
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
1	Y9VYVGH	HP	t
\.


--
-- Data for Name: detalles_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_ingreso (id_ingreso, id_aprendiz, id_detallemaquina, hora_ingreso, tipo_sesion) FROM stdin;
1	24	\N	2026-06-11 13:42:00.839816	formacion
2	10	\N	2026-06-11 13:50:13.38261	formacion
3	10	1	2026-06-30 18:06:02.064003	formacion
4	24	\N	2026-06-30 18:36:45.221875	formacion
5	27	\N	2026-06-30 18:37:25.212242	formacion
\.


--
-- Data for Name: detalles_maquinas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_maquinas (id_detallemaquina, id_computador, id_vehiculo, firma_ingreso, firma_salida, estado_equipo, hora_retiro_equipo) FROM stdin;
1	1	1	data:image/png;base64,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	data:image/png;base64,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	retirado	2026-06-30 18:07:46.471095
\.


--
-- Data for Name: detalles_salida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_salida (id_salida, id_ingreso, hora_salida) FROM stdin;
1	3	2026-06-30 18:07:18.355822
2	1	2026-06-30 18:34:28.132624
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
1	CARRO	HDT-132	FORD FIESTA
\.


--
-- Name: aprendiz_computador_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_computador_id_seq', 1, true);


--
-- Name: aprendiz_formacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_formacion_id_seq', 30, true);


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

SELECT pg_catalog.setval('public.computadores_id_computador_seq', 1, true);


--
-- Name: detalles_ingreso_id_ingreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_ingreso_id_ingreso_seq', 5, true);


--
-- Name: detalles_maquinas_id_detallemaquina_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_maquinas_id_detallemaquina_seq', 1, true);


--
-- Name: detalles_salida_id_salida_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_salida_id_salida_seq', 2, true);


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

SELECT pg_catalog.setval('public.vehiculos_id_vehiculo_seq', 1, true);


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
-- Name: aprendiz_formacion aprendiz_formacion_id_aprendiz_id_formacion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT aprendiz_formacion_id_aprendiz_id_formacion_key UNIQUE (id_aprendiz, id_formacion);


--
-- Name: aprendiz_formacion aprendiz_formacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT aprendiz_formacion_pkey PRIMARY KEY (id);


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
-- Name: idx_aprendiz_formacion_activo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aprendiz_formacion_activo ON public.aprendiz_formacion USING btree (id_aprendiz, estado) WHERE ((estado)::text = 'activo'::text);


--
-- Name: idx_aprendiz_formacion_aprendiz; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aprendiz_formacion_aprendiz ON public.aprendiz_formacion USING btree (id_aprendiz);


--
-- Name: idx_aprendiz_formacion_formacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_aprendiz_formacion_formacion ON public.aprendiz_formacion USING btree (id_formacion);


--
-- Name: idx_detalles_salida_id_ingreso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_salida_id_ingreso ON public.detalles_salida USING btree (id_ingreso);


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
-- Name: aprendiz_formacion aprendiz_formacion_id_aprendiz_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT aprendiz_formacion_id_aprendiz_fkey FOREIGN KEY (id_aprendiz) REFERENCES public.aprendiz(id_aprendiz) ON DELETE CASCADE;


--
-- Name: aprendiz_formacion aprendiz_formacion_id_formacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT aprendiz_formacion_id_formacion_fkey FOREIGN KEY (id_formacion) REFERENCES public.formaciones(id_formacion);


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

\unrestrict 0GYvqiWDSsc5aaZ8xYSDJzuiG7cE7HQnXJZFRiRidpaQjxPM6bJIwqyBQrd9y7N

