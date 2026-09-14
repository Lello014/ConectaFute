import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              CF
            </div>
            <span className="text-lg font-bold">Conecta Fute</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-4xl font-bold text-white shadow-lg shadow-emerald-600/20">
          CF
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Conecta <span className="text-emerald-600">Fute</span>
        </h1>
        <p className="mt-4 max-w-lg text-lg text-neutral-500 dark:text-neutral-400">
          O marketplace que conecta jogadores, clubes e organizações.
          Encontre vagas, participe de torneios e gerencie seu time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-xl bg-emerald-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
          >
            Comece agora
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-300 px-8 py-3 text-base font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
          >
            Ja tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold">Para quem?</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            <FeatureCard
              icon="👤"
              title="Jogadores"
              description="Crie seu perfil,展示 seu curriculo e encontre oportunidades em times e torneios."
            />
            <FeatureCard
              icon="⚽"
              title="Clubes"
              description="Gerencie seu elenco, financeiro, escalações e contrate jogadores."
            />
            <FeatureCard
              icon="🏆"
              title="Organizacoes"
              description="Crie torneios, gerencie inscricoes, tabelas e classificacao automatica."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-neutral-500">
          © 2026 Conecta Fute. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-4 text-4xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {description}
      </p>
    </div>
  );
}
