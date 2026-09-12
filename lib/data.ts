import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Team, TeamMember, Friendly, Tournament, TournamentTeam, Match, TeamTransaction, Sponsor } from "@/lib/types";

type UUID = string;

// ---------- Times ----------

export async function listTeams(opts?: { city?: string }) {
  const supabase = await createClient();
  let query = supabase
    .from("teams")
    .select(`*, profiles!teams_captain_id_fkey (id, full_name, avatar_url), team_members (id, user_id, role, status)`)
    .order("created_at", { ascending: false });
  if (opts?.city) query = query.eq("city", opts.city);
  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data as TeamWithRelations[];
}

export async function getTeam(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select(`*, profiles!teams_captain_id_fkey (id, full_name, avatar_url, phone), team_members (id, user_id, role, status, jersey_number, position, joined_at, profiles (id, full_name, avatar_url, phone))`)
    .eq("id", id).single();
  if (error) return null;
  return data as unknown as TeamDetail;
}

export async function getMyTeams(profileId: UUID) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_members")
    .select(`id, role, status, position, jersey_number, teams!inner (*, profiles!teams_captain_id_fkey (id, full_name), team_members (id, user_id, role, status))`)
    .eq("user_id", profileId).order("joined_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as { id: string; role: string; status: string; position: string | null; jersey_number: number | null; teams: TeamWithRelations }[];
}

export async function getTeamPlayers(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select(`id, user_id, profiles (id, full_name, avatar_url, phone)`)
    .eq("team_id", teamId)
    .eq("status", "ativo");
  return (data ?? []) as unknown as { id: string; user_id: string; profiles: { id: string; full_name: string; avatar_url: string | null; phone: string | null } | null }[];
}

// ---------- Amistosos ----------

export async function listFriendlies() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendlies")
    .select(`*, home_team:teams!friendlies_home_team_id_fkey (id, name, logo_url, primary_color), away_team:teams!friendlies_away_team_id_fkey (id, name, logo_url, primary_color)`)
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return data as FriendlyWithRelations[];
}

export async function getFriendly(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("friendlies")
    .select(`*, home_team:teams!friendlies_home_team_id_fkey (id, name, logo_url, primary_color), away_team:teams!friendlies_away_team_id_fkey (id, name, logo_url, primary_color), creator:profiles!friendlies_created_by_fkey (id, full_name)`)
    .eq("id", id).single();
  if (error) return null;
  return data as unknown as FriendlyWithRelations;
}

export async function getMyTeamFriendlies(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("friendlies")
    .select(`id, scheduled_at, status, home_score, away_score, home_team:teams!friendlies_home_team_id_fkey (id, name, primary_color), away_team:teams!friendlies_away_team_id_fkey (id, name, primary_color)`)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order("scheduled_at", { ascending: true });
  return (data ?? []) as any[];
}

// ---------- Torneios ----------

export async function listTournaments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(`*, organizer:profiles!tournaments_organizer_id_fkey (id, full_name, avatar_url), tournament_teams (id, team_id, status)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as TournamentWithRelations[];
}

export async function getTournament(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select(`*, organizer:profiles!tournaments_organizer_id_fkey (id, full_name, avatar_url, phone), tournament_teams (id, team_id, status, created_at, teams (id, name, logo_url, primary_color, captain_id)), matches (id, home_team_id, away_team_id, round, group_label, scheduled_at, home_score, away_score, status, home_team:teams!matches_home_team_id_fkey (id, name, logo_url, primary_color), away_team:teams!matches_away_team_id_fkey (id, name, logo_url, primary_color))`)
    .eq("id", id).single();
  if (error) return null;
  return data as unknown as TournamentWithRelations;
}

// ---------- Finance ----------

export async function getTeamTransactions(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_transactions")
    .select(`*`)
    .eq("team_id", teamId)
    .order("transaction_date", { ascending: false });
  return (data ?? []) as TeamTransaction[];
}

// ---------- Sponsors ----------

export async function getTeamSponsors(teamId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sponsors")
    .select(`*`)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  return (data ?? []) as Sponsor[];
}

// ---------- Tipos com relações ----------

export interface TeamWithRelations extends Team {
  profiles?: Pick<Profile, "id" | "full_name" | "avatar_url">;
  team_members?: Pick<TeamMember, "id" | "user_id" | "role" | "status">[];
}

export interface TeamDetail extends TeamWithRelations {
  profiles?: Pick<Profile, "id" | "full_name" | "avatar_url" | "phone">;
  team_members?: (Pick<TeamMember, "id" | "user_id" | "role" | "status" | "jersey_number" | "position" | "joined_at"> & {
    profiles?: Pick<Profile, "id" | "full_name" | "avatar_url" | "phone"> & { position?: string | null };
  })[];
}

export interface FriendlyWithRelations extends Friendly {
  home_team?: Pick<Team, "id" | "name" | "logo_url" | "primary_color">;
  away_team?: Pick<Team, "id" | "name" | "logo_url" | "primary_color">;
  creator?: Pick<Profile, "id" | "full_name">;
}

export interface TournamentWithRelations extends Tournament {
  organizer?: Pick<Profile, "id" | "full_name" | "avatar_url" | "phone">;
  tournament_teams?: (TournamentTeam & { teams?: Pick<Team, "id" | "name" | "logo_url" | "primary_color" | "captain_id"> })[];
  matches?: (Match & {
    home_team?: Pick<Team, "id" | "name" | "logo_url" | "primary_color">;
    away_team?: Pick<Team, "id" | "name" | "logo_url" | "primary_color">;
  })[];
}
