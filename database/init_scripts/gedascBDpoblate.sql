--
-- PostgreSQL database dump
--

\restrict q4gNuuimSvD3nAMlgRfhNdpxIiNXhxFjK8ZxqJ9TK0vxJigreD2S636Vdu3IFeZ

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET lock_timeout = 0;
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
    motivo_reingreso text,
    id_formacion integer,
    motivo_visita character varying(255),
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
    id_programa integer NOT NULL,
    id_horario integer NOT NULL,
    fecha_inicio date DEFAULT CURRENT_DATE,
    fecha_fin date DEFAULT (CURRENT_DATE + '2 years'::interval),
    estado character varying(20) DEFAULT 'activa'::character varying,
    CONSTRAINT formaciones_estado_check CHECK (((estado)::text = ANY ((ARRAY['activa'::character varying, 'finalizada'::character varying])::text[])))
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
-- Name: horario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario (
    id_horario integer NOT NULL,
    hora_inicio time without time zone NOT NULL,
    hora_fin time without time zone NOT NULL,
    jornada character varying(20),
    CONSTRAINT horario_jornada_check CHECK (((jornada)::text = ANY ((ARRAY['Mañana'::character varying, 'Tarde'::character varying, 'Noche'::character varying])::text[])))
);


ALTER TABLE public.horario OWNER TO postgres;

--
-- Name: horario_dia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario_dia (
    id_horario integer NOT NULL,
    dia_semana character varying(20) NOT NULL,
    CONSTRAINT horario_dia_dia_semana_check CHECK (((dia_semana)::text = ANY ((ARRAY['Lunes'::character varying, 'Martes'::character varying, 'Miércoles'::character varying, 'Jueves'::character varying, 'Viernes'::character varying, 'Sábado'::character varying, 'Domingo'::character varying])::text[])))
);


ALTER TABLE public.horario_dia OWNER TO postgres;

--
-- Name: horario_id_horario_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_id_horario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.horario_id_horario_seq OWNER TO postgres;

--
-- Name: horario_id_horario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.horario_id_horario_seq OWNED BY public.horario.id_horario;


--
-- Name: programa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.programa (
    id_programa integer NOT NULL,
    nombre_programa character varying(255) NOT NULL,
    version character varying(50) NOT NULL,
    estado character varying(20) DEFAULT 'activo'::character varying,
    nivel character varying(50) NOT NULL,
    CONSTRAINT programa_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'inactivo'::character varying])::text[])))
);


ALTER TABLE public.programa OWNER TO postgres;

--
-- Name: programa_id_programa_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.programa_id_programa_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.programa_id_programa_seq OWNER TO postgres;

--
-- Name: programa_id_programa_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.programa_id_programa_seq OWNED BY public.programa.id_programa;


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
-- Name: horario id_horario; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario ALTER COLUMN id_horario SET DEFAULT nextval('public.horario_id_horario_seq'::regclass);


--
-- Name: programa id_programa; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programa ALTER COLUMN id_programa SET DEFAULT nextval('public.programa_id_programa_seq'::regclass);


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
2	27	2	t	2026-07-02 18:31:10.918447
\.


