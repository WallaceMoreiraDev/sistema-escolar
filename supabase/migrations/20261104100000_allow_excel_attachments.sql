-- =============================================================================
-- Migration: Permitir Planilhas Excel (.xlsx, .xls) e CSV em eventos-anexos
--
-- Contexto e Regras de Negócio:
-- 1. Suporte a formatos acadêmicos de planilha para atividades escolares da ETEC:
--    - Excel (.xlsx): application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
--    - Excel legado (.xls): application/vnd.ms-excel
--    - Dados tabulares (.csv): text/csv
-- 2. Mantém o limite de cota de 5 MB (5242880 bytes) e as políticas de RLS existentes.
-- =============================================================================

UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', -- .xlsx
    'application/vnd.ms-excel',                                         -- .xls
    'text/csv'                                                          -- .csv
]
WHERE id = 'eventos-anexos';
