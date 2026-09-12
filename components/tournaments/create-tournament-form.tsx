"use client";

import { useActionState } from "react";
import { createTournament, type ActionState } from "@/lib/actions/tournaments";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";

export function CreateTournamentForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createTournament, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Nome do torneio" name="name" placeholder="Ex: Copa Verão 2026" required />
      <Textarea label="Descrição" name="description" rows={3} />
      <Input label="Formato" name="format" placeholder="society, futsal, campo..." defaultValue="society" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Cidade" name="city" />
        <Input label="Estado" name="state" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Data início" name="starts_at" type="date" />
        <Input label="Data fim" name="ends_at" type="date" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Máx. times" name="max_teams" type="number" min={0} />
        <Input label="Taxa de inscrição (R$)" name="registration_fee" type="number" min={0} step={0.01} />
      </div>
      <Input label="Prêmio" name="prize" placeholder="Ex: Troféu + R$ 500" />
      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">Criar torneio</Button>
    </form>
  );
}