--
-- Data for Name: aprendiz_formacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.aprendiz_formacion (id, id_aprendiz, id_formacion, estado, fecha_inicio, fecha_fin) FROM stdin;
1	1	3142784	activo	2026-06-30 18:12:40.23351	\N
2	3	3142784	activo	2026-06-30 18:12:40.23351	\N
3	4	3142784	activo	2026-06-30 18:12:40.23351	\N
4	5	3142784	activo	2026-06-30 18:12:40.23351	\N
5	6	3142784	activo	2026-06-30 18:12:40.23351	\N
6	7	3142784	activo	2026-06-30 18:12:40.23351	\N
7	8	3142784	activo	2026-06-30 18:12:40.23351	\N
8	9	3142784	activo	2026-06-30 18:12:40.23351	\N
9	11	3142784	activo	2026-06-30 18:12:40.23351	\N
10	12	3142784	activo	2026-06-30 18:12:40.23351	\N
11	13	3142784	activo	2026-06-30 18:12:40.23351	\N
12	14	3142784	activo	2026-06-30 18:12:40.23351	\N
13	15	3142784	activo	2026-06-30 18:12:40.23351	\N
14	16	3142784	activo	2026-06-30 18:12:40.23351	\N
15	17	3142784	activo	2026-06-30 18:12:40.23351	\N
16	18	3142784	activo	2026-06-30 18:12:40.23351	\N
17	19	3142784	activo	2026-06-30 18:12:40.23351	\N
18	20	3142784	activo	2026-06-30 18:12:40.23351	\N
19	21	3142784	activo	2026-06-30 18:12:40.23351	\N
20	22	3142784	activo	2026-06-30 18:12:40.23351	\N
21	23	3142784	activo	2026-06-30 18:12:40.23351	\N
22	24	3142784	activo	2026-06-30 18:12:40.23351	\N
23	25	3142784	activo	2026-06-30 18:12:40.23351	\N
24	26	3142784	activo	2026-06-30 18:12:40.23351	\N
25	27	3142784	activo	2026-06-30 18:12:40.23351	\N
26	28	3142784	activo	2026-06-30 18:12:40.23351	\N
27	29	3142784	activo	2026-06-30 18:12:40.23351	\N
28	30	3142784	activo	2026-06-30 18:12:40.23351	\N
29	2	3142784	activo	2026-06-30 18:12:40.23351	\N
30	10	3142784	activo	2026-06-30 18:12:40.23351	\N
31	1	3142785	activo	2026-07-02 18:50:21.204026	\N
32	7	3142785	activo	2026-07-02 20:20:32.453	\N
35	1	2823456	activo	2026-08-17 19:27:19.854273	\N
36	3	2823456	activo	2026-08-17 19:27:19.854273	\N
37	4	2823456	activo	2026-08-17 19:27:19.854273	\N
38	5	2823456	activo	2026-08-17 19:27:19.854273	\N
39	6	2823456	activo	2026-08-17 19:27:19.854273	\N
40	7	2823456	activo	2026-08-17 19:27:19.854273	\N
41	8	2823456	activo	2026-08-17 19:27:19.854273	\N
42	9	2823456	activo	2026-08-17 19:27:19.854273	\N
43	11	2823456	activo	2026-08-17 19:27:19.854273	\N
44	12	2823456	activo	2026-08-17 19:27:19.854273	\N
45	13	2823456	activo	2026-08-17 19:27:19.854273	\N
46	14	2823456	activo	2026-08-17 19:27:19.854273	\N
47	15	2823456	activo	2026-08-17 19:27:19.854273	\N
48	16	2823456	activo	2026-08-17 19:27:19.854273	\N
49	17	2823456	activo	2026-08-17 19:27:19.854273	\N
50	18	2823456	activo	2026-08-17 19:27:19.854273	\N
51	19	2823456	activo	2026-08-17 19:27:19.854273	\N
52	20	2823456	activo	2026-08-17 19:27:19.854273	\N
53	21	2823456	activo	2026-08-17 19:27:19.854273	\N
54	22	2823456	activo	2026-08-17 19:27:19.854273	\N
55	23	2823456	activo	2026-08-17 19:27:19.854273	\N
56	24	2823456	activo	2026-08-17 19:27:19.854273	\N
57	25	2823456	activo	2026-08-17 19:27:19.854273	\N
58	26	2823456	activo	2026-08-17 19:27:19.854273	\N
59	27	2823456	activo	2026-08-17 19:27:19.854273	\N
60	28	2823456	activo	2026-08-17 19:27:19.854273	\N
61	29	2823456	activo	2026-08-17 19:27:19.854273	\N
62	30	2823456	activo	2026-08-17 19:27:19.854273	\N
63	2	2823456	activo	2026-08-17 19:27:19.854273	\N
64	10	2823456	activo	2026-08-17 19:27:19.854273	\N
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
2	V9234	HP	t
\.


--
-- Data for Name: detalles_ingreso; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalles_ingreso (id_ingreso, id_aprendiz, id_detallemaquina, hora_ingreso, tipo_sesion, motivo_reingreso, id_formacion, motivo_visita) FROM stdin;
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

COPY public.formaciones (id_formacion, id_programa, id_horario, fecha_inicio, fecha_fin, estado) FROM stdin;
3142784	2	5	2026-07-02	2028-07-02	activa
3142785	1	1	2026-07-02	2028-07-02	activa
2823456	1	1	2026-08-17	2028-08-17	activa
\.


--
-- Data for Name: horario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario (id_horario, hora_inicio, hora_fin, jornada) FROM stdin;
5	12:00:00	18:00:00	Tarde
1	07:00:00	13:00:00	Mañana
2	13:00:00	18:00:00	Tarde
3	18:00:00	22:00:00	Noche
\.


--
-- Data for Name: horario_dia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario_dia (id_horario, dia_semana) FROM stdin;
5	Lunes
5	Miércoles
5	Martes
5	Jueves
5	Viernes
1	Lunes
1	Martes
1	Miércoles
1	Jueves
1	Viernes
2	Lunes
2	Martes
2	Miércoles
2	Jueves
2	Viernes
3	Lunes
3	Martes
3	Miércoles
3	Jueves
3	Viernes
\.


