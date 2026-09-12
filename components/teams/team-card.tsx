import Link from "next/link";
import { Card, Badge, Avatar } from "@/components/ui";
import type { TeamWithRelations } from "@/lib/data";

interface TeamCardProps {
  team: TeamWithRelations;
}

export function TeamCard({ team }: TeamCardProps) {
  const members = team.team_members ?? [];
  const activeMembers = members.filter((m) => m.status === "ativo").length;
  const captain = team.profiles;

  return (
    <Link href={`/times/${team.id}`}>
      <Card hover className="overflow-hidden">
        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
            style={{ backgroundColor: team.primary_color }}
          >
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="h-full w-full rounded-xl object-cover" />
            ) : (
              team.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
              {team.name}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {team.city ? `${team.city}${team.state ? `/${team.state}` : ""}` : "Sem localização"}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span>{activeMembers} {activeMembers === 1 ? "membro" : "membros"}</span>
              {captain && (
                <span className="flex items-center gap-1">
                  <Badge variant="warning" className="text-[10px]">Capitão</Badge>
                  {captain.full_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
