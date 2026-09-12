import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, isAdmin } from "@/lib/auth";
import { Card, SectionTitle, Container, Button, Badge } from "@/components/ui";
import { getMyTeams } from "@/lib/data";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const myTeams = await getMyTeams(user.id);

  return (
    <Container className="py-10">
      <SectionTitle
        title={`Olá, ${user.full_name.split(" ")[0]}!`}
        subtitle="Bem-vindo ao Conecta Fute."
      />

      {isAdmin(user) && (
        <div className="mb-6">
          <Link href="/admin">
            <Card hover className="border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚙️</div>
                <div>
                  <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">Painel Administrativo</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Gerencie a plataforma.</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/times/novo">
          <Card hover>
            <div className="mb-2 text-2xl">⚽</div>
            <h3 className="font-semibold">Criar Time</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Monte seu time com cores e logo.</p>
          </Card>
        </Link>

        <Link href="/amistosos">
          <Card hover>
            <div className="mb-2 text-2xl">🤝</div>
            <h3 className="font-semibold">Amistosos</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Organize jogos amistosos.</p>
          </Card>
        </Link>

        <Link href="/torneios">
          <Card hover>
            <div className="mb-2 text-2xl">🏆</div>
            <h3 className="font-semibold">Torneios</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Crie campeonatos e copas.</p>
          </Card>
        </Link>

        <Link href="/times">
          <Card hover>
            <div className="mb-2 text-2xl">👥</div>
            <h3 className="font-semibold">Times</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Veja todos os times.</p>
          </Card>
        </Link>

        <Link href="/vagas">
          <Card hover>
            <div className="mb-2 text-2xl">📋</div>
            <h3 className="font-semibold">Vagas Abertas</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Times buscando jogadores.</p>
          </Card>
        </Link>

        <Link href="/propostas">
          <Card hover>
            <div className="mb-2 text-2xl">📬</div>
            <h3 className="font-semibold">Minhas Propostas</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Propostas recebidas.</p>
          </Card>
        </Link>

        <Link href="/perfil">
          <Card hover>
            <div className="mb-2 text-2xl">👤</div>
            <h3 className="font-semibold">Meu Perfil</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Atualize suas informações.</p>
          </Card>
        </Link>

        <Link href="/perfil/curriculo">
          <Card hover>
            <div className="mb-2 text-2xl">📄</div>
            <h3 className="font-semibold">Meu Currículo</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Monte seu perfil de jogador.</p>
          </Card>
        </Link>

        <Link href="/perfil/conquistas">
          <Card hover>
            <div className="mb-2 text-2xl">🥇</div>
            <h3 className="font-semibold">Conquistas</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Seus títulos e prêmios.</p>
          </Card>
        </Link>
      </div>

      {myTeams.length > 0 && (
        <div className="mt-10">
          <SectionTitle title="Meus Times" subtitle="Times que você faz parte." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myTeams.map((membership) => {
              const team = membership.teams;
              const activeMembers = team.team_members?.filter((m) => m.status === "ativo").length ?? 0;
              return (
                <Link key={membership.id} href={`/times/${team.id}`}>
                  <Card hover className="overflow-hidden">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                        style={{ backgroundColor: team.primary_color }}
                      >
                        {team.logo_url ? (
                          <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-xl object-cover" />
                        ) : (
                          team.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{team.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-500">
                          <Badge variant={membership.role === "captain" ? "warning" : "default"}>
                            {membership.role === "captain" ? "Capitão" : "Jogador"}
                          </Badge>
                          <span>{activeMembers} membros</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </Container>
  );
}