--
-- Data for Name: programa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.programa (id_programa, nombre_programa, version, estado, nivel) FROM stdin;
1	Análisis y Desarrollo de Software	V1	activo	Tecnólogo
2	Gestión Empresarial	V1	activo	Tecnólogo
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
1	Administrador	admin@gedasc.com	$2b$10$ggY.X0S4AMEfT23/9TUKiOSHInLkQVX8rtjUvEFgLVMPbtxtdTFFy	1	t	2026-06-11 13:29:10.366971	\N
2	Celador Turno Mañana	celador@gedasc.com	$2b$10$nQ5BWN/h/eIzIjIu7UqItuaijNG7RQ3mPzfOuTwFq63UVYX0a/Wr6	2	t	2026-06-11 13:29:10.366971	\N
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

SELECT pg_catalog.setval('public.aprendiz_computador_id_seq', 2, true);


--
-- Name: aprendiz_formacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_formacion_id_seq', 64, true);


--
-- Name: aprendiz_id_aprendiz_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_id_aprendiz_seq', 60, true);


--
-- Name: aprendiz_vehiculo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.aprendiz_vehiculo_id_seq', 1, false);


--
-- Name: computadores_id_computador_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.computadores_id_computador_seq', 2, true);


--
-- Name: detalles_ingreso_id_ingreso_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalles_ingreso_id_ingreso_seq', 1, false);


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

SELECT pg_catalog.setval('public.formaciones_id_formacion_seq', 2, true);


--
-- Name: horario_id_horario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_id_horario_seq', 5, true);


--
-- Name: programa_id_programa_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.programa_id_programa_seq', 2, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 2, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 6, true);


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
-- Name: formaciones formaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones
    ADD CONSTRAINT formaciones_pkey PRIMARY KEY (id_formacion);


--
-- Name: horario_dia horario_dia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_dia
    ADD CONSTRAINT horario_dia_pkey PRIMARY KEY (id_horario, dia_semana);


--
-- Name: horario horario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario
    ADD CONSTRAINT horario_pkey PRIMARY KEY (id_horario);


--
-- Name: programa programa_nombre_programa_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programa
    ADD CONSTRAINT programa_nombre_programa_key UNIQUE (nombre_programa);


--
-- Name: programa programa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.programa
    ADD CONSTRAINT programa_pkey PRIMARY KEY (id_programa);


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
-- Name: aprendiz_formacion unique_id_aprendiz_id_formacion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT unique_id_aprendiz_id_formacion UNIQUE (id_aprendiz, id_formacion);


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
-- Name: idx_detalles_ingreso_aprendiz_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_ingreso_aprendiz_hora ON public.detalles_ingreso USING btree (id_aprendiz, hora_ingreso);


--
-- Name: idx_detalles_ingreso_formacion; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_ingreso_formacion ON public.detalles_ingreso USING btree (id_formacion);


--
-- Name: idx_detalles_salida_hora; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_salida_hora ON public.detalles_salida USING btree (hora_salida);


--
-- Name: idx_detalles_salida_id_ingreso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalles_salida_id_ingreso ON public.detalles_salida USING btree (id_ingreso);


--
-- Name: idx_formaciones_horario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_formaciones_horario ON public.formaciones USING btree (id_horario);


--
-- Name: idx_formaciones_programa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_formaciones_programa ON public.formaciones USING btree (id_programa);


--
-- Name: idx_horario_dia_busqueda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_dia_busqueda ON public.horario_dia USING btree (id_horario, dia_semana);


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
-- Name: aprendiz_formacion fk_aprendiz_formacion_id_formacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.aprendiz_formacion
    ADD CONSTRAINT fk_aprendiz_formacion_id_formacion FOREIGN KEY (id_formacion) REFERENCES public.formaciones(id_formacion) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: detalles_ingreso fk_detalles_ingreso_id_formacion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalles_ingreso
    ADD CONSTRAINT fk_detalles_ingreso_id_formacion FOREIGN KEY (id_formacion) REFERENCES public.formaciones(id_formacion) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: formaciones formaciones_id_horario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones
    ADD CONSTRAINT formaciones_id_horario_fkey FOREIGN KEY (id_horario) REFERENCES public.horario(id_horario);


--
-- Name: formaciones formaciones_id_programa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formaciones
    ADD CONSTRAINT formaciones_id_programa_fkey FOREIGN KEY (id_programa) REFERENCES public.programa(id_programa);


--
-- Name: horario_dia horario_dia_id_horario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_dia
    ADD CONSTRAINT horario_dia_id_horario_fkey FOREIGN KEY (id_horario) REFERENCES public.horario(id_horario) ON DELETE CASCADE;


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol);


--
-- PostgreSQL database dump complete
--

\unrestrict q4gNuuimSvD3nAMlgRfhNdpxIiNXhxFjK8ZxqJ9TK0vxJigreD2S636Vdu3IFeZ

