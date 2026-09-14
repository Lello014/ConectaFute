"use client";

interface PlayerCardProps {
  fullName: string;
  nickname?: string;
  jerseyNumber?: number;
  position: string;
  secondaryPosition?: string;
  teamName?: string;
  teamLogo?: string;
  height?: number;
  weight?: number;
  dominantFoot?: string;
  nationality?: string;
  overallRating: number;
  potentialRating: number;
  traits?: string[];
  experienceYears?: number;
  availability?: string;
  avatarUrl?: string;
}

const positionLabels: Record<string, string> = {
  gk: "GOLEIRO",
  zagueiro: "ZAGUEIRO",
  lateral_direito: "LATERAL DIREITO",
  lateral_esquerdo: "LATERAL ESQUERDO",
  volante: "VOLANTE",
  meia: "MEIA",
  meia_atacante: "MEIA ATACANTE",
  ponta_direita: "PONTA DIREITA",
  ponta_esquerda: "PONTA ESQUERDA",
  centroavante: "CENTROAVANTE",
  atacante: "ATACANTE",
};

function getRatingColor(rating: number): string {
  if (rating >= 80) return "text-emerald-400";
  if (rating >= 65) return "text-yellow-400";
  if (rating >= 50) return "text-orange-400";
  return "text-red-400";
}

function getAvailabilityStatus(status?: string) {
  switch (status) {
    case "disponivel":
      return { label: "DISPONÍVEL", color: "bg-emerald-500", textColor: "text-emerald-400" };
    case "em_negociacao":
      return { label: "EM NEGOCIAÇÃO", color: "bg-yellow-500", textColor: "text-yellow-400" };
    case "indisponivel":
      return { label: "INDISPONÍVEL", color: "bg-red-500", textColor: "text-red-400" };
    default:
      return { label: "DISPONÍVEL", color: "bg-emerald-500", textColor: "text-emerald-400" };
  }
}

export function PlayerCard({
  fullName,
  nickname,
  jerseyNumber,
  position,
  secondaryPosition,
  teamName,
  height,
  weight,
  dominantFoot,
  nationality,
  overallRating,
  potentialRating,
  traits = [],
  experienceYears,
  availability,
  avatarUrl,
}: PlayerCardProps) {
  const posLabel = positionLabels[position] || position.toUpperCase();
  const secLabel = secondaryPosition ? positionLabels[secondaryPosition] || secondaryPosition.toUpperCase() : null;
  const avail = getAvailabilityStatus(availability);
  const displayName = nickname || fullName.split(" ")[0];

  return (
    <div className="relative mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black shadow-2xl">
      {/* Top glow */}
      <div className="absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-600/30">
            CF
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Conecta Fute
            </p>
            <p className="text-[10px] text-neutral-500">PLAYER PROFILE</p>
          </div>
        </div>
        {jerseyNumber && (
          <div className="text-5xl font-black text-white/10">
            {jerseyNumber}
          </div>
        )}
      </div>

      {/* Name + Position */}
      <div className="relative px-5 pb-3">
        <div className="flex items-baseline gap-2">
          {jerseyNumber && (
            <span className="text-4xl font-black text-emerald-400">
              {jerseyNumber}
            </span>
          )}
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">
              {displayName}
            </h2>
            {nickname && (
              <p className="text-xs text-neutral-500">"{fullName}"</p>
            )}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="font-bold text-emerald-400">
            {posLabel}
          </span>
          {secLabel && (
            <>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">{secLabel}</span>
            </>
          )}
        </div>
      </div>

      {/* Photo placeholder area */}
      <div className="relative mx-5 mb-4 flex h-64 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900/20 to-neutral-900/50 border border-emerald-500/10">
        {avatarUrl ? (
          <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="text-center">
            <div className="text-6xl opacity-30">👤</div>
            <p className="mt-2 text-xs text-neutral-600">Adicione sua foto</p>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-px bg-neutral-800/50">
        <InfoCell icon="📐" label="ALTURA" value={height ? `${height} cm` : "—"} />
        <InfoCell icon="⚖️" label="PESO" value={weight ? `${weight} kg` : "—"} />
        <InfoCell icon="🦶" label="PÉ PREFERIDO" value={dominantFoot === "destro" ? "Destro" : dominantFoot === "canhoto" ? "Canhoto" : "Ambos"} />
        <InfoCell icon="📅" label="EXPERIÊNCIA" value={experienceYears ? `${experienceYears} anos` : "—"} />
      </div>

      {/* Ratings */}
      <div className="flex items-center justify-center gap-8 bg-gradient-to-r from-emerald-900/30 to-emerald-950/30 px-5 py-4">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">NÍVEL ATUAL</p>
          <p className={`text-4xl font-black ${getRatingColor(overallRating)}`}>
            {overallRating}
          </p>
        </div>
        <div className="h-12 w-px bg-neutral-700" />
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">POTENCIAL</p>
          <p className={`text-4xl font-black ${getRatingColor(potentialRating)}`}>
            {potentialRating}
          </p>
        </div>
      </div>

      {/* Traits */}
      {traits.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">RASGOS</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {traits.map((trait) => (
              <span
                key={trait}
                className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Team + Availability */}
      <div className="flex items-center justify-between border-t border-neutral-800/50 px-5 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">TIME ATUAL</p>
          {teamName ? (
            <p className="mt-0.5 text-sm font-semibold text-white">{teamName}</p>
          ) : (
            <p className="mt-0.5 text-sm font-semibold text-yellow-400">Sem clube</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">STATUS</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${avail.color}`} />
            <p className={`text-xs font-bold ${avail.textColor}`}>{avail.label}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-neutral-800/50 px-5 py-2">
        <p className="text-[10px] text-neutral-600">conectafute.com.br</p>
        <p className="text-[10px] text-neutral-600">#{jerseyNumber || "—"}</p>
      </div>
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-neutral-900/80 px-4 py-2.5">
      <span className="text-sm">{icon}</span>
      <div>
        <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
