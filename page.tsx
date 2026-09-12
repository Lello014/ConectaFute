import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-600 text-4xl font-bold text-white">
        CF
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Conecta Fute</h1>
      <p className="mt-3 max-w-md text-lg text-neutral-500 dark:text-neutral-400">
        Gerencie seu time, organize amistosos, participe de torneios e controle as finanças.
      </p>
      <div className="mt-8 flex gap-4">
        <Link href="/cadastro">
          <Button size="lg">Criar conta</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary" size="lg">Entrar</Button>
        </Link>
      </div>
    </div>
  );
}
