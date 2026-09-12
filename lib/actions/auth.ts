"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; message?: string } | null;

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect("/dashboard");
}

export async function register(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim() || null;

  // Dados do time
  const teamName = String(formData.get("team_name") ?? "").trim();
  const teamCity = String(formData.get("team_city") ?? "").trim() || null;
  const teamState = String(formData.get("team_state") ?? "").trim() || null;
  const teamDescription = String(formData.get("team_description") ?? "").trim() || null;
  const teamPrimaryColor = String(formData.get("team_primary_color") ?? "#059669").trim();
  const teamSecondaryColor = String(formData.get("team_secondary_color") ?? "#ffffff").trim();

  if (!fullName || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }

  if (!teamName) {
    return { error: "Informe o nome do seu time." };
  }

  if (password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    if (error.message.includes("already")) {
      return { error: "Este e-mail já está cadastrado." };
    }
    return { error: "Erro ao criar conta. Tente novamente." };
  }

  // Cria o time do usuário
  if (data.user) {
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: teamName,
        description: teamDescription,
        city: teamCity,
        state: teamState,
        primary_color: teamPrimaryColor,
        secondary_color: teamSecondaryColor,
        captain_id: data.user.id,
      })
      .select("id")
      .single();

    if (!teamError && team) {
      // Adiciona o usuário como capitão do time
      await supabase.from("team_members").insert({
        team_id: team.id,
        user_id: data.user.id,
        role: "captain",
        status: "ativo",
      });

      // Concede role de captain
      await supabase.rpc("grant_role", { p_role: "captain" });
    }
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
