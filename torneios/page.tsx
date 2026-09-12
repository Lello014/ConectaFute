import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTitle, Button, EmptyState, Badge } from "@/components/ui";
import { listTournaments } from "@/lib/data";
import { TournamentCard } from "@/components/tournaments/tournament-card";

export const metadata: Metadata = { title: "Torneios" };

export default async function TournamentsPage() {
  const tournaments = await listTournaments();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Torneios"
        subtitle="Campeonatos e copas."
        action={<Link href="/torneios/novo"><Button>Criar torneio</Button></Link>}
      />
      {tournaments.length === 0 ? (
        <EmptyState
          title="Nenhum torneio encontrado"
          description="Crie o primeiro torneio."
          action={<Link href="/torneios/novo"><Button>Criar torneio</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}
        </div>
      )}
    </Container>
  );
}
