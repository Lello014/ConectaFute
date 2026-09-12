"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { MatchType } from "@/lib/types";

export type ActionState = { error?: string; message?: string } | null;

export async function createLineup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const matchId = String(formData.get("match_id") ?? "");
  const matchType = String(formData.get("match_type") ?? "friendly") as MatchType;
  const teamId = String(formData.get("team_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!matchId || !teamId) return { error: "Dados inválidos." };

  const { data, error } = await supabase
    .from("lineups")
    .insert({
      match_id: matchId,
      match_type: matchType,
      team_id: teamId,
      notes,
      created_by: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/escalacao/${matchType}/${matchId}`);
  return { message: "Escalação criada." };
}

export async function updateLineupPlayers(lineupId: string, players: {
  player_id: string;
  position: string | null;
  is_starter: boolean;
  sort_order: number;
}[]) {
  const profile = await requireUser();
  const supabase = await createClient();

  // Verifica permissão
  const { data: lineup } = await supabase
    .from("lineups")
    .select("created_by, match_type, match_id, team_id")
    .eq("id", lineupId)
    .single();

  if (!lineup || lineup.created_by !== profile.id) {
    return { error: "Você não tem permissão para editar esta escalação." };
  }

  // Remove jogadores antigos
  await supabase.from("lineup_players").delete().eq("lineup_id", lineupId);

  // Insere novos jogadores
  if (players.length > 0) {
    const { error } = await supabase.from("lineup_players").insert(
      players.map((p) => ({
        lineup_id: lineupId,
        player_id: p.player_id,
        position: p.position,
        is_starter: p.is_starter,
        sort_order: p.sort_order,
      }))
    );

    if (error) return { error: error.message };
  }

  revalidatePath(`/escalacao/${lineup.match_type}/${lineup.match_id}`);
  return { message: "Escalação atualizada." };
}

export async function getLineupForMatch(matchId: string, matchType: string) {
  const supabase = await createClient();

  const { data: lineup } = await supabase
    .from("lineups")
    .select(
      `
      *,
      team:teams (id, name, logo_url, primary_color),
      lineup_players (
        id, player_id, position, is_starter, sort_order,
        player:profiles (id, full_name, avatar_url, phone)
      )
    `
    )
    .eq("match_id", matchId)
    .eq("match_type", matchType)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return lineup as unknown as {
    id: string;
    match_id: string;
    match_type: string;
    team_id: string;
    notes: string | null;
    created_by: string;
    team: { id: string; name: string; logo_url: string | null; primary_color: string } | null;
    lineup_players: {
      id: string;
      player_id: string;
      position: string | null;
      is_starter: boolean;
      sort_order: number;
      player: { id: string; full_name: string; avatar_url: string | null; phone: string | null } | null;
    }[];
  } | null;
}
