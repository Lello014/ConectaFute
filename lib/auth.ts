import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
});

export function hasRole(profile: Profile | null, role: AppRole) {
  return profile?.roles?.includes(role) ?? false;
}

export function isAdmin(profile: Profile | null) {
  return hasRole(profile, "admin");
}

export async function requireUser() {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

export async function requireRole(role: AppRole) {
  const profile = await getProfile();
  if (!profile) {
    redirect("/login");
  }
  if (!profile!.roles.includes(role)) {
    redirect("/dashboard");
  }
  return profile!;
}

export async function requireAdmin() {
  const profile = await requireUser();
  if (!isAdmin(profile)) {
    redirect("/dashboard");
  }
  return profile;
}
