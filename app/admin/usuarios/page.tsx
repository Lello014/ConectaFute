import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { ROLE_LABELS } from "@/lib/types";
import type { AppRole } from "@/lib/types";

export const metadata: Metadata = { title: "Gerenciar Usuários - Admin" };

interface UserWithTeams {
  id: string;
  full_name: string;
  email: string | null;
  avatar_url: string | null;
  roles: AppRole[];
  created_at: string;
  team_members: {
    id: string;
    team_id: string;
    role: string;
    status: string;
    teams: { id: string; name: string } | null;
  }[] | null;
}

async function getAllUsers(): Promise<UserWithTeams[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*, team_members (id, team_id, role, status, teams (id, name))")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as UserWithTeams[];
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Gerenciar Usuários"
        subtitle={`${users.length} usuários cadastrados.`}
      />

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <div className="flex items-center gap-4">
              <Avatar src={user.avatar_url} name={user.full_name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{user.full_name}</h3>
                  {user.roles.map((role) => (
                    <Badge key={role} variant={role === "admin" ? "danger" : role === "captain" ? "warning" : "default"}>
                      {ROLE_LABELS[role] ?? role}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                  {user.email}
                </p>
                {user.team_members && user.team_members.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {user.team_members.map((membership) => (
                      <Badge key={membership.id} variant="info">
                        {membership.teams?.name} ({membership.role === "captain" ? "Capitão" : "Jogador"})
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-xs text-neutral-400">
                {new Date(user.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <p className="text-center text-neutral-500 py-8">Nenhum usuário encontrado.</p>
          </Card>
        )}
      </div>
    </Container>
  );
}
