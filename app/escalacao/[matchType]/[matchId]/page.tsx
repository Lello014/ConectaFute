import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamPlayers } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle, Button } from "@/components/ui";
import { LineupEditor } from "@/components/lineup/lineup-editor";

export const metadata: Metadata = { title: "Escalação" };

export default async function LineupPage({
  params,
  searchParams,
}: {
  params: Promise<{ matchType: string; matchId: string }>;
  searchParams: Promise<{ team_id?: string }>;
}) {
  const { matchType, matchId } = await params;
  const { team_id } = await searchParams;

  if (!team_id) {
    return (
      <Container className="py-10">
        <p className="text-center text-neutral-500">Selecione um time para montar a escalação.</p>
      </Container>
    );
  }

  const team = await getTeam(team_id);
  if (!team) notFound();

  const user = await requireUser();
  const players = await getTeamPlayers(team.id);

  return (
    <Container className="py-10">
      <Link href={matchType === "friendly" ? "/amistosos" : "/torneios"} className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <SectionTitle
        title={`Escalação — ${team.name}`}
        subtitle="Monte a escalação para o jogo."
      />

      <LineupEditor
        matchId={matchId}
        matchType={matchType}
        teamId={team.id}
        teamName={team.name}
        teamColor={team.primary_color}
        players={players}
        createdBy={user.id}
      />
    </Container>
  );
}
