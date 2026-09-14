import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Bem-vindo, {profile?.full_name || user.email}!
      </h1>

      {/* Roles */}
      <div className="mt-4 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span
            key={role}
            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            {role === "player" && "👤 Jogador"}
            {role === "captain" && "⚽ Capitao/Time"}
            {role === "organizer" && "🏆 Organizador"}
            {role === "admin" && "🛡️ Admin"}
          </span>
        ))}
      </div>

      {/* Stats placeholder */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="⚽" label="Times" value="—" />
        <StatCard icon="🏆" label="Torneios" value="—" />
        <StatCard icon="🤝" label="Amistosos" value="—" />
        <StatCard icon="📋" label="Propostas" value="—" />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="text-2xl">{icon}</div>
      <p className="mt-2 text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
