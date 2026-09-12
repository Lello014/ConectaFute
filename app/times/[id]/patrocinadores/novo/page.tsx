import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import { Container, SectionTitle, Button } from "@/components/ui";
import { CreateSponsorForm } from "@/components/sponsors/sponsor-form";

export const metadata: Metadata = { title: "Adicionar patrocinador" };

export default async function NewSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  return (
    <Container narrow className="py-10">
      <Link href={`/times/${team.id}/patrocinadores`} className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>
      <SectionTitle title="Adicionar patrocinador" subtitle={`${team.name}`} />
      <CreateSponsorForm teamId={team.id} />
    </Container>
  );
}
