"use client";

import { useActionState } from "react";
import { register, type ActionState } from "@/lib/actions/auth";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import { ColorPicker } from "@/components/teams/color-picker";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(register, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* Dados pessoais */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Dados pessoais</h2>
        <div className="space-y-4">
          <Input label="Nome completo" name="full_name" placeholder="João Silva" required autoComplete="name" />
          <Input label="E-mail" name="email" type="email" placeholder="seu@email.com" required autoComplete="email" />
          <Input label="Telefone (opcional)" name="phone" type="tel" placeholder="(11) 99999-9999" autoComplete="tel" />
          <Input label="Senha" name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} autoComplete="new-password" />
        </div>
      </div>

      {/* Dados do time */}
      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Seu time</h2>
        <div className="space-y-4">
          <Input label="Nome do time" name="team_name" placeholder="Ex: FC Barcelona" required />
          <Textarea label="Descrição (opcional)" name="team_description" placeholder="Um pouco sobre o time..." rows={2} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Cidade" name="team_city" placeholder="São Paulo" />
            <Input label="Estado" name="team_state" placeholder="SP" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorPicker name="team_primary_color" label="Cor primária" defaultValue="#059669" />
            <ColorPicker name="team_secondary_color" label="Cor secundária" defaultValue="#ffffff" />
          </div>
        </div>
      </div>

      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">
        Criar conta e time
      </Button>
    </form>
  );
}
