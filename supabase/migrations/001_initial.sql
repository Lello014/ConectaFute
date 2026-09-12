-- Conecta Fute - Schema completo
-- Execute este script no SQL Editor do seu projeto Supabase.

-- ============================================================
-- ENUMS
-- ============================================================

create type public.app_role as enum ('player', 'captain', 'organizer');
create type public.friendly_status as enum ('pendente', 'confirmado', 'realizado', 'cancelado');
create type public.tournament_status as enum ('inscricoes', 'em_andamento', 'encerrado');
create type public.transaction_type as enum ('receita', 'despesa');
create type public.transaction_category as enum ('mensalidade', 'patrocinio', 'aluguel_campo', 'arbitragem', 'material', 'transporte', 'premiacao', 'outros');
create type public.sponsor_status as enum ('ativo', 'pausado', 'encerrado');
create type public.match_type as enum ('friendly', 'tournament');

-- ============================================================
-- PROFILES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  city text,
  state text,
  bio text,
  avatar_url text,
  roles public.app_role[] not null default array['player'::public.app_role],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TEAMS
-- ============================================================

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  logo_url text,
  primary_color text not null default '#059669',
  secondary_color text not null default '#ffffff',
  city text,
  state text,
  captain_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'player' check (role in ('captain', 'player')),
  status text not null default 'pendente' check (status in ('pendente', 'ativo', 'recusado')),
  jersey_number int,
  position text,
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);

-- ============================================================
-- FRIENDLIES (Amistosos)
-- ============================================================

create table public.friendlies (
  id uuid primary key default gen_random_uuid(),
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  scheduled_at timestamptz not null,
  location text,
  format text not null default 'society',
  status public.friendly_status not null default 'pendente',
  home_score int,
  away_score int,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- TOURNAMENTS (Torneios)
-- ============================================================

create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  format text not null default 'society',
  city text,
  state text,
  starts_at date,
  ends_at date,
  max_teams int,
  registration_fee numeric(8,2) not null default 0,
  prize text,
  status public.tournament_status not null default 'inscricoes',
  organizer_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.tournament_teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  status text not null default 'pendente' check (status in ('pendente', 'aprovado', 'rejeitado')),
  created_at timestamptz not null default now(),
  unique (tournament_id, team_id)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments (id) on delete cascade,
  home_team_id uuid not null references public.teams (id),
  away_team_id uuid not null references public.teams (id),
  round int,
  group_label text,
  scheduled_at timestamptz,
  home_score int,
  away_score int,
  status text not null default 'agendado' check (status in ('agendado', 'jogado', 'cancelado')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- FINANCE (Gestão financeira por time)
-- ============================================================

create table public.team_transactions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  type public.transaction_type not null,
  category public.transaction_category not null default 'outros',
  description text not null,
  amount numeric(10,2) not null default 0,
  transaction_date date not null default current_date,
  tournament_id uuid references public.tournaments (id),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- LINEUPS (Escalações)
-- ============================================================

create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  match_type public.match_type not null,
  team_id uuid not null references public.teams (id),
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.lineup_players (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups (id) on delete cascade,
  player_id uuid not null references public.profiles (id),
  position text,
  is_starter boolean not null default true,
  sort_order int not null default 0,
  unique (lineup_id, player_id)
);

-- ============================================================
-- SPONSORS (Patrocinadores)
-- ============================================================

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  logo_url text,
  contact_name text,
  contact_phone text,
  contact_email text,
  monthly_value numeric(10,2) not null default 0,
  start_date date,
  end_date date,
  status public.sponsor_status not null default 'ativo',
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROLES
-- ============================================================

create or replace function public.grant_role(p_role public.app_role)
returns void
language plpgsql
security definer set search_path = public
set config.granting_role = 'on'
as $$
begin
  update public.profiles
  set roles = array_append(roles, p_role)
  where id = auth.uid() and not (p_role = any(roles));
end;
$$;

grant execute on function public.grant_role(public.app_role) to authenticated;

create or replace function public.protect_profile_roles()
returns trigger
language plpgsql
as $$
begin
  if new.roles is distinct from old.roles
     and coalesce(current_setting('config.granting_role', true), 'off') <> 'on' then
    raise exception 'Roles não podem ser alterados diretamente.';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profiles_roles on public.profiles;
create trigger protect_profiles_roles
  before update of roles on public.profiles
  for each row execute function public.protect_profile_roles();

-- ============================================================
-- UPDATED_AT
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.friendlies enable row level security;
alter table public.tournaments enable row level security;
alter table public.tournament_teams enable row level security;
alter table public.matches enable row level security;
alter table public.team_transactions enable row level security;
alter table public.lineups enable row level security;
alter table public.lineup_players enable row level security;
alter table public.sponsors enable row level security;

-- PROFILES
create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_own_insert" on public.profiles for insert with check (auth.uid() = id);

-- TEAMS
create policy "teams_public_read" on public.teams for select using (true);
create policy "teams_captain_insert" on public.teams for insert with check (auth.uid() = captain_id);
create policy "teams_captain_update" on public.teams for update using (auth.uid() = captain_id);
create policy "teams_captain_delete" on public.teams for delete using (auth.uid() = captain_id);

-- TEAM MEMBERS
create policy "team_members_public_read" on public.team_members for select using (true);
create policy "team_members_self_join" on public.team_members for insert with check (auth.uid() = user_id);
create policy "team_members_captain_update" on public.team_members for update using (
  exists (select 1 from public.teams t where t.id = team_members.team_id and t.captain_id = auth.uid())
);
create policy "team_members_self_update" on public.team_members for update using (auth.uid() = user_id);

-- FRIENDLIES
create policy "friendlies_public_read" on public.friendlies for select using (true);
create policy "friendlies_insert" on public.friendlies for insert with check (auth.uid() = created_by);
create policy "friendlies_update" on public.friendlies for update using (
  auth.uid() = created_by OR
  auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = home_team_id) OR
  auth.uid() IN (SELECT captain_id FROM public.teams WHERE id = away_team_id)
);
create policy "friendlies_delete" on public.friendlies for delete using (auth.uid() = created_by);

-- TOURNAMENTS
create policy "tournaments_public_read" on public.tournaments for select using (true);
create policy "tournaments_insert" on public.tournaments for insert with check (auth.uid() = organizer_id);
create policy "tournaments_update" on public.tournaments for update using (auth.uid() = organizer_id);
create policy "tournaments_delete" on public.tournaments for delete using (auth.uid() = organizer_id);

-- TOURNAMENT TEAMS
create policy "tournament_teams_public_read" on public.tournament_teams for select using (true);
create policy "tournament_teams_insert" on public.tournament_teams for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "tournament_teams_update" on public.tournament_teams for update using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);

