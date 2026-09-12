import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFriendly } from "@/lib/data";
import { requireUser } from "@/lib/auth";
import { Container, Button, Badge } from "@/components/ui";
import { FriendlyScoreForm } from "@/components/friendlies/friendly-score-form";

export const metadata: Metadata = { title: "Detalhes do amistoso" };

export default async function FriendlyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const friendly = await getFriendly(id);
  if (!friendly) notFound();

  const user = await requireUser();
  const homeTeam = friendly.home_team;
  const awayTeam = friendly.away_team;

  const statusColors: Record<string, string> = {
    pendente: "warning",
    confirmado: "info",
    realizado: "success",
    cancelado: "danger",
  };

  const statusLabels: Record<string, string> = {
    pendente: "Pendente",
    confirmado: "Confirmado",
    realizado: "Realizado",
    cancelado: "Cancelado",
  };

  return (
    <Container className="py-10">
      <Link href="/amistosos" className="mb-6 inline-block">
        <Button variant="ghost" size="sm">&larr; Voltar</Button>
      </Link>

      <div className="mx-auto max-w-lg">
        <div className="mb-4 text-center">
          <Badge variant={statusColors[friendly.status] ?? "default"}>
            {statusLabels[friendly.status] ?? friendly.status}
          </Badge>
        </div>

        {/* Placar */}
        <div className="mb-8 flex items-center justify-center gap-6">
          <div className="text-center">
            <div
              className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: homeTeam?.primary_color ?? "#666" }}
            >
              {homeTeam?.logo_url ? (
                <img src={homeTeam.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                homeTeam?.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <p className="font-semibold text-sm">{homeTeam?.name}</p>
          </div>

          <div className="text-center">
            {friendly.status === "realizado" ? (
              <div className="text-3xl font-bold">
                {friendly.home_score} x {friendly.away_score}
              </div>
            ) : (
              <div className="text-3xl font-bold text-neutral-400">vs</div>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              {new Date(friendly.scheduled_at).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          </div>

          <div className="text-center">
            <div
              className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: awayTeam?.primary_color ?? "#666" }}
            >
              {awayTeam?.logo_url ? (
                <img src={awayTeam.logo_url} alt="" className="h-full w-full rounded-xl object-cover" />
              ) : (
                awayTeam?.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <p className="font-semibold text-sm">{awayTeam?.name}</p>
          </div>
        </div>

        {friendly.location && (
          <p className="mb-4 text-center text-sm text-neutral-500">
            📍 {friendly.location}
          </p>
        )}

        {friendly.notes && (
          <p className="mb-4 text-center text-sm text-neutral-600 dark:text-neutral-300">
            {friendly.notes}
          </p>
        )}

        {friendly.status !== "realizado" && friendly.status !== "cancelado" && (
          <FriendlyScoreForm friendlyId={friendly.id} />
        )}
      </div>
    </Container>
  );
}
