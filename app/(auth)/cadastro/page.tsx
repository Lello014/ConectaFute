"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserRole = "player" | "captain" | "organizer";

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-center text-2xl font-bold">Criar conta</h1>
      <p className="mt-2 text-center text-sm text-neutral-500">
        Junte-se a comunidade do Conecta Fute
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Eu sou...
          </label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {([
              { value: "player", label: "Jogador", icon: "👤" },
              { value: "captain", label: "Time", icon: "⚽" },
              { value: "organizer", label: "Org", icon: "🏆" },
            ] as const).map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`rounded-lg border p-3 text-center text-sm font-medium transition ${
                  role === r.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                }`}
              >
                <div className="text-lg">{r.icon}</div>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Nome completo
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            WhatsApp
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Min. 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Ja tem conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
