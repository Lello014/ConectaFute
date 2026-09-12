"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { SponsorStatus } from "@/lib/types";

export type ActionState = { error?: string; message?: string } | null;

export async function createSponsor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;
  const contactName = String(formData.get("contact_name") ?? "").trim() || null;
  const contactPhone = String(formData.get("contact_phone") ?? "").trim() || null;
  const contactEmail = String(formData.get("contact_email") ?? "").trim() || null;
  const monthlyValue = Number(formData.get("monthly_value") ?? 0);
  const startDate = String(formData.get("start_date") ?? "").trim() || null;
  const endDate = String(formData.get("end_date") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!teamId) return { error: "Time inválido." };
  if (!name) return { error: "O nome do patrocinador é obrigatório." };

  // Verifica se é capitão
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode adicionar patrocinadores." };
  }

  const { error } = await supabase.from("sponsors").insert({
    team_id: teamId,
    name,
    logo_url: logoUrl,
    contact_name: contactName,
    contact_phone: contactPhone,
    contact_email: contactEmail,
    monthly_value: monthlyValue,
    start_date: startDate,
    end_date: endDate,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}/patrocinadores`);
  return { message: "Patrocinador adicionado." };
}

export async function updateSponsorStatus(sponsorId: string, teamId: string, status: SponsorStatus) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode alterar patrocinadores." };
  }

  const { error } = await supabase
    .from("sponsors")
    .update({ status })
    .eq("id", sponsorId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}/patrocinadores`);
  return { message: "Status atualizado." };
}

export async function deleteSponsor(sponsorId: string, teamId: string) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode excluir patrocinadores." };
  }

  const { error } = await supabase
    .from("sponsors")
    .delete()
    .eq("id", sponsorId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}/patrocinadores`);
  return { message: "Patrocinador excluído." };
}
