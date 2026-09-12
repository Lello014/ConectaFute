import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle, Card, Badge, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Minhas Conquistas - Conecta Fute" };

async function getPlayerAchievements(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("achievements")
    .select("*, tournaments (id, name)")
    .eq("entity_type", "player")
    .eq("entity_id", userId)
    .order("year", { ascending: false });

  return data ?? [];
}

export default async function PlayerAchievementsPage() {
  const user = await requireUser();
  const achievements = await getPlayerAchievements(user.id);

  return (
    <Container className="py-10">
      <SectionTitle
        title="Minhas Conquistas"
        subtitle="Registre seus títulos e prêmios individuais."
      />

      {achievements.length === 0 ? (
        <EmptyState
          icon="🏆"
          title="Nenhuma conquista registrada"
          description="Suas conquistas aparecerão aqui após serem registradas."
        />
      ) : (
        <div className="space-y-3">
          {achievements.map((achievement) => (
            <Card key={achievement.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <Badge variant="warning">{achievement.year}</Badge>
                  </div>
                  {achievement.description && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {achievement.description}
                    </p>
                  )}
                  {achievement.tournaments && (
                    <p className="mt-1 text-xs text-neutral-400">
                      Torneio: {achievement.tournaments.name}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
