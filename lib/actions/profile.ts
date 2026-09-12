"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { AppRole } from "@/lib/types";

export type ActionState = { error?: string; message?: string } | null;

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const state = String(formData.get("state") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (!fullName) return { error: "O nome é obrigatório." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, phone, city, state, bio })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/perfil");
  return { message: "Perfil atualizado." };
}
