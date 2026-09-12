import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import { Container, SectionTitle, Button } from "@/components/ui";
import { CreateTransactionForm } from "@/components/finance/transaction-form";

export const metadata: Metadata = { title: "Adicionar transação" };

export default async function NewTransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  return (
    <Container narrow className="py-10">
      <Link href={`/times/${team.id}/financeiro`} className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>
      <SectionTitle title="Adicionar transação" subtitle={`${team.name}`} />
      <CreateTransactionForm teamId={team.id} />
    </Container>
  );
}
