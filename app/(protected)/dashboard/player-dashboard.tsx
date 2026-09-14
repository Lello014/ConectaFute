import { createClient } from "@/lib/supabase/server";
import { PlayerCard } from "@/components/player/player-card";
import { PlayerHistory } from "@/components/player/player-history";
import { PlayerStatsSection } from "@/components/player/player-stats";
import { PlayerMarketStatus } from "@/components/player/player-market";

export async function PlayerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: resume } = await supabase.from("player_resumes").select("*").eq("user_id", user.id).single();

  const { data: memberTeam } = await supabase
    .from("team_members").select("teams(name)").eq("user_id", user.id).eq("status", "ativo").single();
  const teamName = (memberTeam as any)?.teams?.name;

  // Buscar atributos avaliados por capitães
  const { data: attributes } = await supabase
    .from("player_attributes").select("*").eq("player_id", user.id);

  // Buscar conquistas do jogador
  const { data: achievements } = await supabase
    .from("achievements").select("*").eq("entity_type", "player").eq("entity_id", user.id);

  // Calcular idade
  let age: number | undefined;
  if (resume?.birthday) {
    const born = new Date(resume.birthday);
    const today = new Date();
    age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  }

  // Stats agregadas
  const { data: statsRows } = await supabase
    .from("player_stats").select("goals, assists, yellow_cards, red_cards, matches_played, minutes_played").eq("player_id", user.id);

  const totalStats = (statsRows || []).reduce(
    (acc, s) => ({
      matches_played: acc.matches_played + s.matches_played,
      goals: acc.goals + s.goals,
      assists: acc.assists + s.assists,
      yellow_cards: acc.yellow_cards + s.yellow_cards,
      red_cards: acc.red_cards + s.red_cards,
      minutes_played: acc.minutes_played + s.minutes_played,
    }),
    { matches_played: 0, goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, minutes_played: 0 }
  );

  const firstName = profile?.nickname || profile?.full_name?.split(" ")[0] || "Jogador";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#0d1526] via-[#0a1a14] to-[#0d1526] p-6">
        <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-emerald-500/[0.08] blur-[40px]" />
        <h1 className="text-2xl font-black text-white">
          Olá, <span className="text-emerald-400">{firstName}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-neutral-500">Seu cartão de apresentação está pronto.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <QuickStat label="Nível" value={resume?.overall_rating?.toString() || "50"} />
        <QuickStat label="Time" value={teamName || "—"} highlight={!teamName} />
        <QuickStat label="Jogos" value={totalStats.matches_played.toString()} />
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
          height={resume?.height || undefined}
          weight={resume?.weight || undefined}
          dominantFoot={resume?.dominant_foot || "destro"}
          neighborhood={resume?.neighborhood || undefined}
          overallRating={resume?.overall_rating || 50}
          potentialRating={resume?.potential_rating || 50}
          traits={resume?.traits || []}
          experienceYears={resume?.experience_years || 0}
          availability={resume?.availability || "disponivel"}
          marketStatus={resume?.market_status || "disponivel"}
          avatarUrl={profile?.avatar_url || undefined}
          age={age}
        />
      </div>

      {/* Status de Mercado */}
      <PlayerMarketStatus userId={user.id} currentStatus={resume?.market_status || "disponivel"} />

      {/* Histórico */}
      <PlayerHistory
        currentTeamName={teamName}
        achievements={achievements || []}
      />

      {/* Estatísticas */}
      <PlayerStatsSection stats={totalStats} attributes={attributes || []} />

      {/* Quick Actions */}
      <div className="mx-auto max-w-[400px] space-y-2">
        <ActionCard href="/perfil" icon="✏️" title="Editar Perfil" desc="Atualize seus dados e currículo" />
        <ActionCard href="/vagas" icon="📋" title="Ver Vagas" desc="Encontre times procurando jogadores" />
        <ActionCard href="/times" icon="⚽" title="Meus Times" desc="Veja os times que você faz parte" />
        <ActionCard href="/torneios" icon="🏆" title="Torneios" desc="Confira torneios disponíveis" />
      </div>
    </div>
  );
}

function QuickStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-center">
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-600">{label}</p>
      <p className={`mt-0.5 text-lg font-black ${highlight ? "text-yellow-400" : "text-emerald-400"}`}>{value}</p>
    </div>
  );
}

function ActionCard({ href, icon, title, desc }: { href: string; icon: string; title: string; desc: string }) {
  return (
    <a href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 transition-all hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-lg transition group-hover:bg-emerald-500/10">{icon}</div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-[11px] text-neutral-500">{desc}</p>
      </div>
      <svg className="h-4 w-4 text-neutral-600 transition group-hover:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  );
}
