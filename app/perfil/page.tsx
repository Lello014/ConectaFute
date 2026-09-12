import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { Container, SectionTitle } from "@/components/ui";
import { ProfileForm } from "@/components/profile/profile-form";

export const metadata: Metadata = {
  title: "Meu Perfil",
};

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <Container narrow className="py-10">
      <SectionTitle title="Meu Perfil" subtitle="Atualize suas informações pessoais." />
      <ProfileForm profile={user} />
    </Container>
  );
}
