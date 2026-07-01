-- =============================================
-- FASE 3: Múltiples formaciones por aprendiz
-- =============================================

BEGIN;

-- 1. Crear tabla intermedia
CREATE TABLE aprendiz_formacion (
    id SERIAL PRIMARY KEY,
    id_aprendiz INTEGER NOT NULL REFERENCES aprendiz(id_aprendiz) ON DELETE CASCADE,
    id_formacion INTEGER NOT NULL REFERENCES formaciones(id_formacion),
    estado VARCHAR(20) DEFAULT 'activo'
      CHECK (estado IN ('activo', 'inactivo', 'finalizado')),
    fecha_inicio TIMESTAMP DEFAULT NOW(),
    fecha_fin TIMESTAMP NULL,
    UNIQUE(id_aprendiz, id_formacion)
);

-- 2. Migrar datos existentes (PRESERVAR relación actual)
INSERT INTO aprendiz_formacion (id_aprendiz, id_formacion, estado)
SELECT id_aprendiz, id_formacion, 'activo'
FROM aprendiz
WHERE id_formacion IS NOT NULL;

-- 3. Crear índices
CREATE INDEX idx_aprendiz_formacion_aprendiz ON aprendiz_formacion(id_aprendiz);
CREATE INDEX idx_aprendiz_formacion_formacion ON aprendiz_formacion(id_formacion);
CREATE INDEX idx_aprendiz_formacion_activo ON aprendiz_formacion(id_aprendiz, estado)
  WHERE estado = 'activo';

-- 4. Eliminar FK y columna de aprendiz
ALTER TABLE aprendiz DROP CONSTRAINT aprendiz_id_formacion_fkey;
ALTER TABLE aprendiz DROP COLUMN id_formacion;

COMMIT;
