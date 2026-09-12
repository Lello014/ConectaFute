"use client";

import { useActionState } from "react";
import { respondJoin, removeMember, leaveTeam, type ActionState } from "@/lib/actions/teams";
import { Button, Badge, Avatar } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import type { TeamDetail } from "@/lib/data";

interface TeamMembersProps {
  team: TeamDetail;
  currentUserId: string;
}

export function TeamMembers({ team, currentUserId }: TeamMembersProps) {
  const isCaptain = team.captain_id === currentUserId;
  const members = team.team_members ?? [];

  const activeMembers = members.filter((m) => m.status === "ativo");
  const pendingMembers = members.filter((m) => m.status === "pendente");

  return (
    <div className="space-y-6">
      {/* Membros pendentes (só capitão vê) */}
      {isCaptain && pendingMembers.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Solicitações pendentes ({pendingMembers.length})
          </h3>
          <div className="space-y-2">
            {pendingMembers.map((member) => (
              <MemberRequestItem
                key={member.id}
                member={member}
                teamId={team.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Membros ativos */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Membros ({activeMembers.length})
        </h3>
        <div className="space-y-2">
          {activeMembers.map((member) => (
            <MemberItem
              key={member.id}
              member={member}
              teamId={team.id}
              isCaptain={isCaptain}
              isCurrentUser={member.user_id === currentUserId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberRequestItem({ member, teamId }: { member: any; teamId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(respondJoin, null);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <Avatar name={member.profiles?.full_name ?? "?"} />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{member.profiles?.full_name}</p>
        <p className="text-xs text-neutral-500">{member.profiles?.position}</p>
      </div>
      <form className="flex gap-2" action={formAction}>
        <input type="hidden" name="team_id" value={teamId} />
        <input type="hidden" name="member_id" value={member.id} />
        <Button type="submit" name="approve" value="1" size="sm" loading={pending}>
          Aprovar
        </Button>
        <Button type="submit" name="approve" value="0" size="sm" variant="danger" loading={pending}>
          Recusar
        </Button>
      </form>
    </div>
  );
}

function MemberItem({ member, teamId, isCaptain, isCurrentUser }: {
  member: any;
  teamId: string;
  isCaptain: boolean;
  isCurrentUser: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    isCurrentUser ? leaveTeam : removeMember,
    null
  );

  const isMemberCaptain = member.role === "captain";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900">
      <Avatar name={member.profiles?.full_name ?? "?"} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{member.profiles?.full_name}</p>
          {isMemberCaptain && <Badge variant="warning">Capitão</Badge>}
        </div>
        <p className="text-xs text-neutral-500">
          {member.position ?? "Sem posição definida"}
          {member.jersey_number ? ` • #${member.jersey_number}` : ""}
        </p>
      </div>

      {!isMemberCaptain && (isCaptain || isCurrentUser) && (
        <form action={formAction}>
          <input type="hidden" name="team_id" value={teamId} />
          <input type="hidden" name="member_id" value={member.id} />
          <Button
            type="submit"
            size="sm"
            variant={isCurrentUser ? "ghost" : "danger"}
            loading={pending}
          >
            {isCurrentUser ? "Sair" : "Remover"}
          </Button>
        </form>
      )}
    </div>
  );
}
