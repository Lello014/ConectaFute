"use client";

import { useState } from "react";

interface TeamHistory {
  team_name: string;
  start_year?: number;
  end_year?: number;
  is_current?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description?: string;
  year: number;
}

interface Highlight {
  id: string;
  title: string;
  url: string;
  type: "gol" | "drible" | "lance" | "outro";
}

export function PlayerHistory({
  previousTeams = [],
  currentTeamName,
  achievements = [],
  highlights = [],
}: {
  previousTeams?: TeamHistory[];
  currentTeamName?: string;
  achievements?: Achievement[];
  highlights?: Highlight[];
}) {
  const [tab, setTab] = useState<"times" | "conquistas" | "highlights">("times");

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#060a12] overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.04]">
        {(["times", "conquistas", "highlights"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition ${
              tab === t ? "text-emerald-400 border-b-2 border-emerald-400" : "text-neutral-600 hover:text-neutral-400"
            }`}>
            {t === "times" ? "Times" : t === "conquistas" ? "Conquistas" : "Highlights"}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Times */}
        {tab === "times" && (
          <div className="space-y-2">
            {currentTeamName && (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-xs font-bold text-emerald-400">⚡</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{currentTeamName}</p>
                  <p className="text-[9px] text-emerald-400/70">Time Atual</p>
                </div>
              </div>
            )}
            {previousTeams.map((t, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.02] px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/[0.04] text-xs text-neutral-500">⚽</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">{t.team_name}</p>
                  <p className="text-[9px] text-neutral-500">
                    {t.start_year || "—"} {t.end_year ? `— ${t.end_year}` : t.is_current ? "— Presente" : ""}
                  </p>
                </div>
              </div>
            ))}
            {!currentTeamName && previousTeams.length === 0 && (
              <p className="text-center text-xs text-neutral-600 py-4">Nenhum time registrado</p>
            )}
          </div>
        )}

        {/* Conquistas */}
        {tab === "conquistas" && (
          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.02] px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500/10 text-sm">🏆</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">{a.title}</p>
                  <p className="text-[9px] text-neutral-500">{a.year}{a.description ? ` — ${a.description}` : ""}</p>
                </div>
              </div>
            ))}
            {achievements.length === 0 && (
              <p className="text-center text-xs text-neutral-600 py-4">Nenhuma conquista registrada</p>
            )}
          </div>
        )}

        {/* Highlights */}
        {tab === "highlights" && (
          <div className="space-y-2">
            {highlights.map((h) => (
              <a key={h.id} href={h.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-white/[0.03] bg-white/[0.02] px-3 py-2.5 transition hover:border-emerald-500/20 hover:bg-emerald-500/[0.03]">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500/10 text-sm">🎬</div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">{h.title}</p>
                  <p className="text-[9px] text-neutral-500 capitalize">{h.type}</p>
                </div>
                <svg className="h-4 w-4 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
            {highlights.length === 0 && (
              <p className="text-center text-xs text-neutral-600 py-4">Nenhum highlight enviado</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
