import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle, Button } from "@/components/ui";
import { TeamMembers } from "@/components/teams/team-members";

export const metadata: Metadata = {
  title: "Gerenciar membros",
};

export default async function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const user = await requireUser();

  return (
    <Container className="py-10">
      <SectionTitle
        title={`Membros — ${team.name}`}
        subtitle="Gerencie os membros do time."
        action={
          <Link href={`/times/${team.id}`}>
            <Button variant="secondary" size="sm">Voltar</Button>
          </Link>
        }
      />
      <TeamMembers team={team} currentUserId={user.id} />
    </Container>
  );
}
