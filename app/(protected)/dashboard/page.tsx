import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerDashboard } from "./player-dashboard";

export default async function DashboardPage() {
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

  const roles: string[] = profile?.roles ?? ["player"];
  const primaryRole = roles[0];

  // Dashboard do jogador
  if (primaryRole === "player") {
    return <PlayerDashboard />;
  }

  // Dashboard do capitão/time
  if (primaryRole === "captain") {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Capitão</h1>
        <p className="mt-2 text-neutral-500">Gerencie seu time aqui.</p>
      </div>
    );
  }

  // Dashboard do organizador
  if (primaryRole === "organizer") {
    return (
      <div>
        <h1 className="text-2xl font-bold">Dashboard do Organizador</h1>
        <p className="mt-2 text-neutral-500">Gerencie seus torneios aqui.</p>
      </div>
    );
  }

  // Dashboard admin
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard Admin</h1>
      <p className="mt-2 text-neutral-500">Painel administrativo.</p>
    </div>
  );
}
