import type { Metadata } from "next";
import { Container, SectionTitle } from "@/components/ui";
import { CreateFriendlyForm } from "@/components/friendlies/create-friendly-form";

export const metadata: Metadata = { title: "Criar amistoso" };

export default async function NovoAmistosoPage() {
  return (
    <Container narrow className="py-10">
      <SectionTitle title="Criar amistoso" subtitle="Organize um jogo entre dois times." />
      <CreateFriendlyForm />
    </Container>
  );
}
