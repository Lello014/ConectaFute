import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle } from "@/components/ui";
import { EditTeamForm } from "@/components/teams/edit-team-form";

export const metadata: Metadata = {
  title: "Editar time",
};

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const user = await requireUser();
  if (team.captain_id !== user.id) {
    return (
      <Container className="py-10">
        <p className="text-center text-neutral-500">Apenas o capitão pode editar o time.</p>
      </Container>
    );
  }

  return (
    <Container narrow className="py-10">
      <SectionTitle
        title="Editar time"
        subtitle="Atualize as informações e cores do time."
      />
      <EditTeamForm team={team} />
    </Container>
  );
}
