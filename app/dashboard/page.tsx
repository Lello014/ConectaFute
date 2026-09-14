import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

  const roles = profile?.roles ?? ["player"];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-neutral-500">
            Bem-vindo, {profile?.full_name || user.email}
          </p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Sair
          </button>
        </form>
      </div>

      {/* Roles */}
      <div className="mt-6 flex flex-wrap gap-2">
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

      {/* Quick Actions */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          href="/perfil"
          icon="👤"
          title="Meu Perfil"
          description="Edite seu perfil e curriculo"
        />
        <DashboardCard
          href="/times"
          icon="⚽"
          title="Meus Times"
          description="Gerencie seus times"
        />
        <DashboardCard
          href="/torneios"
          icon="🏆"
          title="Torneios"
          description="Encontre e participe"
        />
        <DashboardCard
          href="/amistosos"
          icon="🤝"
          title="Amistosos"
          description="Marque partidas"
        />
        <DashboardCard
          href="/vagas"
          icon="📋"
          title="Vagas"
          description="Veja oportunidades"
        />
        <DashboardCard
          href="/locais"
          icon="📍"
          title="Locais"
          description="Campos e arenas"
        />
      </div>
    </div>
  );
}

function DashboardCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500">{description}</p>
    </Link>
  );
}
