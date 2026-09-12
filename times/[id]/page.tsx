import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeam } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, Button, Badge } from "@/components/ui";
import { TeamMembers } from "@/components/teams/team-members";

export const metadata: Metadata = { title: "Detalhes do time" };

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const team = await getTeam(id);
  if (!team) notFound();

  const user = await requireUser();
  const isCaptain = team.captain_id === user.id;
  const members = team.team_members ?? [];
  const activeCount = members.filter((m) => m.status === "ativo").length;

  return (
    <Container className="py-10">
      <Link href="/times" className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{ backgroundColor: team.primary_color }}
          >
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              team.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-neutral-500">
              {team.city ? `${team.city}${team.state ? `/${team.state}` : ""}` : "Sem localização"}
            </p>
            {team.description && (
              <p className="mt-2 max-w-lg text-sm text-neutral-600 dark:text-neutral-300">{team.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Badge variant="info">{activeCount} {activeCount === 1 ? "membro" : "membros"}</Badge>
              {isCaptain && <Badge variant="warning">Você é o capitão</Badge>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {isCaptain && <Link href={`/times/${team.id}/editar`}><Button variant="secondary" size="sm">Editar</Button></Link>}
          <Link href={`/times/${team.id}/membros`}><Button variant="secondary" size="sm">Membros</Button></Link>
          <Link href={`/times/${team.id}/financeiro`}><Button variant="secondary" size="sm">Financeiro</Button></Link>
          <Link href={`/times/${team.id}/patrocinadores`}><Button variant="secondary" size="sm">Patrocinadores</Button></Link>
        </div>
      </div>

      <TeamMembers team={team} currentUserId={user.id} />
    </Container>
  );
}
