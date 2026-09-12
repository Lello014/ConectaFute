import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Entrar</h1>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-emerald-600 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
