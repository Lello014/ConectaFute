-- Conecta Fute - Schema Inicial
-- Execute no SQL Editor do Supabase
-- ATENCAO: Isso vai APAGAR tabelas existentes!

-- Limpar tabelas existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS set_teams_updated_at ON public.teams;
DROP TRIGGER IF EXISTS set_player_resumes_updated_at ON public.player_resumes;
DROP TRIGGER IF EXISTS set_player_contracts_updated_at ON public.player_contracts;
DROP TRIGGER IF EXISTS set_job_offers_updated_at ON public.job_offers;
DROP TRIGGER IF EXISTS set_reports_updated_at ON public.reports;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.grant_role(public.app_role);
DROP FUNCTION IF EXISTS public.set_updated_at();

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.venues CASCADE;
DROP TABLE IF EXISTS public.referees CASCADE;
DROP TABLE IF EXISTS public.player_stats CASCADE;
DROP TABLE IF EXISTS public.achievements CASCADE;
DROP TABLE IF EXISTS public.job_offers CASCADE;
DROP TABLE IF EXISTS public.player_contracts CASCADE;
DROP TABLE IF EXISTS public.player_resumes CASCADE;
DROP TABLE IF EXISTS public.lineup_players CASCADE;
DROP TABLE IF EXISTS public.lineups CASCADE;
DROP TABLE IF EXISTS public.sponsors CASCADE;
DROP TABLE IF EXISTS public.team_transactions CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
DROP TABLE IF EXISTS public.tournament_teams CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.friendlies CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.friendly_status CASCADE;
DROP TYPE IF EXISTS public.tournament_status CASCADE;
DROP TYPE IF EXISTS public.transaction_type CASCADE;
DROP TYPE IF EXISTS public.transaction_category CASCADE;
DROP TYPE IF EXISTS public.sponsor_status CASCADE;
DROP TYPE IF EXISTS public.match_type CASCADE;

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'player', 'captain', 'organizer');
CREATE TYPE public.friendly_status AS ENUM ('pendente', 'confirmado', 'realizado', 'cancelado');
CREATE TYPE public.tournament_status AS ENUM ('inscricoes', 'em_andamento', 'encerrado');
CREATE TYPE public.transaction_type AS ENUM ('receita', 'despesa');
CREATE TYPE public.transaction_category AS ENUM ('mensalidade', 'patrocinio', 'aluguel_campo', 'arbitragem', 'material', 'transporte', 'premiacao', 'outros');
CREATE TYPE public.sponsor_status AS ENUM ('ativo', 'pausado', 'encerrado');
CREATE TYPE public.match_type AS ENUM ('friendly', 'tournament');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  bio TEXT,
  avatar_url TEXT,
  roles public.app_role[] NOT NULL DEFAULT ARRAY['player'::public.app_role],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funcao: Criar perfil ao registrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data ->> 'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Funcao: Updated_at automatico
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

-- Teams
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#059669',
  secondary_color TEXT NOT NULL DEFAULT '#ffffff',
  city TEXT,
  state TEXT,
  captain_id UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Team Members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('captain', 'player')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'recusado')),
  jersey_number INT,
  position TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);

-- Friendlies
CREATE TABLE public.friendlies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id UUID NOT NULL REFERENCES public.teams (id),
  away_team_id UUID NOT NULL REFERENCES public.teams (id),
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  format TEXT NOT NULL DEFAULT 'society',
  status public.friendly_status NOT NULL DEFAULT 'pendente',
  home_score INT,
  away_score INT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournaments
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  format TEXT NOT NULL DEFAULT 'society',
  city TEXT,
  state TEXT,
  starts_at DATE,
  ends_at DATE,
  max_teams INT,
  registration_fee NUMERIC(8,2) NOT NULL DEFAULT 0,
  prize TEXT,
  status public.tournament_status NOT NULL DEFAULT 'inscricoes',
  organizer_id UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tournament Teams
CREATE TABLE public.tournament_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments (id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, team_id)
);

