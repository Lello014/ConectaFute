"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ActionState = { error?: string; message?: string } | null;

export async function createFriendly(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const homeTeamId = String(formData.get("home_team_id") ?? "");
  const awayTeamId = String(formData.get("away_team_id") ?? "");
  const scheduledAt = String(formData.get("scheduled_at") ?? "");
  const location = String(formData.get("location") ?? "").trim() || null;
  const format = String(formData.get("format") ?? "society").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!homeTeamId || !awayTeamId) return { error: "Selecione os dois times." };
  if (homeTeamId === awayTeamId) return { error: "Um time não pode jogar contra ele mesmo." };
  if (!scheduledAt) return { error: "Informe a data e hora do jogo." };

  const { data, error } = await supabase
    .from("friendlies")
    .insert({
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      scheduled_at: new Date(scheduledAt).toISOString(),
      location,
      format,
      notes,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/amistosos");
  redirect(`/amistosos/${data.id}`);
}

export async function updateFriendlyScore(
  friendlyId: string,
  homeScore: number,
  awayScore: number
) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: friendly } = await supabase
    .from("friendlies")
    .select("created_by, home_team_id, away_team_id")
    .eq("id", friendlyId)
    .single();

  if (!friendly) return { error: "Amistoso não encontrado." };

  // Verifica se é capitão de um dos times ou criador
  const isCreator = friendly.created_by === profile.id;

  const { data: homeTeam } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", friendly.home_team_id)
    .single();

  const { data: awayTeam } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", friendly.away_team_id)
    .single();

  const isHomeCaptain = homeTeam?.captain_id === profile.id;
  const isAwayCaptain = awayTeam?.captain_id === profile.id;

  if (!isCreator && !isHomeCaptain && !isAwayCaptain) {
    return { error: "Você não tem permissão para atualizar o placar." };
  }

  const { error } = await supabase
    .from("friendlies")
    .update({ home_score: homeScore, away_score: awayScore, status: "realizado" })
    .eq("id", friendlyId);

  if (error) return { error: error.message };

  revalidatePath(`/amistosos/${friendlyId}`);
  return { message: "Placar registrado." };
}

export async function cancelFriendly(friendlyId: string) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("friendlies")
    .update({ status: "cancelado" })
    .eq("id", friendlyId)
    .eq("created_by", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/amistosos");
  revalidatePath(`/amistosos/${friendlyId}`);
  return { message: "Amistoso cancelado." };
}
