-- PASSO 1: Adicionar role admin ao enum
-- Execute este script PRIMEIRO no SQL Editor do Supabase

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin' AFTER 'organizer';
