import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge, EmptyState, Avatar } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { POSITION_LABELS } from "@/lib/types";
import type { Position } from "@/lib/types";

export const metadata: Metadata = { title: "Vagas Abertas - Conecta Fute" };

interface JobOfferWithTeam {
  id: string;
  team_id: string;
  player_id: string;
  message: string | null;
  position_offered: Position | null;
  status: string;
  created_at: string;
  team: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string;
    city: string | null;
    state: string | null;
  } | null;
  player: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

async function getJobOffers(): Promise<JobOfferWithTeam[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("job_offers")
    .select("*, team:teams (id, name, logo_url, primary_color, city, state), player:profiles!job_offers_player_id_fkey (id, full_name, avatar_url)")
    .eq("status", "pendente")
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as JobOfferWithTeam[];
}

export default async function JobOffersPage() {
  const user = await requireUser();
  const offers = await getJobOffers();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Vagas Abertas"
        subtitle="Times buscando novos jogadores."
      />

      {offers.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Nenhuma vaga disponível"
          description="Novas vagas aparecerão aqui quando times estiverem recrutando."
        />
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <Card key={offer.id}>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: offer.team?.primary_color ?? "#059669" }}
                >
                  {offer.team?.logo_url ? (
                    <img src={offer.team.logo_url} alt={offer.team.name ?? ""} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    offer.team?.name?.slice(0, 2).toUpperCase() ?? "??"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{offer.team?.name ?? "Time"}</h3>
                    {offer.team?.city && (
                      <span className="text-xs text-neutral-400">
                        {offer.team.city}/{offer.team.state}
                      </span>
                    )}
                  </div>
                  {offer.position_offered && (
                    <Badge variant="info" className="mt-1">
                      {POSITION_LABELS[offer.position_offered] ?? offer.position_offered}
                    </Badge>
                  )}
                  {offer.message && (
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {offer.message}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-neutral-400">
                    {new Date(offer.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
