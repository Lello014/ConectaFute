import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { FriendlyWithRelations } from "@/lib/data";

interface FriendlyCardProps {
  friendly: FriendlyWithRelations;
}

export function FriendlyCard({ friendly }: FriendlyCardProps) {
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
    <Link href={`/amistosos/${friendly.id}`}>
      <Card hover>
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={statusColors[friendly.status] ?? "default"}>
            {statusLabels[friendly.status] ?? friendly.status}
          </Badge>
          <span className="text-xs text-neutral-500">
            {new Date(friendly.scheduled_at).toLocaleDateString("pt-BR", {
              day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <div
              className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: homeTeam?.primary_color ?? "#666" }}
            >
              {homeTeam?.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-xs font-medium truncate max-w-[80px]">{homeTeam?.name}</p>
          </div>

          <div className="text-center">
            {friendly.status === "realizado" ? (
              <span className="text-lg font-bold">{friendly.home_score} x {friendly.away_score}</span>
            ) : (
              <span className="text-lg font-bold text-neutral-400">vs</span>
            )}
          </div>

          <div className="text-center">
            <div
              className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: awayTeam?.primary_color ?? "#666" }}
            >
              {awayTeam?.name.slice(0, 2).toUpperCase()}
            </div>
            <p className="text-xs font-medium truncate max-w-[80px]">{awayTeam?.name}</p>
          </div>
        </div>

        {friendly.location && (
          <p className="mt-3 text-center text-xs text-neutral-500">📍 {friendly.location}</p>
        )}
      </Card>
    </Link>
  );
}
