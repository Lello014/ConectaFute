"use client";

import { useState } from "react";
import { updateMatchScore } from "@/lib/actions/tournaments";
import { Button, Input, Badge } from "@/components/ui";
import type { Match } from "@/lib/types";

interface TournamentMatchesProps {
  matches: (Match & { home_team?: any; away_team?: any })[];
  isOrganizer: boolean;
}

export function TournamentMatches({ matches, isOrganizer }: TournamentMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Partidas ({matches.length})</h2>
      <div className="space-y-3">
        {matches.map((match) => (
          <MatchRow key={match.id} match={match} isOrganizer={isOrganizer} />
        ))}
      </div>
    </div>
  );
}

function MatchRow({ match, isOrganizer }: { match: any; isOrganizer: boolean }) {
  const [editing, setEditing] = useState(false);
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await updateMatchScore(match.id, homeScore, awayScore);
    setLoading(false);
    setEditing(false);
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      {match.group_label && (
        <Badge variant="default" className="mb-2 text-[10px]">{match.group_label} • Rodada {match.round}</Badge>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ backgroundColor: match.home_team?.primary_color ?? "#666" }}
          >
            {match.home_team?.name?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{match.home_team?.name}</span>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <Input type="number" min={0} value={homeScore} onChange={(e) => setHomeScore(Number(e.target.value))} className="w-16 text-center" />
            <span className="font-bold">x</span>
            <Input type="number" min={0} value={awayScore} onChange={(e) => setAwayScore(Number(e.target.value))} className="w-16 text-center" />
            <Button size="sm" onClick={handleSave} loading={loading}>Salvar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancelar</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {match.status === "jogado" ? (
              <span className="text-xl font-bold">{match.home_score} x {match.away_score}</span>
            ) : (
              <span className="text-neutral-400">vs</span>
            )}
            {isOrganizer && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Placar</Button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{match.away_team?.name}</span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
            style={{ backgroundColor: match.away_team?.primary_color ?? "#666" }}
          >
            {match.away_team?.name?.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
