import { createClient } from "@/lib/supabase/server";
import { PlayerCard } from "@/components/player/player-card";

export async function PlayerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

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

  // Buscar time atual
  const { data: memberTeam } = await supabase
    .from("team_members")
    .select("teams(name, logo_url)")
    .eq("user_id", user.id)
    .eq("status", "ativo")
    .single();

  const teamName = (memberTeam as any)?.teams?.name;
  const teamLogo = (memberTeam as any)?.teams?.logo_url;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Bem-vindo, {profile?.nickname || profile?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-neutral-500">Seu perfil de jogador</p>
      </div>

      {/* Player Card */}
      <div className="flex justify-center">
        <PlayerCard
          fullName={profile?.full_name || ""}
          nickname={profile?.nickname || undefined}
          jerseyNumber={resume?.jersey_number || undefined}
          position={resume?.position || "meia"}
          secondaryPosition={resume?.secondary_position || undefined}
          teamName={teamName}
          teamLogo={teamLogo}
          height={resume?.height || undefined}
          weight={resume?.weight || undefined}
          dominantFoot={resume?.dominant_foot || "destro"}
          nationality={resume?.nationality || undefined}
          overallRating={resume?.overall_rating || 50}
          potentialRating={resume?.potential_rating || 50}
          traits={resume?.traits || []}
          experienceYears={resume?.experience_years || 0}
          availability={resume?.availability || "disponivel"}
          avatarUrl={profile?.avatar_url || undefined}
        />
      </div>

      {/* Quick Actions */}
      <div className="mx-auto max-w-[420px] grid grid-cols-2 gap-3">
        <a
          href="/perfil"
          className="rounded-xl border border-neutral-200 bg-white p-4 text-center transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="text-2xl">✏️</div>
          <p className="mt-1 text-sm font-medium">Editar Perfil</p>
        </a>
        <a
          href="/vagas"
          className="rounded-xl border border-neutral-200 bg-white p-4 text-center transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="text-2xl">📋</div>
          <p className="mt-1 text-sm font-medium">Ver Vagas</p>
        </a>
        <a
          href="/times"
          className="rounded-xl border border-neutral-200 bg-white p-4 text-center transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="text-2xl">⚽</div>
          <p className="mt-1 text-sm font-medium">Meus Times</p>
        </a>
        <a
          href="/torneios"
          className="rounded-xl border border-neutral-200 bg-white p-4 text-center transition hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="text-2xl">🏆</div>
          <p className="mt-1 text-sm font-medium">Torneios</p>
        </a>
      </div>
    </div>
  );
}
