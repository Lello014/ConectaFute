import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui";
import { CreateTournamentForm } from "@/components/tournaments/create-tournament-form";

export const metadata: Metadata = { title: "Criar torneio" };

export default async function NovoTorneioPage() {
  return (
    <Container narrow className="py-10">
      <SectionTitle title="Criar torneio" subtitle="Organize um campeonato." />
      <CreateTournamentForm />
    </Container>
  );
}
