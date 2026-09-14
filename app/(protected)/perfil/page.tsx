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

  const { data: resume } = await supabase
    .from("player_resumes")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-neutral-500">Atualize seus dados e currículo</p>
      </div>
      <PerfilForm profile={profile!} resume={resume} />
    </div>
  );
}
