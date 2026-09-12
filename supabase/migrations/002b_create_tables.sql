-- PASSO 2: Criar novas tabelas e policies
-- Execute este script DEPOIS do passo 1 no SQL Editor do Supabase

-- ============================================================
-- CURRÍCULO DO JOGADOR
-- ============================================================

create table public.player_resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade unique,
  position text not null default 'meio',
  secondary_position text,
  height int,
  weight int,
  dominant_foot text default 'destro',
  experience_years int default 0,
  previous_teams text,
  achievements text,
  video_url text,
  availability text not null default 'disponivel' check (availability in ('disponivel', 'em_negociacao', 'indisponivel')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONTRATOS DE JOGADORES
-- ============================================================

create table public.player_contracts (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles (id),
  team_id uuid not null references public.teams (id) on delete cascade,
  start_date date not null default current_date,
  end_date date,
  monthly_value numeric(10,2) default 0,
  status text not null default 'proposta' check (status in ('proposta', 'aceito', 'recusado', 'encerrado')),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- VAGAS / PROPOSTAS DE TRABALHO
-- ============================================================

create table public.job_offers (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  player_id uuid not null references public.profiles (id),
  message text,
  position_offered text,
  status text not null default 'pendente' check (status in ('pendente', 'aceita', 'recusada', 'cancelada')),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CONQUISTAS
-- ============================================================

create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('team', 'player')),
  entity_id uuid not null,
  title text not null,
  description text,
  year int not null,
  tournament_id uuid references public.tournaments (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ESTATÍSTICAS DO JOGADOR
-- ============================================================

create table public.player_stats (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles (id),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_id uuid not null references public.teams (id),
  goals int not null default 0,
  assists int not null default 0,
  yellow_cards int not null default 0,
  red_cards int not null default 0,
  matches_played int not null default 0,
  minutes_played int not null default 0,
  created_at timestamptz not null default now(),
  unique (player_id, tournament_id, team_id)
);

-- ============================================================
-- ÁRBITROS
-- ============================================================

create table public.referees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  certification text,
  experience_years int default 0,
  available boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- LOCAIS / CAMPOS
-- ============================================================

create table public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  state text,
  capacity int,
  surface_type text default 'society',
  hourly_rate numeric(10,2) default 0,
  contact_phone text,
  contact_email text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DENÚNCIAS / MODERAÇÃO
-- ============================================================

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id),
  target_type text not null check (target_type in ('user', 'team', 'tournament')),
  target_id uuid not null,
  reason text not null,
  description text,
  status text not null default 'pendente' check (status in ('pendente', 'analisado', 'resolvido', 'arquivado')),
  admin_notes text,
  resolved_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICAÇÕES
-- ============================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info' check (type in ('info', 'convite', 'proposta', 'resultado', 'sistema')),
  read boolean not null default false,
  link text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT PARA NOVAS TABELAS
-- ============================================================

drop trigger if exists set_player_resumes_updated_at on public.player_resumes;
create trigger set_player_resumes_updated_at
  before update on public.player_resumes
  for each row execute function public.set_updated_at();

drop trigger if exists set_player_contracts_updated_at on public.player_contracts;
create trigger set_player_contracts_updated_at
  before update on public.player_contracts
  for each row execute function public.set_updated_at();

drop trigger if exists set_job_offers_updated_at on public.job_offers;
create trigger set_job_offers_updated_at
  before update on public.job_offers
  for each row execute function public.set_updated_at();

drop trigger if exists set_reports_updated_at on public.reports;
create trigger set_reports_updated_at
  before update on public.reports
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY - NOVAS TABELAS
-- ============================================================

alter table public.player_resumes enable row level security;
alter table public.player_contracts enable row level security;
alter table public.job_offers enable row level security;
alter table public.achievements enable row level security;
alter table public.player_stats enable row level security;
alter table public.referees enable row level security;
alter table public.venues enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

-- PLAYER RESUMES
create policy "player_resumes_public_read" on public.player_resumes for select using (true);
create policy "player_resumes_own_insert" on public.player_resumes for insert with check (auth.uid() = user_id);
create policy "player_resumes_own_update" on public.player_resumes for update using (auth.uid() = user_id);

-- PLAYER CONTRACTS
create policy "player_contracts_read" on public.player_contracts for select using (
  auth.uid() = player_id OR
  auth.uid() = created_by OR
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "player_contracts_insert" on public.player_contracts for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "player_contracts_update" on public.player_contracts for update using (
  auth.uid() = player_id OR
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);

-- JOB OFFERS
create policy "job_offers_read" on public.job_offers for select using (
  auth.uid() = player_id OR
  auth.uid() = created_by OR
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "job_offers_insert" on public.job_offers for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "job_offers_update" on public.job_offers for update using (
  auth.uid() = player_id OR
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);

-- ACHIEVEMENTS
create policy "achievements_public_read" on public.achievements for select using (true);
create policy "achievements_insert" on public.achievements for insert with check (true);
create policy "achievements_update" on public.achievements for update using (true);
create policy "achievements_delete" on public.achievements for delete using (true);

-- PLAYER STATS
create policy "player_stats_public_read" on public.player_stats for select using (true);
create policy "player_stats_insert" on public.player_stats for insert with check (true);
create policy "player_stats_update" on public.player_stats for update using (true);

-- REFEREES
create policy "referees_public_read" on public.referees for select using (true);
create policy "referees_own_insert" on public.referees for insert with check (auth.uid() = user_id);
create policy "referees_own_update" on public.referees for update using (auth.uid() = user_id);

-- VENUES
create policy "venues_public_read" on public.venues for select using (true);
create policy "venues_insert" on public.venues for insert with check (true);
create policy "venues_update" on public.venues for update using (true);
create policy "venues_delete" on public.venues for delete using (true);

-- REPORTS
create policy "reports_own_read" on public.reports for select using (
  auth.uid() = reporter_id OR
  auth.uid() = resolved_by OR
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);
create policy "reports_insert" on public.reports for insert with check (auth.uid() = reporter_id);
create policy "reports_admin_update" on public.reports for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);

-- NOTIFICATIONS
create policy "notifications_own_read" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_insert" on public.notifications for insert with check (true);
create policy "notifications_own_update" on public.notifications for update using (auth.uid() = user_id);
create policy "notifications_own_delete" on public.notifications for delete using (auth.uid() = user_id);

-- ============================================================
-- POLICIES DE ADMIN (Acesso total)
-- ============================================================

create policy "admin_read_all_profiles" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);

create policy "admin_read_all_teams" on public.teams for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);

create policy "admin_read_all_tournaments" on public.tournaments for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);

create policy "admin_read_all_matches" on public.matches for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);

create policy "admin_update_profiles" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and 'admin' = any(p.roles))
);