-- MATCHES
create policy "matches_public_read" on public.matches for select using (true);
create policy "matches_insert" on public.matches for insert with check (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);
create policy "matches_update" on public.matches for update using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);
create policy "matches_delete" on public.matches for delete using (
  exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
);

-- TEAM TRANSACTIONS
create policy "team_transactions_read" on public.team_transactions for select using (
  exists (select 1 from public.team_members tm where tm.team_id = team_id and tm.user_id = auth.uid() and tm.status = 'ativo')
);
create policy "team_transactions_insert" on public.team_transactions for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "team_transactions_delete" on public.team_transactions for delete using (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);

-- LINEUPS
create policy "lineups_read" on public.lineups for select using (true);
create policy "lineups_insert" on public.lineups for insert with check (auth.uid() = created_by);
create policy "lineups_update" on public.lineups for update using (auth.uid() = created_by);
create policy "lineups_delete" on public.lineups for delete using (auth.uid() = created_by);

-- LINEUP PLAYERS
create policy "lineup_players_read" on public.lineup_players for select using (true);
create policy "lineup_players_insert" on public.lineup_players for insert with check (
  exists (select 1 from public.lineups l where l.id = lineup_id and l.created_by = auth.uid())
);
create policy "lineup_players_delete" on public.lineup_players for delete using (
  exists (select 1 from public.lineups l where l.id = lineup_id and l.created_by = auth.uid())
);

-- SPONSORS
create policy "sponsors_read" on public.sponsors for select using (true);
create policy "sponsors_insert" on public.sponsors for insert with check (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "sponsors_update" on public.sponsors for update using (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
create policy "sponsors_delete" on public.sponsors for delete using (
  exists (select 1 from public.teams t where t.id = team_id and t.captain_id = auth.uid())
);
