"use client";

import { useState } from "react";

interface PlayerCardProps {
  fullName: string;
  nickname?: string;
  jerseyNumber?: number;
  position: string;
  secondaryPosition?: string;
  teamName?: string;
  height?: number;
  weight?: number;
  dominantFoot?: string;
  nationality?: string;
  neighborhood?: string;
  overallRating: number;
  potentialRating: number;
  traits?: string[];
  experienceYears?: number;
  availability?: string;
  marketStatus?: string;
  avatarUrl?: string;
  age?: number;
}

const positionLabels: Record<string, string> = {
  gk: "GOLEIRO", zagueiro: "ZAGUEIRO", lateral_direito: "LATERAL DIR.",
  lateral_esquerdo: "LATERAL ESQ.", volante: "VOLANTE", meia: "MEIA",
  meia_atacante: "MEIA ATA.", ponta_direita: "PONTA DIR.",
  ponta_esquerda: "PONTA ESQ.", centroavante: "CENTROAVANTE", atacante: "ATACANTE",
};

const positionAbbr: Record<string, string> = {
  gk: "GOL", zagueiro: "ZAG", lateral_direito: "LAT", lateral_esquerdo: "LAT",
  volante: "VOL", meia: "MEI", meia_atacante: "MAT", ponta_direita: "PD",
  ponta_esquerda: "PE", centroavante: "CA", atacante: "ATA",
};

