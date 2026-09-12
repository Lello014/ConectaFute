"use client";

import { useState } from "react";
import { updateFriendlyScore } from "@/lib/actions/friendlies";
import { Button, Input } from "@/components/ui";

interface FriendlyScoreFormProps {
  friendlyId: string;
}

export function FriendlyScoreForm({ friendlyId }: FriendlyScoreFormProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    const result = await updateFriendlyScore(friendlyId, homeScore, awayScore);
    if (result?.error) setMessage(result.error);
    else if (result?.message) setMessage(result.message);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="mb-3 font-semibold">Registrar placar</h3>
      <div className="flex items-end gap-4">
        <Input
          label="Gols casa"
          type="number"
          min={0}
          value={homeScore}
          onChange={(e) => setHomeScore(Number(e.target.value))}
        />
        <span className="mb-1 text-xl font-bold">x</span>
        <Input
          label="Gols visitante"
          type="number"
          min={0}
          value={awayScore}
          onChange={(e) => setAwayScore(Number(e.target.value))}
        />
      </div>
      {message && (
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{message}</p>
      )}
      <Button onClick={handleSubmit} loading={loading} className="mt-3">
        Salvar placar
      </Button>
    </div>
  );
}
