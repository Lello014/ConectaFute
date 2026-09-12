import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel Admin - Conecta Fute" };

async function getAdminStats() {
  const supabase = await createClient();

  const [teamsRes, playersRes, tournamentsRes, reportsRes] = await Promise.all([
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("tournaments").select("id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);

  return {
    totalTeams: teamsRes.count ?? 0,
    totalPlayers: playersRes.count ?? 0,
    totalTournaments: tournamentsRes.count ?? 0,
    pendingReports: reportsRes.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Painel Administrativo"
        subtitle="Gerencie a plataforma Conecta Fute."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="text-2xl mb-2">👥</div>
          <div className="text-3xl font-bold">{stats.totalPlayers}</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Jogadores</p>
        </Card>

        <Card>
          <div className="text-2xl mb-2">⚽</div>
          <div className="text-3xl font-bold">{stats.totalTeams}</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Times</p>
        </Card>

        <Card>
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-3xl font-bold">{stats.totalTournaments}</div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Torneios</p>
        </Card>

        <Card>
          <div className="text-2xl mb-2">🚨</div>
          <div className="text-3xl font-bold">
            {stats.pendingReports > 0 ? (
              <Badge variant="danger">{stats.pendingReports}</Badge>
            ) : (
              stats.pendingReports
            )}
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Denúncias Pendentes</p>
        </Card>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/usuarios">
          <Card hover>
            <div className="mb-2 text-2xl">👤</div>
            <h3 className="font-semibold">Gerenciar Usuários</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Listar, suspender e gerenciar perfis.
            </p>
          </Card>
        </Link>

        <Link href="/admin/denuncias">
          <Card hover>
            <div className="mb-2 text-2xl">🚨</div>
            <h3 className="font-semibold">Denúncias</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Revisar e resolver denúncias.
            </p>
          </Card>
        </Link>

        <Link href="/times">
          <Card hover>
            <div className="mb-2 text-2xl">⚽</div>
            <h3 className="font-semibold">Times</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Visualizar todos os times.
            </p>
          </Card>
        </Link>

        <Link href="/torneios">
          <Card hover>
            <div className="mb-2 text-2xl">🏆</div>
            <h3 className="font-semibold">Torneios</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Visualizar todos os torneios.
            </p>
          </Card>
        </Link>

        <Link href="/locais">
          <Card hover>
            <div className="mb-2 text-2xl">📍</div>
            <h3 className="font-semibold">Locais</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Gerenciar campos e quadras.
            </p>
          </Card>
        </Link>
      </div>
    </Container>
  );
}