-- Matches
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments (id) ON DELETE CASCADE,
  home_team_id UUID NOT NULL REFERENCES public.teams (id),
  away_team_id UUID NOT NULL REFERENCES public.teams (id),
  round INT,
  group_label TEXT,
  scheduled_at TIMESTAMPTZ,
  home_score INT,
  away_score INT,
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'jogado', 'cancelado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Team Transactions
CREATE TABLE public.team_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  type public.transaction_type NOT NULL,
  category public.transaction_category NOT NULL DEFAULT 'outros',
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL DEFAULT current_date,
  tournament_id UUID REFERENCES public.tournaments (id),
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lineups
CREATE TABLE public.lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL,
  match_type public.match_type NOT NULL,
  team_id UUID NOT NULL REFERENCES public.teams (id),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lineup Players
CREATE TABLE public.lineup_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id UUID NOT NULL REFERENCES public.lineups (id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles (id),
  position TEXT,
  is_starter BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  UNIQUE (lineup_id, player_id)
);

-- Sponsors
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  monthly_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status public.sponsor_status NOT NULL DEFAULT 'ativo',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Player Resumes
CREATE TABLE public.player_resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE UNIQUE,
  position TEXT NOT NULL DEFAULT 'meio',
  secondary_position TEXT,
  height INT,
  weight INT,
  dominant_foot TEXT DEFAULT 'destro',
  experience_years INT DEFAULT 0,
  previous_teams TEXT,
  achievements TEXT,
  video_url TEXT,
  availability TEXT NOT NULL DEFAULT 'disponivel' CHECK (availability IN ('disponivel', 'em_negociacao', 'indisponivel')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_player_resumes_updated_at
  BEFORE UPDATE ON public.player_resumes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Player Contracts
CREATE TABLE public.player_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles (id),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT current_date,
  end_date DATE,
  monthly_value NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'proposta' CHECK (status IN ('proposta', 'aceito', 'recusado', 'encerrado')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_player_contracts_updated_at
  BEFORE UPDATE ON public.player_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Job Offers
CREATE TABLE public.job_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles (id),
  message TEXT,
  position_offered TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aceita', 'recusada', 'cancelada')),
  created_by UUID NOT NULL REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Achievements
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('team', 'player')),
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  year INT NOT NULL,
  tournament_id UUID REFERENCES public.tournaments (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Player Stats
CREATE TABLE public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.profiles (id),
  tournament_id UUID NOT NULL REFERENCES public.tournaments (id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams (id),
  goals INT NOT NULL DEFAULT 0,
  assists INT NOT NULL DEFAULT 0,
  yellow_cards INT NOT NULL DEFAULT 0,
  red_cards INT NOT NULL DEFAULT 0,
  matches_played INT NOT NULL DEFAULT 0,
  minutes_played INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, tournament_id, team_id)
);

-- Referees
CREATE TABLE public.referees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  certification TEXT,
  experience_years INT DEFAULT 0,
  available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Venues
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  capacity INT,
  surface_type TEXT DEFAULT 'society',
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles (id),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'team', 'tournament')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisado', 'resolvido', 'arquivado')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.profiles (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'convite', 'proposta', 'resultado', 'sistema')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funcao: Conceder role
CREATE OR REPLACE FUNCTION public.grant_role(p_role public.app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET roles = array_append(roles, p_role)
  WHERE id = auth.uid() AND NOT (p_role = ANY(roles));
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_role(public.app_role) TO authenticated;

-- Triggers para updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_player_contracts_updated_at
  BEFORE UPDATE ON public.player_contracts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_job_offers_updated_at
  BEFORE UPDATE ON public.job_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendlies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lineup_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Teams
CREATE POLICY "teams_public_read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_captain_insert" ON public.teams FOR INSERT WITH CHECK (auth.uid() = captain_id);
CREATE POLICY "teams_captain_update" ON public.teams FOR UPDATE USING (auth.uid() = captain_id);
CREATE POLICY "teams_captain_delete" ON public.teams FOR DELETE USING (auth.uid() = captain_id);

-- Team Members
CREATE POLICY "team_members_public_read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_members_self_join" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "team_members_captain_update" ON public.team_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_members.team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "team_members_self_update" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);

