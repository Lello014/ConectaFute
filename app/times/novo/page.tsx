import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui";
import { CreateTeamForm } from "@/components/teams/create-team-form";

export const metadata: Metadata = {
  title: "Criar time",
};

export default async function NovoTimePage() {
  return (
    <Container narrow className="py-10">
      <SectionTitle
        title="Criar time"
        subtitle="Monte seu time e personalize com cores e logo."
      />
      <CreateTeamForm />
    </Container>
  );
}
