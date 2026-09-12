import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge, EmptyState, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { JOB_OFFER_STATUS_LABELS, POSITION_LABELS } from "@/lib/types";
import type { JobOfferStatus, Position } from "@/lib/types";

export const metadata: Metadata = { title: "Minhas Propostas - Conecta Fute" };

interface ProposalWithTeam {
  id: string;
  team_id: string;
  player_id: string;
  message: string | null;
  position_offered: Position | null;
  status: JobOfferStatus;
  created_at: string;
  team: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string;
    city: string | null;
    state: string | null;
  } | null;
}

async function getPlayerProposals(userId: string): Promise<ProposalWithTeam[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_offers")
    .select("*, team:teams (id, name, logo_url, primary_color, city, state)")
    .eq("player_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as ProposalWithTeam[];
}

function getStatusVariant(status: JobOfferStatus) {
  const variants: Record<JobOfferStatus, string> = {
    pendente: "warning",
    aceita: "success",
    recusada: "danger",
    cancelada: "default",
  };
  return variants[status] ?? "default";
}

export default async function PlayerProposalsPage() {
  const user = await requireUser();
  const proposals = await getPlayerProposals(user.id);

  return (
    <Container className="py-10">
      <SectionTitle
        title="Minhas Propostas"
        subtitle="Propostas recebidas de times."
      />

      {proposals.length === 0 ? (
        <EmptyState
          icon="📬"
          title="Nenhuma proposta recebida"
          description="Quando times estiverem interessados, as propostas aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: proposal.team?.primary_color ?? "#059669" }}
                  >
                    {proposal.team?.logo_url ? (
                      <img src={proposal.team.logo_url} alt={proposal.team.name ?? ""} className="h-full w-full rounded-xl object-cover" />
                    ) : (
                      proposal.team?.name?.slice(0, 2).toUpperCase() ?? "??"
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{proposal.team?.name ?? "Time"}</h3>
                    {proposal.team?.city && (
                      <p className="text-xs text-neutral-400">
                        {proposal.team.city}/{proposal.team.state}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant={getStatusVariant(proposal.status)}>
                  {JOB_OFFER_STATUS_LABELS[proposal.status] ?? proposal.status}
                </Badge>
              </div>
              {proposal.position_offered && (
                <div className="mt-2">
                  <Badge variant="info">
                    Posição: {POSITION_LABELS[proposal.position_offered] ?? proposal.position_offered}
                  </Badge>
                </div>
              )}
              {proposal.message && (
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  {proposal.message}
                </p>
              )}
              <div className="mt-2 text-xs text-neutral-400">
                {new Date(proposal.created_at).toLocaleDateString("pt-BR")}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
