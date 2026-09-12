"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ActionState = { error?: string; message?: string } | null;

export async function upsertPlayerResume(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const position = String(formData.get("position") ?? "meio").trim();
  const secondaryPosition = String(formData.get("secondary_position") ?? "").trim() || null;
  const height = formData.get("height") ? Number(formData.get("height")) : null;
  const weight = formData.get("weight") ? Number(formData.get("weight")) : null;
  const dominantFoot = String(formData.get("dominant_foot") ?? "destro").trim();
  const experienceYears = formData.get("experience_years") ? Number(formData.get("experience_years")) : 0;
  const previousTeams = String(formData.get("previous_teams") ?? "").trim() || null;
  const achievements = String(formData.get("achievements") ?? "").trim() || null;
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;
  const availability = String(formData.get("availability") ?? "disponivel").trim();

  const { data: existing } = await supabase
    .from("player_resumes")
    .select("id")
    .eq("user_id", profile.id)
    .single();

  const resumeData = {
    user_id: profile.id,
    position,
    secondary_position: secondaryPosition,
    height,
    weight,
    dominant_foot: dominantFoot,
    experience_years: experienceYears,
    previous_teams: previousTeams,
    achievements,
    video_url: videoUrl,
    availability,
  };

  let error;

  if (existing) {
    const result = await supabase
      .from("player_resumes")
      .update(resumeData)
      .eq("id", existing.id);
    error = result.error;
  } else {
    const result = await supabase
      .from("player_resumes")
      .insert(resumeData);
    error = result.error;
  }

  if (error) return { error: error.message };

  revalidatePath("/perfil/curriculo");
  return { message: "Currículo atualizado com sucesso!" };
}
