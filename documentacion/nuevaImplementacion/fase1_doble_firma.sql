-- =============================================
-- FASE 1: Doble firma para control de equipos
-- =============================================

BEGIN;

-- Agregar firma de salida a detalles_maquinas
ALTER TABLE detalles_maquinas
  ADD COLUMN firma_salida TEXT NULL;

-- Agregar estado del equipo (dentro/retirado)
ALTER TABLE detalles_maquinas
  ADD COLUMN estado_equipo VARCHAR(20) DEFAULT 'dentro'
  CHECK (estado_equipo IN ('dentro', 'retirado'));

-- Agregar timestamp de retiro del equipo
ALTER TABLE detalles_maquinas
  ADD COLUMN hora_retiro_equipo TIMESTAMP NULL;

COMMIT;
