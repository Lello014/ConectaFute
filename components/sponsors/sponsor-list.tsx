"use client";

import { useActionState } from "react";
import { updateSponsorStatus, deleteSponsor, type ActionState } from "@/lib/actions/sponsors";
import { Button, Badge } from "@/components/ui";
import { SPONSOR_STATUS_LABELS } from "@/lib/types";
import type { Sponsor } from "@/lib/types";

interface SponsorListProps {
  sponsors: Sponsor[];
  isCaptain: boolean;
  teamId: string;
}

export function SponsorList({ sponsors, isCaptain, teamId }: SponsorListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sponsors.map((sponsor) => (
        <SponsorCard key={sponsor.id} sponsor={sponsor} isCaptain={isCaptain} teamId={teamId} />
      ))}
    </div>
  );
}

function SponsorCard({ sponsor, isCaptain, teamId }: {
  sponsor: Sponsor;
  isCaptain: boolean;
  teamId: string;
}) {
  const statusColors: Record<string, "default" | "success" | "warning"> = {
    ativo: "success",
    pausado: "warning",
    encerrado: "default",
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {sponsor.logo_url ? (
            <img src={sponsor.logo_url} alt={sponsor.name} className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
              {sponsor.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold">{sponsor.name}</p>
            {sponsor.contact_name && <p className="text-xs text-neutral-500">{sponsor.contact_name}</p>}
          </div>
        </div>
        <Badge variant={statusColors[sponsor.status] ?? "default"}>
          {SPONSOR_STATUS_LABELS[sponsor.status]}
        </Badge>
      </div>

      {sponsor.monthly_value > 0 && (
        <p className="mb-2 text-sm font-medium text-emerald-600">
          R$ {Number(sponsor.monthly_value).toFixed(2)}/mês
        </p>
      )}

      {sponsor.contact_phone && <p className="text-xs text-neutral-500">📞 {sponsor.contact_phone}</p>}
      {sponsor.contact_email && <p className="text-xs text-neutral-500">✉️ {sponsor.contact_email}</p>}

      {isCaptain && (
        <div className="mt-3 flex gap-2">
          {sponsor.status === "ativo" && (
            <StatusButton sponsorId={sponsor.id} teamId={teamId} newStatus="pausado" label="Pausar" />
          )}
          {sponsor.status === "pausado" && (
            <StatusButton sponsorId={sponsor.id} teamId={teamId} newStatus="ativo" label="Reativar" />
          )}
          {sponsor.status !== "encerrado" && (
            <StatusButton sponsorId={sponsor.id} teamId={teamId} newStatus="encerrado" label="Encerrar" />
          )}
        </div>
      )}
    </div>
  );
}

function StatusButton({ sponsorId, teamId, newStatus, label }: {
  sponsorId: string;
  teamId: string;
  newStatus: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async () => updateSponsorStatus(sponsorId, teamId, newStatus as any),
    null
  );

  return (
    <form action={formAction}>
      <Button type="submit" size="sm" variant="ghost" loading={pending}>{label}</Button>
    </form>
  );
}
