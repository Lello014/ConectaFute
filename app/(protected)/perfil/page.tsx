import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, city, state")
    .eq("id", user.id)
    .single();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <p className="text-sm text-neutral-500">Seus dados cadastrais</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
        <InfoRow label="Nome" value={profile?.full_name || "—"} />
        <InfoRow label="Email" value={profile?.email || "—"} />
        <InfoRow label="Telefone" value={profile?.phone || "—"} />
        <InfoRow label="Cidade" value={profile?.city || "—"} />
        <InfoRow label="Estado" value={profile?.state || "—"} />
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-100 pb-3 last:border-0 last:pb-0 dark:border-neutral-800">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-medium text-neutral-800 dark:text-white">{value}</span>
    </div>
  );
}
