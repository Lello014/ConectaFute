import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam, getTeamTransactions } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle, Button, Card, EmptyState } from "@/components/ui";
import { TransactionList } from "@/components/finance/transaction-list";
import { FinanceSummary } from "@/components/finance/finance-summary";

export const metadata: Metadata = { title: "Financeiro" };

export default async function TeamFinancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const user = await requireUser();
  const isCaptain = team.captain_id === user.id;
  const transactions = await getTeamTransactions(team.id);

  const totalReceitas = transactions.filter((t) => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0);
  const totalDespesas = transactions.filter((t) => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0);

  return (
    <Container className="py-10">
      <Link href={`/times/${team.id}`} className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <SectionTitle
        title={`Financeiro — ${team.name}`}
        subtitle="Controle de entradas e saídas do time."
        action={isCaptain ? <Link href={`/times/${team.id}/financeiro/novo`}><Button>Adicionar transação</Button></Link> : undefined}
      />

      <FinanceSummary totalReceitas={totalReceitas} totalDespesas={totalDespesas} />

      {transactions.length === 0 ? (
        <EmptyState title="Nenhuma transação" description="Registre a primeira transação financeira." />
      ) : (
        <TransactionList transactions={transactions} isCaptain={isCaptain} teamId={team.id} />
      )}
    </Container>
  );
}
