"use client";

import { useActionState } from "react";
import { createSponsor, type ActionState } from "@/lib/actions/sponsors";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";

interface CreateSponsorFormProps {
  teamId: string;
}

export function CreateSponsorForm({ teamId }: CreateSponsorFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createSponsor, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="team_id" value={teamId} />
      <Input label="Nome do patrocinador" name="name" placeholder="Ex: Empresa XYZ" required />
      <Input label="URL do logo" name="logo_url" placeholder="https://..." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Contato" name="contact_name" placeholder="Nome do responsável" />
        <Input label="Telefone" name="contact_phone" placeholder="(11) 99999-9999" />
      </div>
      <Input label="E-mail" name="contact_email" type="email" placeholder="contato@empresa.com" />
      <Input label="Valor mensal (R$)" name="monthly_value" type="number" min={0} step={0.01} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Data início" name="start_date" type="date" />
        <Input label="Data fim" name="end_date" type="date" />
      </div>
      <Textarea label="Observações" name="notes" rows={2} />
      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">Adicionar patrocinador</Button>
    </form>
  );
}
