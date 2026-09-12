"use client";

import { useActionState } from "react";
import { updateProfile, type ActionState } from "@/lib/actions/profile";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import type { Profile } from "@/lib/types";

interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(updateProfile, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="Nome completo"
        name="full_name"
        defaultValue={profile.full_name}
        required
      />
      <Input
        label="Telefone"
        name="phone"
        type="tel"
        defaultValue={profile.phone ?? ""}
        placeholder="(11) 99999-9999"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Cidade"
          name="city"
          defaultValue={profile.city ?? ""}
          placeholder="São Paulo"
        />
        <Input
          label="Estado"
          name="state"
          defaultValue={profile.state ?? ""}
          placeholder="SP"
        />
      </div>
      <Textarea
        label="Bio"
        name="bio"
        defaultValue={profile.bio ?? ""}
        placeholder="Conte um pouco sobre você..."
        rows={3}
      />

      <FormMessage state={state} />

      <Button type="submit" loading={pending}>
        Salvar alterações
      </Button>
    </form>
  );
}
