import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTournament } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, Button, Badge } from "@/components/ui";
import { TournamentTeams } from "@/components/tournaments/tournament-teams";
import { TournamentMatches } from "@/components/tournaments/tournament-matches";
import { CreateMatchForm } from "@/components/tournaments/create-match-form";

export const metadata: Metadata = { title: "Detalhes do torneio" };

export default async function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournament(id);
  if (!tournament) notFound();

  const user = await requireUser();
  const isOrganizer = tournament.organizer_id === user.id;

  const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
    inscricoes: "info",
    em_andamento: "success",
    encerrado: "default",
  };

  return (
    <Container className="py-10">
      <Link href="/torneios" className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <p className="text-neutral-500">
              {tournament.city ? `${tournament.city}${tournament.state ? `/${tournament.state}` : ""}` : ""}
            </p>
          </div>
          <Badge variant={statusColors[tournament.status] ?? "default"}>
            {tournament.status === "inscricoes" ? "Inscrições abertas" : tournament.status === "em_andamento" ? "Em andamento" : "Encerrado"}
          </Badge>
        </div>
        {tournament.description && (
          <p className="mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-300">{tournament.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-neutral-500">
          {tournament.starts_at && <span>Início: {new Date(tournament.starts_at).toLocaleDateString("pt-BR")}</span>}
          {tournament.ends_at && <span>Fim: {new Date(tournament.ends_at).toLocaleDateString("pt-BR")}</span>}
          {tournament.max_teams && <span>Max: {tournament.max_teams} times</span>}
          {tournament.registration_fee > 0 && <span>Inscrição: R$ {tournament.registration_fee.toFixed(2)}</span>}
          {tournament.prize && <span>Prêmio: {tournament.prize}</span>}
        </div>
      </div>

      {isOrganizer && tournament.status === "em_andamento" && (
        <div className="mb-8">
          <CreateMatchForm tournamentId={tournament.id} teams={tournament.tournament_teams?.filter(t => t.status === "aprovado") ?? []} />
        </div>
      )}

      <TournamentTeams tournament={tournament} currentUserId={user.id} isOrganizer={isOrganizer} />
      <TournamentMatches matches={tournament.matches ?? []} isOrganizer={isOrganizer} />
    </Container>
  );
}
