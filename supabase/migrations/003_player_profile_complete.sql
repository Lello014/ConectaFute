-- Migration 003: Perfil completo do jogador
-- Campos adicionais em profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS neighborhood TEXT;

-- Campos adicionais em player_resumes
ALTER TABLE public.player_resumes
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS market_status TEXT NOT NULL DEFAULT 'disponivel'
    CHECK (market_status IN ('disponivel', 'apenas_avulso', 'fechando_elenco', 'indisponivel')),
  ADD COLUMN IF NOT EXISTS video_highlights JSONB DEFAULT '[]'::jsonb;

-- Tabela de atributos avaliados por capitães
CREATE TABLE IF NOT EXISTS public.player_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.profiles (id),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  raca INT CHECK (raca >= 1 AND raca <= 10),
  pontualidade INT CHECK (pontualidade >= 1 AND pontualidade <= 10),
  tecnica INT CHECK (tecnica >= 1 AND tecnica <= 10),
  espirito_equipe INT CHECK (espirito_equipe >= 1 AND espirito_equipe <= 10),
  disciplina INT CHECK (disciplina >= 1 AND disciplina <= 10),
  criatividade INT CHECK (criatividade >= 1 AND criatividade <= 10),
  marking TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, rater_id, team_id)
);

CREATE TRIGGER set_player_attributes_updated_at
  BEFORE UPDATE ON public.player_attributes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.player_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_attributes_public_read" ON public.player_attributes FOR SELECT USING (true);
CREATE POLICY "player_attributes_insert" ON public.player_attributes FOR INSERT WITH CHECK (
  auth.uid() = rater_id AND
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.user_id = auth.uid() AND tm.team_id = team_id AND tm.status = 'ativo')
);
CREATE POLICY "player_attributes_own_read" ON public.player_attributes FOR SELECT USING (
  auth.uid() = player_id OR auth.uid() = rater_id
);
