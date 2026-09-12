"use client";

import { useActionState } from "react";
import { createFriendly, type ActionState } from "@/lib/actions/friendlies";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";

export function CreateFriendlyForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createFriendly, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input label="Time da casa (ID)" name="home_team_id" placeholder="UUID do time" required />
      <Input label="Time visitante (ID)" name="away_team_id" placeholder="UUID do time" required />
      <Input label="Data e hora" name="scheduled_at" type="datetime-local" required />
      <Input label="Local" name="location" placeholder="Ex: Campo do Parque" />
      <Input label="Formato" name="format" placeholder="society, futsal, campo..." defaultValue="society" />
      <Textarea label="Observações" name="notes" rows={2} />
      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">Criar amistoso</Button>
    </form>
  );
}
