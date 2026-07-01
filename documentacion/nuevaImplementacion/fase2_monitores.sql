-- =============================================
-- FASE 2: Gestión de aprendices monitores
-- =============================================

BEGIN;

-- Agregar flag de monitor al aprendiz
ALTER TABLE aprendiz
  ADD COLUMN es_monitor BOOLEAN DEFAULT FALSE;

-- Agregar tipo de sesión al ingreso
ALTER TABLE detalles_ingreso
  ADD COLUMN tipo_sesion VARCHAR(20) DEFAULT 'formacion'
  CHECK (tipo_sesion IN ('formacion', 'monitoria'));

COMMIT;
