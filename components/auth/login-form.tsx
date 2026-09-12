"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/actions/auth";
import { Button, Input } from "@/components/ui";
import { FormMessage } from "@/components/form-message";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-4">
      <Input
        label="E-mail"
        name="email"
        type="email"
        placeholder="seu@email.com"
        required
        autoComplete="email"
      />
      <Input
        label="Senha"
        name="password"
        type="password"
        placeholder="••••••"
        required
        autoComplete="current-password"
      />
      <FormMessage state={state} />
      <Button type="submit" loading={pending} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
