import type { Metadata } from "next";
import { Card, SectionTitle, Container, Badge, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { SURFACE_TYPE_LABELS } from "@/lib/types";
import type { SurfaceType } from "@/lib/types";

export const metadata: Metadata = { title: "Locais - Conecta Fute" };

interface VenueData {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  capacity: number | null;
  surface_type: SurfaceType;
  hourly_rate: number;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string;
}

async function getVenues(): Promise<VenueData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .order("name", { ascending: true });

  return (data ?? []) as unknown as VenueData[];
}

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Locais"
        subtitle="Campos e quadras disponíveis."
      />

      {venues.length === 0 ? (
        <EmptyState
          icon="📍"
          title="Nenhum local cadastrado"
          description="Locais para jogos aparecerão aqui."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id}>
              <h3 className="font-semibold">{venue.name}</h3>
              {venue.address && (
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {venue.address}
                </p>
              )}
              {venue.city && (
                <p className="text-xs text-neutral-400">
                  {venue.city}/{venue.state}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="info">
                  {SURFACE_TYPE_LABELS[venue.surface_type] ?? venue.surface_type}
                </Badge>
                {venue.capacity && (
                  <Badge variant="default">
                    Cap: {venue.capacity}
                  </Badge>
                )}
                {venue.hourly_rate > 0 && (
                  <Badge variant="success">
                    R$ {venue.hourly_rate.toFixed(2)}/h
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}
