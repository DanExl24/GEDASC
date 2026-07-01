-- =============================================
-- FASE 5: Inferencia de jornada
-- =============================================

BEGIN;

CREATE INDEX IF NOT EXISTS idx_detalles_ingreso_aprendiz_hora ON detalles_ingreso(id_aprendiz, hora_ingreso);
CREATE INDEX IF NOT EXISTS idx_detalles_salida_hora ON detalles_salida(hora_salida);

COMMIT;
