"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export type ActionState = { error?: string; message?: string } | null;

export async function createTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const primaryColor = String(formData.get("primary_color") ?? "#059669").trim();
  const secondaryColor = String(formData.get("secondary_color") ?? "#ffffff").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  if (!name) return { error: "O time precisa de um nome." };

  const { data, error } = await supabase
    .from("teams")
    .insert({
      name,
      description,
      city,
      state,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
      captain_id: profile.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const [memberErr, roleErr] = await Promise.all([
    supabase.from("team_members").insert({
      team_id: data.id,
      user_id: profile.id,
      role: "captain",
      status: "ativo",
    }),
    supabase.rpc("grant_role", { p_role: "captain" }),
  ]);

  if (memberErr.error) return { error: memberErr.error.message };
  if (roleErr.error) return { error: roleErr.error.message };

  revalidatePath("/times");
  redirect(`/times/${data.id}`);
}

export async function updateTeam(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return { error: "Time inválido." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode editar o time." };
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const primaryColor = String(formData.get("primary_color") ?? "#059669").trim();
  const secondaryColor = String(formData.get("secondary_color") ?? "#ffffff").trim();
  const logoUrl = String(formData.get("logo_url") ?? "").trim() || null;

  if (!name) return { error: "O nome é obrigatório." };

  const { error } = await supabase
    .from("teams")
    .update({
      name,
      description,
      city,
      state,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      logo_url: logoUrl,
    })
    .eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}`);
  revalidatePath("/times");
  return { message: "Time atualizado." };
}

export async function requestJoinTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return { error: "Time inválido." };

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: profile.id,
    role: "player",
    status: "pendente",
  });

  if (error) {
    if (error.code === "23505") return { error: "Você já solicitou ingresso neste time." };
    return { error: error.message };
  }

  revalidatePath(`/times/${teamId}`);
  return { message: "Solicitação enviada ao capitão." };
}

export async function respondJoin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");
  const approve = formData.get("approve") === "1";

  if (!teamId || !memberId) return { error: "Dados inválidos." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode aprovar membros." };
  }

  const { error } = await supabase
    .from("team_members")
    .update({ status: approve ? "ativo" : "recusado" })
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}`);
  return { message: approve ? "Jogador aprovado." : "Solicitação recusada." };
}

export async function removeMember(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  const memberId = String(formData.get("member_id") ?? "");

  if (!teamId || !memberId) return { error: "Dados inválidos." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode remover membros." };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", memberId)
    .eq("team_id", teamId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}`);
  return { message: "Membro removido." };
}

export async function leaveTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return { error: "Time inválido." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (team?.captain_id === profile.id) {
    return { error: "O capitão não pode sair do time. Transfira a liderança primeiro." };
  }

  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", profile.id);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}`);
  return { message: "Você saiu do time." };
}

export async function deleteTeam(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return { error: "Time inválido." };

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode excluir o time." };
  }

  const { error } = await supabase.from("teams").delete().eq("id", teamId);

  if (error) return { error: error.message };

  revalidatePath("/times");
  redirect("/times");
}
