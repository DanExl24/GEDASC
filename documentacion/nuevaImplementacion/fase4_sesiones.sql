-- =============================================
-- FASE 4: Sesiones múltiples y unificación
-- =============================================

BEGIN;

-- Crear un índice parcial o helper si fuera necesario.
-- Como la búsqueda de ingresos sin salida se realiza mediante un LEFT JOIN,
-- un índice en detalles_salida(id_ingreso) es el más crítico.
CREATE INDEX IF NOT EXISTS idx_detalles_salida_id_ingreso ON detalles_salida(id_ingreso);

COMMIT;
