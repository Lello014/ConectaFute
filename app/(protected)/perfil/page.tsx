import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PerfilForm } from "./perfil-form";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const roles: string[] = profile.roles ?? ["player"];
  const isPlayer = roles.includes("player");

  const { data: resume } = isPlayer
    ? await supabase
        .from("player_resumes")
        .select("*")
        .eq("user_id", user.id)
        .single()
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-neutral-500">
          {isPlayer ? "Atualize seus dados e currículo" : "Atualize seus dados pessoais"}
        </p>
      </div>
      <PerfilForm profile={profile} resume={resume} isPlayer={isPlayer} />
    </div>
  );
}
