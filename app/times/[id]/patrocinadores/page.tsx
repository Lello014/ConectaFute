import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamSponsors } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle, Button, EmptyState } from "@/components/ui";
import { SponsorList } from "@/components/sponsors/sponsor-list";

export const metadata: Metadata = { title: "Patrocinadores" };

export default async function TeamSponsorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const user = await requireUser();
  const isCaptain = team.captain_id === user.id;
  const sponsors = await getTeamSponsors(team.id);

  return (
    <Container className="py-10">
      <Link href={`/times/${team.id}`} className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <SectionTitle
        title={`Patrocinadores — ${team.name}`}
        subtitle="Gerencie os patrocinadores do time."
        action={isCaptain ? <Link href={`/times/${team.id}/patrocinadores/novo`}><Button>Adicionar patrocinador</Button></Link> : undefined}
      />

      {sponsors.length === 0 ? (
        <EmptyState title="Nenhum patrocinador" description="Adicione o primeiro patrocinador do time." />
      ) : (
        <SponsorList sponsors={sponsors} isCaptain={isCaptain} teamId={team.id} />
      )}
    </Container>
  );
}
