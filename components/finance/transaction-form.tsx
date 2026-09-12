"use client";

import { useActionState } from "react";
import { createTransaction, type ActionState } from "@/lib/actions/finance";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import { TRANSACTION_CATEGORY_LABELS } from "@/lib/types";

interface CreateTransactionFormProps {
  teamId: string;
}

export function CreateTransactionForm({ teamId }: CreateTransactionFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createTransaction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="team_id" value={teamId} />

      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <select name="type" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800">
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoria</label>
        <select name="category" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800">
          {Object.entries(TRANSACTION_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <Input label="Descrição" name="description" placeholder="Ex: Aluguel do campo" required />
      <Input label="Valor (R$)" name="amount" type="number" min={0} step={0.01} required />
      <Input label="Data" name="transaction_date" type="date" />

      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">Registrar transação</Button>
    </form>
  );
}
