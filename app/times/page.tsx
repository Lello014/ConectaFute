import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTitle, Button, EmptyState } from "@/components/ui";
import { listTeams } from "@/lib/data";
import { TeamCard } from "@/components/teams/team-card";

export const metadata: Metadata = {
  title: "Times",
};

export default async function TimesPage() {
  const teams = await listTeams();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Times"
        subtitle="Veja todos os times cadastrados."
        action={
          <Link href="/times/novo">
            <Button>Criar time</Button>
          </Link>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          title="Nenhum time encontrado"
          description="Crie o primeiro time da plataforma."
          action={
            <Link href="/times/novo">
              <Button>Criar time</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </Container>
  );
}
