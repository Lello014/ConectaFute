import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionTitle, Button, EmptyState, Badge } from "@/components/ui";
import { listFriendlies } from "@/lib/data";
import { FriendlyCard } from "@/components/friendlies/friendly-card";

export const metadata: Metadata = { title: "Amistosos" };

export default async function FriendliesPage() {
  const friendlies = await listFriendlies();

  return (
    <Container className="py-10">
      <SectionTitle
        title="Amistosos"
        subtitle="Jogos amistosos entre times."
        action={<Link href="/amistosos/novo"><Button>Criar amistoso</Button></Link>}
      />
      {friendlies.length === 0 ? (
        <EmptyState
          title="Nenhum amistoso encontrado"
          description="Crie o primeiro amistoso."
          action={<Link href="/amistosos/novo"><Button>Criar amistoso</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friendlies.map((f) => <FriendlyCard key={f.id} friendly={f} />)}
        </div>
      )}
    </Container>
  );
}
