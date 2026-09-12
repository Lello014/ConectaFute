"use client";

import { useState } from "react";
import { createLineup, updateLineupPlayers } from "@/lib/actions/lineups";
import { Button, Badge } from "@/components/ui";

interface Player {
  id: string;
  user_id: string;
  profiles: { id: string; full_name: string; avatar_url: string | null } | null;
}

interface LineupEditorProps {
  matchId: string;
  matchType: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  players: Player[];
  createdBy: string;
}

export function LineupEditor({ matchId, matchType, teamId, teamName, teamColor, players, createdBy }: LineupEditorProps) {
  const [starters, setStarters] = useState<Player[]>([]);
  const [bench, setBench] = useState<Player[]>(players);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  function addToStarters(player: Player) {
    setBench((b) => b.filter((p) => p.id !== player.id));
    setStarters((s) => [...s, player]);
  }

  function removeFromStarters(player: Player) {
    setStarters((s) => s.filter((p) => p.id !== player.id));
    setBench((b) => [...b, player]);
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const arr = [...starters];
    [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    setStarters(arr);
  }

  function moveDown(idx: number) {
    if (idx >= starters.length - 1) return;
    const arr = [...starters];
    [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setStarters(arr);
  }

  async function handleSave() {
    setLoading(true);

    const fd = new FormData();
    fd.set("match_id", matchId);
    fd.set("match_type", matchType);
    fd.set("team_id", teamId);
    const result = await createLineup(null, fd);

    if (result?.error) {
      setLoading(false);
      return;
    }

    // Busca o lineup mais recente deste time neste jogo
    const supabase = (await import("@/lib/supabase/client")).createClient();
    const { data: lineup } = await supabase
      .from("lineups")
      .select("id")
      .eq("match_id", matchId)
      .eq("match_type", matchType)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lineup) {
      await updateLineupPlayers(lineup.id, [
        ...starters.map((p, i) => ({ player_id: p.user_id, position: null, is_starter: true, sort_order: i })),
        ...bench.map((p, i) => ({ player_id: p.user_id, position: null, is_starter: false, sort_order: starters.length + i })),
      ]);
      setSaved(true);
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Titulares */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Titulares ({starters.length})</h3>
          <Badge variant="info">{starters.length} jogadores</Badge>
        </div>
        {starters.length === 0 ? (
          <p className="text-sm text-neutral-500">Clique em um jogador do banco para adicionar como titular.</p>
        ) : (
          <div className="space-y-2">
            {starters.map((p, idx) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                <span className="w-6 text-center text-sm font-bold text-neutral-400">{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.profiles?.full_name}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => moveUp(idx)}>↑</Button>
                <Button size="sm" variant="ghost" onClick={() => moveDown(idx)}>↓</Button>
                <Button size="sm" variant="danger" onClick={() => removeFromStarters(p)}>Remover</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Banco de reservas */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Banco de reservas ({bench.length})</h3>
        </div>
        {bench.length === 0 ? (
          <p className="text-sm text-neutral-500">Todos os jogadores estão nos titulares.</p>
        ) : (
          <div className="space-y-2">
            {bench.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg bg-neutral-50 p-2 dark:bg-neutral-800">
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.profiles?.full_name}</p>
                </div>
                <Button size="sm" onClick={() => addToStarters(p)}>Titular</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {saved && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
          Escalação salva com sucesso!
        </div>
      )}

      <Button onClick={handleSave} loading={loading} className="w-full">
        Salvar escalação
      </Button>
    </div>
  );
}
