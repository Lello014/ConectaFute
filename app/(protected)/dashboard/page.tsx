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
    const { data: team } = await supabase
      .from("teams")
      .select("name")
      .eq("captain_id", user.id)
      .single();

    return (
      <div>
        <h1 className="text-2xl font-bold">
          Bem-vindo, <span className="text-emerald-400">{team?.name || profile?.full_name}</span>
        </h1>
      </div>
    );
  }

  // Dashboard do organizador
  if (primaryRole === "organizer") {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Bem-vindo, <span className="text-emerald-400">{profile?.full_name}</span>
        </h1>
      </div>
    );
  }

  // Dashboard admin
  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bem-vindo, <span className="text-emerald-400">{profile?.full_name}</span>
      </h1>
    </div>
  );
}
