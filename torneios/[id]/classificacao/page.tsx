import type { Metadata } from "next";
import { Card, SectionTitle, Container } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Classificação - Torneio" };

interface TeamStanding {
  team_id: string;
  team_name: string;
  team_color: string;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

async function getTournamentStandings(tournamentId: string) {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("*, home_team:teams!matches_home_team_id_fkey (id, name, primary_color), away_team:teams!matches_away_team_id_fkey (id, name, primary_color)")
    .eq("tournament_id", tournamentId)
    .eq("status", "jogado");

  if (!matches) return [];

  const standingsMap = new Map<string, TeamStanding>();

  for (const match of matches) {
    if (match.home_score === null || match.away_score === null) continue;

    // Home team
    if (!standingsMap.has(match.home_team_id)) {
      standingsMap.set(match.home_team_id, {
        team_id: match.home_team_id,
        team_name: match.home_team?.name ?? "Time",
        team_color: match.home_team?.primary_color ?? "#059669",
        matches: 0, wins: 0, draws: 0, losses: 0,
        goals_for: 0, goals_against: 0, goal_difference: 0, points: 0,
      });
    }
    const home = standingsMap.get(match.home_team_id)!;
    home.matches++;
    home.goals_for += match.home_score;
    home.goals_against += match.away_score;
    home.goal_difference = home.goals_for - home.goals_against;

    if (match.home_score > match.away_score) {
      home.wins++;
      home.points += 3;
    } else if (match.home_score === match.away_score) {
      home.draws++;
      home.points += 1;
    } else {
      home.losses++;
    }

    // Away team
    if (!standingsMap.has(match.away_team_id)) {
      standingsMap.set(match.away_team_id, {
        team_id: match.away_team_id,
        team_name: match.away_team?.name ?? "Time",
        team_color: match.away_team?.primary_color ?? "#059669",
        matches: 0, wins: 0, draws: 0, losses: 0,
        goals_for: 0, goals_against: 0, goal_difference: 0, points: 0,
      });
    }
    const away = standingsMap.get(match.away_team_id)!;
    away.matches++;
    away.goals_for += match.away_score;
    away.goals_against += match.home_score;
    away.goal_difference = away.goals_for - away.goals_against;

    if (match.away_score > match.home_score) {
      away.wins++;
      away.points += 3;
    } else if (match.away_score === match.home_score) {
      away.draws++;
      away.points += 1;
    } else {
      away.losses++;
    }
  }

  const standings = Array.from(standingsMap.values());
  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
    return b.goals_for - a.goals_for;
  });

  return standings;
}

export default async function TournamentStandingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const standings = await getTournamentStandings(id);

  return (
    <Container className="py-10">
      <SectionTitle
        title="Classificação"
        subtitle="Tabela de classificação do campeonato."
      />

      {standings.length === 0 ? (
        <Card>
          <p className="text-center text-neutral-500 py-8">
            Nenhum jogo disputado ainda.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="pb-3 text-left font-medium text-neutral-500">#</th>
                <th className="pb-3 text-left font-medium text-neutral-500">Time</th>
                <th className="pb-3 text-center font-medium text-neutral-500">P</th>
                <th className="pb-3 text-center font-medium text-neutral-500">J</th>
                <th className="pb-3 text-center font-medium text-neutral-500">V</th>
                <th className="pb-3 text-center font-medium text-neutral-500">E</th>
                <th className="pb-3 text-center font-medium text-neutral-500">D</th>
                <th className="pb-3 text-center font-medium text-neutral-500">GP</th>
                <th className="pb-3 text-center font-medium text-neutral-500">GC</th>
                <th className="pb-3 text-center font-medium text-neutral-500">SG</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing, index) => (
                <tr
                  key={standing.team_id}
                  className="border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                >
                  <td className="py-3 font-medium">{index + 1}º</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: standing.team_color }}
                      />
                      <span className="font-medium">{standing.team_name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-bold">{standing.points}</td>
                  <td className="py-3 text-center">{standing.matches}</td>
                  <td className="py-3 text-center text-emerald-600">{standing.wins}</td>
                  <td className="py-3 text-center text-amber-600">{standing.draws}</td>
                  <td className="py-3 text-center text-red-600">{standing.losses}</td>
                  <td className="py-3 text-center">{standing.goals_for}</td>
                  <td className="py-3 text-center">{standing.goals_against}</td>
                  <td className="py-3 text-center font-medium">
                    <span className={standing.goal_difference > 0 ? "text-emerald-600" : standing.goal_difference < 0 ? "text-red-600" : ""}>
                      {standing.goal_difference > 0 ? "+" : ""}{standing.goal_difference}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </Container>
  );
}
