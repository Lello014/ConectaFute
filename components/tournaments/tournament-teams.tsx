"use client";

import { useActionState } from "react";
import { respondTeam, type ActionState } from "@/lib/actions/tournaments";
import { Button, Badge } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import type { TournamentWithRelations } from "@/lib/data";

interface TournamentTeamsProps {
  tournament: TournamentWithRelations;
  currentUserId: string;
  isOrganizer: boolean;
}

export function TournamentTeams({ tournament, currentUserId, isOrganizer }: TournamentTeamsProps) {
  const teams = tournament.tournament_teams ?? [];

  if (teams.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-lg font-semibold">Times inscritos ({teams.length})</h2>
      <div className="space-y-2">
        {teams.map((tt) => (
          <TeamRow key={tt.id} registration={tt} tournamentId={tournament.id} isOrganizer={isOrganizer} />
        ))}
      </div>
    </div>
  );
}

function TeamRow({ registration, tournamentId, isOrganizer }: {
  registration: any;
  tournamentId: string;
  isOrganizer: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(respondTeam, null);

  const statusColors: Record<string, string> = {
    pendente: "warning",
    aprovado: "success",
    rejeitado: "danger",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
        style={{ backgroundColor: registration.teams?.primary_color ?? "#666" }}
      >
        {registration.teams?.name?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{registration.teams?.name}</p>
      </div>
      <Badge variant={statusColors[registration.status] ?? "default"}>
        {registration.status === "pendente" ? "Pendente" : registration.status === "aprovado" ? "Aprovado" : "Rejeitado"}
      </Badge>
      {isOrganizer && registration.status === "pendente" && (
        <form className="flex gap-2" action={formAction}>
          <input type="hidden" name="tournament_id" value={tournamentId} />
          <input type="hidden" name="registration_id" value={registration.id} />
          <Button type="submit" name="approve" value="1" size="sm" loading={pending}>Aprovar</Button>
          <Button type="submit" name="approve" value="0" size="sm" variant="danger" loading={pending}>Rejeitar</Button>
        </form>
      )}
    </div>
  );
}
