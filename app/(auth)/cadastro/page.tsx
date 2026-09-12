import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-center text-2xl font-bold">Criar conta</h1>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
