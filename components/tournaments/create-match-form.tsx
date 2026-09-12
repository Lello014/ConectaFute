"use client";

import { useActionState } from "react";
import { createMatch, type ActionState } from "@/lib/actions/tournaments";
import { Button, Input } from "@/components/ui";
import { FormMessage } from "@/components/form-message";

interface CreateMatchFormProps {
  tournamentId: string;
  teams: { team_id: string; teams?: { id: string; name: string } }[];
}

export function CreateMatchForm({ tournamentId, teams }: CreateMatchFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createMatch, null);

  if (teams.length < 2) return null;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="mb-3 font-semibold">Criar partida</h3>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tournament_id" value={tournamentId} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Time da casa</label>
            <select name="home_team_id" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800" required>
              <option value="">Selecione</option>
              {teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.teams?.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time visitante</label>
            <select name="away_team_id" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800" required>
              <option value="">Selecione</option>
              {teams.map((t) => <option key={t.team_id} value={t.team_id}>{t.teams?.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Rodada" name="round" type="number" min={1} defaultValue={1} />
          <Input label="Grupo" name="group_label" placeholder="Ex: A" />
          <Input label="Data/Hora" name="scheduled_at" type="datetime-local" />
        </div>
        <FormMessage state={state} />
        <Button type="submit" loading={pending} size="sm">Criar partida</Button>
      </form>
    </div>
  );
}
