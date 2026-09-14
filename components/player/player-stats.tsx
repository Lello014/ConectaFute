"use client";

interface PlayerStats {
  matches_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  minutes_played: number;
}

interface PlayerAttributes {
  raca?: number;
  pontualidade?: number;
  tecnica?: number;
  espirito_equipe?: number;
  disciplina?: number;
  criatividade?: number;
  rater_name?: string;
}

function StatBox({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-3">
      <span className="text-lg">{icon}</span>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-600">{label}</p>
    </div>
  );
}

function AttributeBar({ label, value }: { label: string; value: number }) {
  const color = value >= 8 ? "#10b981" : value >= 6 ? "#eab308" : value >= 4 ? "#f97316" : "#ef4444";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-neutral-400">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{value}/10</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function PlayerStatsSection({
  stats,
  attributes = [],
}: {
  stats?: PlayerStats;
  attributes?: PlayerAttributes[];
}) {
  // Média dos atributos avaliados
  const avgAttributes = attributes.reduce(
    (acc, attr) => {
      const fields = ["raca", "pontualidade", "tecnica", "espirito_equipe", "disciplina", "criatividade"] as const;
      fields.forEach((f) => {
        if (attr[f]) {
          acc[f] = (acc[f] || { total: 0, count: 0 });
          acc[f].total += attr[f];
          acc[f].count += 1;
        }
      });
      return acc;
    },
    {} as Record<string, { total: number; count: number }>
  );

  const getAvg = (key: string) => {
    const d = avgAttributes[key];
    return d ? Math.round((d.total / d.count) * 10) / 10 : 0;
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#060a12] overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Estatísticas & Scout</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 px-5 pb-4">
        <StatBox label="Jogos" value={stats?.matches_played ?? 0} icon="⚽" />
        <StatBox label="Gols" value={stats?.goals ?? 0} icon="🥅" />
        <StatBox label="Assistências" value={stats?.assists ?? 0} icon="🅰️" />
        <StatBox label="Amarelos" value={stats?.yellow_cards ?? 0} icon="🟨" />
        <StatBox label="Vermelhos" value={stats?.red_cards ?? 0} icon="🟥" />
        <StatBox label="Minutos" value={stats?.minutes_played ?? 0} icon="⏱️" />
      </div>

      {/* Attribute Ratings */}
      <div className="border-t border-white/[0.04] px-5 py-4">
        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.15em] text-neutral-500">
          Avaliação de Atributos {attributes.length > 0 && `(de ${attributes.length} capitães)`}
        </p>
        <div className="space-y-2.5">
          <AttributeBar label="Raça" value={getAvg("raca")} />
          <AttributeBar label="Pontualidade" value={getAvg("pontualidade")} />
          <AttributeBar label="Técnica" value={getAvg("tecnica")} />
          <AttributeBar label="Espírito de Equipe" value={getAvg("espirito_equipe")} />
          <AttributeBar label="Disciplina" value={getAvg("disciplina")} />
          <AttributeBar label="Criatividade" value={getAvg("criatividade")} />
        </div>
        {attributes.length === 0 && (
          <p className="mt-3 text-center text-[10px] text-neutral-600">Nenhuma avaliação de capitães ainda</p>
        )}
      </div>
    </div>
  );
}
