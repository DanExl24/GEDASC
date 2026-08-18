-- =============================================
-- FASE 6: Gestión Académica y Validación de Horarios
-- =============================================

BEGIN;

-- 1. Crear tabla programa
CREATE TABLE IF NOT EXISTS programa (
    id_programa SERIAL PRIMARY KEY,
    nombre_programa VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    nivel VARCHAR(50) NOT NULL
);

-- 2. Crear tabla horario
CREATE TABLE IF NOT EXISTS horario (
    id_horario SERIAL PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    jornada VARCHAR(20) CHECK (jornada IN ('Mañana', 'Tarde', 'Noche'))
);

-- 3. Crear tabla horario_dia
CREATE TABLE IF NOT EXISTS horario_dia (
    id_horario INTEGER NOT NULL REFERENCES horario(id_horario) ON DELETE CASCADE,
    dia_semana VARCHAR(20) CHECK (dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    PRIMARY KEY (id_horario, dia_semana)
);

-- 4. Modificar tabla formaciones
-- Añadir campos para relacionar con programa y horario
ALTER TABLE formaciones ADD COLUMN IF NOT EXISTS id_programa INTEGER REFERENCES programa(id_programa);
ALTER TABLE formaciones ADD COLUMN IF NOT EXISTS id_horario INTEGER REFERENCES horario(id_horario);
ALTER TABLE formaciones ADD COLUMN IF NOT EXISTS fecha_inicio DATE DEFAULT CURRENT_DATE;
ALTER TABLE formaciones ADD COLUMN IF NOT EXISTS fecha_fin DATE DEFAULT (CURRENT_DATE + INTERVAL '2 years');
ALTER TABLE formaciones ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada'));

-- 5. Migrar datos existentes (crear programas para formaciones actuales si no existen)
INSERT INTO programa (nombre_programa, version, nivel)
SELECT DISTINCT nombre, 'V1', nivel 
FROM formaciones
ON CONFLICT (nombre_programa) DO NOTHING;

-- Crear un horario por defecto (06:00 a 12:00 "Mañana" de Lunes a Viernes)
-- Primero verificar si ya existe un horario con ese rango
INSERT INTO horario (hora_inicio, hora_fin, jornada)
VALUES ('06:00:00', '12:00:00', 'Mañana')
ON CONFLICT DO NOTHING;

-- Obtener el id_horario del horario insertado (normalmente será 1 si está vacía)
-- Insertar días para el horario 1 (Lunes a Viernes)
INSERT INTO horario_dia (id_horario, dia_semana)
SELECT 1, d 
FROM unnest(ARRAY['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']) d
ON CONFLICT DO NOTHING;

-- Actualizar formaciones existentes para que apunten al programa y al horario por defecto
UPDATE formaciones f
SET id_programa = p.id_programa,
    id_horario = 1
FROM programa p
WHERE p.nombre_programa = f.nombre;

-- Aplicar la restricción NOT NULL a las columnas añadidas después de poblar los datos
ALTER TABLE formaciones ALTER COLUMN id_programa SET NOT NULL;
ALTER TABLE formaciones ALTER COLUMN id_horario SET NOT NULL;

-- 6. Modificar tabla detalles_ingreso para guardar la formación específica de la sesión
ALTER TABLE detalles_ingreso ADD COLUMN IF NOT EXISTS id_formacion INTEGER REFERENCES formaciones(id_formacion) NULL;
ALTER TABLE detalles_ingreso ADD COLUMN IF NOT EXISTS motivo_visita VARCHAR(255) NULL;

-- Backfill histórico: asociar ingresos antiguos con la formación activa que tenía el aprendiz
UPDATE detalles_ingreso di
SET id_formacion = (
    SELECT id_formacion
    FROM aprendiz_formacion af
    WHERE af.id_aprendiz = di.id_aprendiz AND af.estado = 'activo'
    LIMIT 1
)
WHERE di.id_formacion IS NULL;

-- Crear índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_formaciones_programa ON formaciones(id_programa);
CREATE INDEX IF NOT EXISTS idx_formaciones_horario ON formaciones(id_horario);
CREATE INDEX IF NOT EXISTS idx_detalles_ingreso_formacion ON detalles_ingreso(id_formacion);
CREATE INDEX IF NOT EXISTS idx_horario_dia_busqueda ON horario_dia(id_horario, dia_semana);

COMMIT;
