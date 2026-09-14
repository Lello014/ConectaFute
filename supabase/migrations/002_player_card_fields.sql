-- Migration: campos extras para perfil do jogador
-- Adiciona campos que faltam no player_resumes

ALTER TABLE public.player_resumes
  ADD COLUMN IF NOT EXISTS jersey_number INT,
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS birthday DATE,
  ADD COLUMN IF NOT EXISTS overall_rating INT DEFAULT 50 CHECK (overall_rating >= 0 AND overall_rating <= 99),
  ADD COLUMN IF NOT EXISTS potential_rating INT DEFAULT 50 CHECK (potential_rating >= 0 AND potential_rating <= 99),
  ADD COLUMN IF NOT EXISTS traits TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_side TEXT DEFAULT 'direita' CHECK (preferred_side IN ('esquerda', 'direita', 'ambas'));

-- Atualizar profiles com campo de apelido
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nickname TEXT;
