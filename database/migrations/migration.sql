-- Script de creación de base de datos GEDASC

-- Eliminar tablas si existen (opcional, para desarrollo limpio)
DROP TABLE IF EXISTS detalles_salida CASCADE;
DROP TABLE IF EXISTS detalles_ingreso CASCADE;
DROP TABLE IF EXISTS detalles_maquinas CASCADE;
DROP TABLE IF EXISTS aprendiz_vehiculo CASCADE;
DROP TABLE IF EXISTS aprendiz_computador CASCADE;
DROP TABLE IF EXISTS vehiculos CASCADE;
DROP TABLE IF EXISTS computadores CASCADE;
DROP TABLE IF EXISTS aprendiz CASCADE;
DROP TABLE IF EXISTS formaciones CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Tabla de Formaciones
CREATE TABLE formaciones (
    id_formacion SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nivel VARCHAR(15) NOT NULL
);

-- 2. Tabla de Aprendiz
CREATE TABLE aprendiz (
    id_aprendiz SERIAL PRIMARY KEY,
    documento VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    id_formacion INT NOT NULL REFERENCES formaciones(id_formacion),
    fecha_registro TIMESTAMP DEFAULT NOW(),
    estado BOOLEAN DEFAULT TRUE
);

-- 3. Tabla de Computadores
CREATE TABLE computadores (
    id_computador SERIAL PRIMARY KEY,
    serial VARCHAR(50) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- 4. Tabla de Vehículos
CREATE TABLE vehiculos (
    id_vehiculo SERIAL PRIMARY KEY,
    tipo_vehiculo VARCHAR(255),
    placa VARCHAR(10) NOT NULL,
    modelo VARCHAR(50) NOT NULL
);

-- 5. Relación Aprendiz - Computador
CREATE TABLE aprendiz_computador (
    id SERIAL PRIMARY KEY,
    id_aprendiz INT REFERENCES aprendiz(id_aprendiz),
    id_computador INT REFERENCES computadores(id_computador),
    principal BOOLEAN DEFAULT FALSE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Relación Aprendiz - Vehículo
CREATE TABLE aprendiz_vehiculo (
    id SERIAL PRIMARY KEY,
    id_aprendiz INT REFERENCES aprendiz(id_aprendiz),
    id_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    principal BOOLEAN DEFAULT FALSE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Detalles de Máquinas (Firma de ingreso)
CREATE TABLE detalles_maquinas (
    id_detallemaquina SERIAL PRIMARY KEY,
    id_computador INT REFERENCES computadores(id_computador),
    id_vehiculo INT REFERENCES vehiculos(id_vehiculo),
    firma_ingreso TEXT NOT NULL
);

-- 8. Detalles de Ingreso
CREATE TABLE detalles_ingreso (
    id_ingreso SERIAL PRIMARY KEY,
    id_aprendiz INT NOT NULL REFERENCES aprendiz(id_aprendiz),
    id_detallemaquina INT REFERENCES detalles_maquinas(id_detallemaquina),
    hora_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Detalles de Salida
CREATE TABLE detalles_salida (
    id_salida SERIAL PRIMARY KEY,
    id_ingreso INT NOT NULL REFERENCES detalles_ingreso(id_ingreso),
    hora_salida TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabla de Roles
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

-- 11. Tabla de Usuarios (Sistema)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    id_rol INT NOT NULL REFERENCES roles(id_rol),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP
);

-- Inserción de roles básicos
INSERT INTO roles (nombre) VALUES ('ADMIN'), ('CELADOR');
