"use client";

import { useActionState } from "react";
import { deleteTransaction, type ActionState } from "@/lib/actions/finance";
import { Button, Badge } from "@/components/ui";
import { TRANSACTION_CATEGORY_LABELS } from "@/lib/types";
import type { TeamTransaction } from "@/lib/types";

interface TransactionListProps {
  transactions: TeamTransaction[];
  isCaptain: boolean;
  teamId: string;
}

export function TransactionList({ transactions, isCaptain, teamId }: TransactionListProps) {
  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} isCaptain={isCaptain} teamId={teamId} />
      ))}
    </div>
  );
}

function TransactionRow({ transaction: tx, isCaptain, teamId }: {
  transaction: TeamTransaction;
  isCaptain: boolean;
  teamId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async () => deleteTransaction(tx.id, teamId),
    null
  );

  const isReceita = tx.type === "receita";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{tx.description}</p>
          <Badge variant={isReceita ? "success" : "danger"} className="text-[10px]">
            {isReceita ? "Receita" : "Despesa"}
          </Badge>
          <Badge variant="default" className="text-[10px]">
            {TRANSACTION_CATEGORY_LABELS[tx.category]}
          </Badge>
        </div>
        <p className="text-xs text-neutral-500">
          {new Date(tx.transaction_date).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <p className={`font-bold ${isReceita ? "text-emerald-600" : "text-red-600"}`}>
        {isReceita ? "+" : "-"} R$ {Number(tx.amount).toFixed(2)}
      </p>
      {isCaptain && (
        <form action={formAction}>
          <Button type="submit" size="sm" variant="ghost" loading={pending}>Excluir</Button>
        </form>
      )}
    </div>
  );
}