-- Friendlies
CREATE POLICY "friendlies_public_read" ON public.friendlies FOR SELECT USING (true);
CREATE POLICY "friendlies_insert" ON public.friendlies FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "friendlies_update" ON public.friendlies FOR UPDATE USING (
  auth.uid() = created_by OR
  auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = home_team_id) OR
  auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = away_team_id)
);

-- Tournaments
CREATE POLICY "tournaments_public_read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_insert" ON public.tournaments FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "tournaments_update" ON public.tournaments FOR UPDATE USING (auth.uid() = organizer_id);
CREATE POLICY "tournaments_delete" ON public.tournaments FOR DELETE USING (auth.uid() = organizer_id);

-- Tournament Teams
CREATE POLICY "tournament_teams_public_read" ON public.tournament_teams FOR SELECT USING (true);
CREATE POLICY "tournament_teams_insert" ON public.tournament_teams FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "tournament_teams_update" ON public.tournament_teams FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
);

-- Matches
CREATE POLICY "matches_public_read" ON public.matches FOR SELECT USING (true);
CREATE POLICY "matches_insert" ON public.matches FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
);
CREATE POLICY "matches_update" ON public.matches FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.tournaments t WHERE t.id = tournament_id AND t.organizer_id = auth.uid())
);

-- Team Transactions
CREATE POLICY "team_transactions_read" ON public.team_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_id AND tm.user_id = auth.uid() AND tm.status = 'ativo')
);
CREATE POLICY "team_transactions_insert" ON public.team_transactions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);

-- Lineups
CREATE POLICY "lineups_read" ON public.lineups FOR SELECT USING (true);
CREATE POLICY "lineups_insert" ON public.lineups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Lineup Players
CREATE POLICY "lineup_players_read" ON public.lineup_players FOR SELECT USING (true);
CREATE POLICY "lineup_players_insert" ON public.lineup_players FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lineups l WHERE l.id = lineup_id AND l.created_by = auth.uid())
);

-- Sponsors
CREATE POLICY "sponsors_read" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "sponsors_insert" ON public.sponsors FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);

-- Player Resumes
CREATE POLICY "player_resumes_public_read" ON public.player_resumes FOR SELECT USING (true);
CREATE POLICY "player_resumes_own_insert" ON public.player_resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "player_resumes_own_update" ON public.player_resumes FOR UPDATE USING (auth.uid() = user_id);

-- Player Contracts
CREATE POLICY "player_contracts_read" ON public.player_contracts FOR SELECT USING (
  auth.uid() = player_id OR
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "player_contracts_insert" ON public.player_contracts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);

-- Job Offers
CREATE POLICY "job_offers_read" ON public.job_offers FOR SELECT USING (
  auth.uid() = player_id OR
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "job_offers_insert" ON public.job_offers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);
CREATE POLICY "job_offers_update" ON public.job_offers FOR UPDATE USING (
  auth.uid() = player_id OR
  EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.captain_id = auth.uid())
);

-- Achievements
CREATE POLICY "achievements_public_read" ON public.achievements FOR SELECT USING (true);

-- Player Stats
CREATE POLICY "player_stats_public_read" ON public.player_stats FOR SELECT USING (true);

-- Referees
CREATE POLICY "referees_public_read" ON public.referees FOR SELECT USING (true);

-- Venues
CREATE POLICY "venues_public_read" ON public.venues FOR SELECT USING (true);

-- Reports
CREATE POLICY "reports_own_read" ON public.reports FOR SELECT USING (
  auth.uid() = reporter_id OR
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND 'admin' = ANY(p.roles))
);
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Notifications
CREATE POLICY "notifications_own_read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
