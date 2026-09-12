"use client";

import { useActionState } from "react";
import { createTeam, type ActionState } from "@/lib/actions/teams";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import { ColorPicker } from "./color-picker";

export function CreateTeamForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createTeam, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Nome do time"
        name="name"
        placeholder="Ex: FC Barcelona"
        required
      />
      <Textarea
        label="Descrição (opcional)"
        name="description"
        placeholder="Um pouco sobre o time..."
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Cidade"
          name="city"
          placeholder="São Paulo"
        />
        <Input
          label="Estado"
          name="state"
          placeholder="SP"
        />
      </div>
      <Input
        label="URL do logo (opcional)"
        name="logo_url"
        placeholder="https://..."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorPicker name="primary_color" label="Cor primária" defaultValue="#059669" />
        <ColorPicker name="secondary_color" label="Cor secundária" defaultValue="#ffffff" />
      </div>

      <FormMessage state={state} />

      <Button type="submit" loading={pending} className="w-full">
        Criar time
      </Button>
    </form>
  );
}
