import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import type { TournamentWithRelations } from "@/lib/data";

interface TournamentCardProps {
  tournament: TournamentWithRelations;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const teamsCount = tournament.tournament_teams?.length ?? 0;

  const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
    inscricoes: "info",
    em_andamento: "success",
    encerrado: "default",
  };

  return (
    <Link href={`/torneios/${tournament.id}`}>
      <Card hover>
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={statusColors[tournament.status] ?? "default"}>
            {tournament.status === "inscricoes" ? "Inscrições abertas" : tournament.status === "em_andamento" ? "Em andamento" : "Encerrado"}
          </Badge>
          {tournament.starts_at && (
            <span className="text-xs text-neutral-500">
              {new Date(tournament.starts_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        <h3 className="font-semibold">{tournament.name}</h3>
        <p className="text-sm text-neutral-500">
          {tournament.city ? `${tournament.city}${tournament.state ? `/${tournament.state}` : ""}` : "Sem localização"}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
          <span>{teamsCount} times inscritos</span>
          {tournament.prize && <span>🏆 {tournament.prize}</span>}
        </div>
      </Card>
    </Link>
  );
}
