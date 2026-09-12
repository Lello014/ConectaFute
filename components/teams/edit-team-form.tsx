"use client";

import { useActionState } from "react";
import { updateTeam, type ActionState } from "@/lib/actions/teams";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import { ColorPicker } from "./color-picker";
import type { Team } from "@/lib/types";

interface EditTeamFormProps {
  team: Team;
}

export function EditTeamForm({ team }: EditTeamFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateTeam, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="team_id" value={team.id} />
      <Input
        label="Nome do time"
        name="name"
        defaultValue={team.name}
        required
      />
      <Textarea
        label="Descrição"
        name="description"
        defaultValue={team.description ?? ""}
        rows={3}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Cidade"
          name="city"
          defaultValue={team.city ?? ""}
        />
        <Input
          label="Estado"
          name="state"
          defaultValue={team.state ?? ""}
        />
      </div>
      <Input
        label="URL do logo"
        name="logo_url"
        defaultValue={team.logo_url ?? ""}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorPicker name="primary_color" label="Cor primária" defaultValue={team.primary_color} />
        <ColorPicker name="secondary_color" label="Cor secundária" defaultValue={team.secondary_color} />
      </div>

      <FormMessage state={state} />

      <Button type="submit" loading={pending}>
        Salvar alterações
      </Button>
    </form>
  );
}