const marketStatusMap: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  disponivel: { label: "DISPONÍVEL", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", desc: "Aberto a propostas" },
  apenas_avulso: { label: "APENAS AVULSO", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", desc: "Só substituições" },
  fechando_elenco: { label: "FECHANDO ELENCO", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", desc: "Negociando" },
  indisponivel: { label: "INDISPONÍVEL", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", desc: "Não aceita propostas" },
};

function getRatingColor(rating: number): string {
  if (rating >= 80) return "#10b981";
  if (rating >= 65) return "#eab308";
  if (rating >= 50) return "#f97316";
  return "#ef4444";
}

function RatingCircle({ label, value }: { label: string; value: number }) {
  const color = getRatingColor(value);
  const circ = 2 * Math.PI * 36;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
          <circle cx="40" cy="40" r="36" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black" style={{ color }}>{value}</span>
        </div>
      </div>
      <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-600">{label}</span>
    </div>
  );
}

export function PlayerCard({
  fullName, nickname, jerseyNumber, position, secondaryPosition,
  teamName, height, weight, dominantFoot, neighborhood,
  overallRating, potentialRating, traits = [], experienceYears,
  availability, marketStatus = "disponivel", avatarUrl, age,
}: PlayerCardProps) {
  const [flipped, setFlipped] = useState(false);
  const posLabel = positionLabels[position] || position.toUpperCase();
  const posAbbr = positionAbbr[position] || "MEI";
  const secAbbr = secondaryPosition ? positionAbbr[secondaryPosition] || "—" : null;
  const displayName = nickname || fullName.split(" ")[0];
  const color = getRatingColor(overallRating);
  const ms = marketStatusMap[marketStatus] || marketStatusMap.disponivel;

  return (
    <div className="mx-auto w-full max-w-[400px] cursor-pointer perspective-[1200px]"
      onClick={() => setFlipped(!flipped)}>
      <div className="relative transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>

        {/* ======== FRENTE ======== */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#060a12] shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_80px_rgba(16,185,129,0.07)] border border-white/[0.06]"
          style={{ backfaceVisibility: "hidden" }}>
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-[60px]" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-5 pt-5 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-[10px] font-black text-white shadow-lg shadow-emerald-600/30">CF</div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Conecta Fute</p>
                <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-600">Cartão de Apresentação</p>
              </div>
            </div>
            {jerseyNumber && (
              <div className="text-6xl font-black leading-none text-white/[0.04] select-none">{String(jerseyNumber).padStart(2, "0")}</div>
            )}
          </div>

          {/* Badge + Nome */}
          <div className="relative px-5 pt-1 pb-2">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5">
              <span className="text-[10px] font-black text-emerald-400">{posAbbr}</span>
              {secAbbr && <span className="text-[10px] text-emerald-400/60">/ {secAbbr}</span>}
            </div>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black leading-none" style={{ color }}>{jerseyNumber || "—"}</span>
              <div className="pb-1">
                <h2 className="text-xl font-black uppercase leading-tight tracking-tight text-white drop-shadow-lg">{displayName}</h2>
                {nickname && <p className="text-[10px] text-neutral-500">"{fullName}"</p>}
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/70">{posLabel}</p>
              </div>
            </div>
          </div>

          {/* Foto */}
          <div className="relative mx-5 mb-3 h-48 overflow-hidden rounded-xl border border-white/[0.05]">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] via-transparent to-transparent z-10" />
            {avatarUrl ? (
              <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-900/20 via-neutral-900/40 to-neutral-950/60">
                <div className="text-center">
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/5">
                    <span className="text-2xl opacity-40">👤</span>
                  </div>
                  <p className="text-[10px] text-neutral-600">Adicione sua foto</p>
                </div>
              </div>
            )}
          </div>

          {/* Ratings */}
          <div className="relative flex items-center justify-center gap-6 px-5 py-3">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-emerald-950/30 to-emerald-900/20" />
            <RatingCircle label="Nível" value={overallRating} />
            <div className="h-14 w-px bg-gradient-to-b from-transparent via-neutral-700 to-transparent" />
            <RatingCircle label="Potencial" value={potentialRating} />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-4 gap-px bg-white/[0.03]">
            <InfoCell label="IDADE" value={age ? `${age}` : "—"} />
            <InfoCell label="ALTURA" value={height ? `${height}` : "—"} unit="cm" />
            <InfoCell label="PÉ" value={dominantFoot === "destro" ? "Destro" : dominantFoot === "canhoto" ? "Canhoto" : "Ambos"} />
            <InfoCell label="EXP." value={experienceYears ? `${experienceYears}` : "—"} unit="anos" />
          </div>

          {/* Região */}
          {neighborhood && (
            <div className="flex items-center gap-2 border-t border-white/[0.04] px-5 py-2">
              <span className="text-xs">📍</span>
              <span className="text-[10px] font-medium text-neutral-400">{neighborhood}</span>
            </div>
          )}

          {/* Status de Mercado */}
          <div className={`mx-5 mb-3 mt-2 flex items-center justify-between rounded-lg border px-3 py-2 ${ms.bg}`}>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-500">Status de Mercado</p>
              <p className={`text-xs font-bold ${ms.color}`}>{ms.label}</p>
            </div>
            <div className={`h-2 w-2 rounded-full ${ms.color.replace("text-", "bg-")}`} />
          </div>

          {/* Traits */}
          {traits.length > 0 && (
            <div className="px-5 py-2">
              <div className="flex flex-wrap gap-1">
                {traits.slice(0, 5).map((t) => (
                  <span key={t} className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] font-medium text-emerald-400/80">{t}</span>
                ))}
                {traits.length > 5 && <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[9px] text-neutral-500">+{traits.length - 5}</span>}
              </div>
            </div>
          )}

          {/* Team + Status */}
          <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-600">Time Atual</p>
              <p className={`mt-0.5 text-xs font-bold ${teamName ? "text-white" : "text-yellow-400/80"}`}>{teamName || "Sem clube"}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${color.replace("#", "bg-[")}]`} style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}60` }} />
              <span className="text-[10px] font-bold text-neutral-400">{availability === "disponivel" ? "Ativo" : "Inativo"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.03] px-5 py-2">
            <p className="text-[8px] text-neutral-700">conectafute.com.br</p>
            <p className="text-[8px] text-neutral-700">Toque para ver mais</p>
          </div>
        </div>

        {/* ======== VERSO ======== */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#060a12] shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/[0.06]"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-[60px]" />

          <div className="relative flex items-center gap-2.5 px-5 pt-5 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-[10px] font-black text-white shadow-lg shadow-emerald-600/30">CF</div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Conecta Fute</p>
              <p className="text-[8px] uppercase tracking-[0.15em] text-neutral-600">Detalhes</p>
            </div>
          </div>

          <div className="px-5 pb-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">{displayName}</h2>
            <p className="text-[10px] font-semibold text-emerald-400/70">{posLabel}</p>
          </div>

          <div className="space-y-1.5 px-5">
            <DetailRow icon="📍" label="Região" value={neighborhood || "—"} />
            <DetailRow icon="📐" label="Altura" value={height ? `${height} cm` : "—"} />
            <DetailRow icon="⚖️" label="Peso" value={weight ? `${weight} kg` : "—"} />
            <DetailRow icon="🦶" label="Pé" value={dominantFoot === "destro" ? "Destro" : dominantFoot === "canhoto" ? "Canhoto" : "Ambos"} />
            <DetailRow icon="📅" label="Experiência" value={experienceYears ? `${experienceYears} anos` : "—"} />
            <DetailRow icon="👤" label="Idade" value={age ? `${age} anos` : "—"} />
          </div>

          {traits.length > 0 && (
            <div className="mt-3 px-5">
              <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-400/60">Rasgos</p>
              <div className="flex flex-wrap gap-1">
                {traits.map((t) => (
                  <span key={t} className="rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] font-medium text-emerald-400/80">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-neutral-600">Time</p>
              <p className="mt-0.5 text-xs font-bold text-white">{teamName || "Sem clube"}</p>
            </div>
            <div className={`rounded-md border px-2 py-0.5 ${ms.bg}`}>
              <p className={`text-[9px] font-bold ${ms.color}`}>{ms.label}</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.03] px-5 py-2">
            <p className="text-[8px] text-neutral-700">conectafute.com.br</p>
            <p className="text-[8px] text-neutral-700">Toque para voltar</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex flex-col items-center bg-white/[0.02] px-2 py-2">
      <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-neutral-600">{label}</p>
      <p className="text-sm font-black text-white">{value}{unit && <span className="ml-0.5 text-[9px] font-medium text-neutral-500">{unit}</span>}</p>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.02] px-3 py-2">
      <span className="text-sm">{icon}</span>
      <div className="flex-1">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-neutral-600">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
