"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ActionState = { error?: string; message?: string } | null;

export async function createTournament(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const format = String(formData.get("format") ?? "society").trim();
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const startsAt = String(formData.get("starts_at") ?? "").trim() || null;
  const endsAt = String(formData.get("ends_at") ?? "").trim() || null;
  const maxTeams = Number(formData.get("max_teams") ?? 0) || null;
  const registrationFee = Number(formData.get("registration_fee") ?? 0);
  const prize = String(formData.get("prize") ?? "").trim() || null;

  if (!name) return { error: "O torneio precisa de um nome." };

  const { data, error } = await supabase
    .from("tournaments")
    .insert({
      name,
      description,
      format,
      city,
      state,
      starts_at: startsAt,
      ends_at: endsAt,
      max_teams: maxTeams,
      registration_fee: registrationFee,
      prize,
      organizer_id: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.rpc("grant_role", { p_role: "organizer" });

  revalidatePath("/torneios");
  redirect(`/torneios/${data.id}`);
}

export async function registerTeamInTournament(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const tournamentId = String(formData.get("tournament_id") ?? "");
  const teamId = String(formData.get("team_id") ?? "");

  if (!tournamentId || !teamId) return { error: "Selecione o torneio e o time." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode inscrever o time." };
  }

  const { error } = await supabase.from("tournament_teams").insert({
    tournament_id: tournamentId,
    team_id: teamId,
    status: "pendente",
  });

  if (error) {
    if (error.code === "23505") return { error: "Este time já está inscrito neste torneio." };
    return { error: error.message };
  }

  revalidatePath(`/torneios/${tournamentId}`);
  return { message: "Inscrição enviada! Aguarde a aprovação do organizador." };
}

export async function respondTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const tournamentId = String(formData.get("tournament_id") ?? "");
  const registrationId = String(formData.get("registration_id") ?? "");
  const approve = formData.get("approve") === "1";

  if (!tournamentId || !registrationId) return { error: "Dados inválidos." };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("organizer_id")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.organizer_id !== profile.id) {
    return { error: "Apenas o organizador pode aprovar inscrições." };
  }

  const { error } = await supabase
    .from("tournament_teams")
    .update({ status: approve ? "aprovado" : "rejeitado" })
    .eq("id", registrationId)
    .eq("tournament_id", tournamentId);

  if (error) return { error: error.message };

  revalidatePath(`/torneios/${tournamentId}`);
  return { message: approve ? "Time aprovado." : "Inscrição recusada." };
}

export async function createMatch(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const tournamentId = String(formData.get("tournament_id") ?? "");
  const homeTeamId = String(formData.get("home_team_id") ?? "");
  const awayTeamId = String(formData.get("away_team_id") ?? "");
  const groupLabel = String(formData.get("group_label") ?? "").trim() || null;
  const round = Number(formData.get("round") ?? 1) || null;
  const scheduledAt = String(formData.get("scheduled_at") ?? "");

  if (!tournamentId || !homeTeamId || !awayTeamId) {
    return { error: "Informe os dois times." };
  }
  if (homeTeamId === awayTeamId) return { error: "Um time não pode jogar contra ele mesmo." };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("organizer_id")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.organizer_id !== profile.id) {
    return { error: "Apenas o organizador pode criar partidas." };
  }

  const { error } = await supabase.from("matches").insert({
    tournament_id: tournamentId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    group_label: groupLabel,
    round,
    scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/torneios/${tournamentId}`);
  return { message: "Partida criada." };
}

export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: match } = await supabase
    .from("matches")
    .select("tournament_id")
    .eq("id", matchId)
    .single();

  if (!match) return { error: "Partida não encontrada." };

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("organizer_id")
    .eq("id", match.tournament_id)
    .single();

  if (!tournament || tournament.organizer_id !== profile.id) {
    return { error: "Apenas o organizador pode registrar o placar." };
  }

  const { error } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, status: "jogado" })
    .eq("id", matchId);

  if (error) return { error: error.message };

  revalidatePath(`/torneios/${match.tournament_id}`);
  return { message: "Placar registrado." };
}

export async function updateTournamentStatus(tournamentId: string, status: string) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("organizer_id")
    .eq("id", tournamentId)
    .single();

  if (!tournament || tournament.organizer_id !== profile.id) {
    return { error: "Apenas o organizador pode alterar o status." };
  }

  const { error } = await supabase
    .from("tournaments")
    .update({ status })
    .eq("id", tournamentId);

  if (error) return { error: error.message };

  revalidatePath(`/torneios/${tournamentId}`);
  return { message: "Status atualizado." };
}
