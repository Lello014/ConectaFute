import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { CONTRACT_STATUS_LABELS } from "@/lib/types";
import type { ContractStatus } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Contratos - Conecta Fute" };

interface ContractWithRelations {
  id: string;
  player_id: string;
  team_id: string;
  start_date: string;
  end_date: string | null;
  monthly_value: number;
  status: ContractStatus;
  notes: string | null;
  created_at: string;
  player: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
  teams: {
    id: string;
    name: string;
  } | null;
}

async function getMyTeamContracts(userId: string): Promise<ContractWithRelations[]> {
  const supabase = await createClient();

  const { data: myTeams } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "ativo")
    .eq("role", "captain");

  if (!myTeams || myTeams.length === 0) return [];

  const teamIds = myTeams.map((t) => t.team_id);

  const { data } = await supabase
    .from("player_contracts")
    .select("*, player:profiles!player_contracts_player_id_fkey (id, full_name, avatar_url), teams (id, name)")
    .in("team_id", teamIds)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as ContractWithRelations[];
}

function getStatusVariant(status: ContractStatus) {
  const variants: Record<ContractStatus, string> = {
    proposta: "info",
    aceito: "success",
    recusado: "danger",
    encerrado: "default",
  };
  return variants[status] ?? "default";
}

export default async function TeamContractsPage() {
  const user = await requireUser();
  const contracts = await getMyTeamContracts(user.id);

  return (
    <Container className="py-10">
      <SectionTitle
        title="Contratos"
        subtitle="Gerencie os contratos dos jogadores do seu time."
      />

      {contracts.length === 0 ? (
        <EmptyState
          icon="📝"
          title="Nenhum contrato encontrado"
          description="Quando você contratar jogadores, os contratos aparecerão aqui."
          action={
            <Link href="/vagas" className="text-sm text-emerald-600 hover:underline">
              Ver vagas abertas
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium">
                    {contract.player?.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() ?? "??"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{contract.player?.full_name ?? "Jogador"}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      {contract.teams?.name}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(contract.status)}>
                  {CONTRACT_STATUS_LABELS[contract.status] ?? contract.status}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Início:</span>{" "}
                  {new Date(contract.start_date).toLocaleDateString("pt-BR")}
                </div>
                <div>
                  <span className="text-neutral-500 dark:text-neutral-400">Valor:</span>{" "}
                  R$ {contract.monthly_value.toFixed(2)}
                </div>
                {contract.end_date && (
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400">Fim:</span>{" "}
                    {new Date(contract.end_date).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
