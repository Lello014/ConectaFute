"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import type { TransactionType, TransactionCategory } from "@/lib/types";

export type ActionState = { error?: string; message?: string } | null;

export async function createTransaction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await requireUser();
  const supabase = await createClient();

  const teamId = String(formData.get("team_id") ?? "");
  const type = String(formData.get("type") ?? "despesa") as TransactionType;
  const category = String(formData.get("category") ?? "outros") as TransactionCategory;
  const description = String(formData.get("description") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const transactionDate = String(formData.get("transaction_date") ?? "").trim();
  const tournamentId = String(formData.get("tournament_id") ?? "").trim() || null;

  if (!teamId) return { error: "Time inválido." };
  if (!description) return { error: "Informe a descrição." };
  if (amount <= 0) return { error: "O valor deve ser maior que zero." };

  // Verifica se é capitão
  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode registrar transações." };
  }

  const { error } = await supabase.from("team_transactions").insert({
    team_id: teamId,
    type,
    category,
    description,
    amount,
    transaction_date: transactionDate || new Date().toISOString().split("T")[0],
    tournament_id: tournamentId,
    created_by: profile.id,
  });

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}/financeiro`);
  return { message: "Transação registrada." };
}

export async function deleteTransaction(transactionId: string, teamId: string) {
  const profile = await requireUser();
  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("captain_id")
    .eq("id", teamId)
    .single();

  if (!team || team.captain_id !== profile.id) {
    return { error: "Apenas o capitão pode excluir transações." };
  }

  const { error } = await supabase
    .from("team_transactions")
    .delete()
    .eq("id", transactionId);

  if (error) return { error: error.message };

  revalidatePath(`/times/${teamId}/financeiro`);
  return { message: "Transação excluída." };
}

export async function getTeamFinanceSummary(teamId: string) {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("team_transactions")
    .select("*")
    .eq("team_id", teamId)
    .order("transaction_date", { ascending: false });

  const txs = (transactions ?? []) as any[];

  const totalReceitas = txs
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDespesas = txs
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    transactions: txs,
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
  };
}
