import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { PlayerResumeForm } from "@/components/profile/player-resume-form";

export const metadata: Metadata = { title: "Meu Currículo - Conecta Fute" };

async function getPlayerResume(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("player_resumes")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data;
}

export default async function PlayerResumePage() {
  const user = await requireUser();
  const resume = await getPlayerResume(user.id);

  return (
    <Container narrow className="py-10">
      <SectionTitle
        title="Meu Currículo"
        subtitle="Compartilhe suas informações para times interessados."
      />
      <PlayerResumeForm profile={user} resume={resume} />
    </Container>
  );
}
