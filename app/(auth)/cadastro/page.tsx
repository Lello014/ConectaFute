"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type UserRole = "player" | "captain" | "organizer";
type Step = "role" | "form";

const inputCls = "block w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white";
const labelCls = "block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1";

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<UserRole>("player");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Dados comuns
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  // Dados do jogador
  const [position, setPosition] = useState("meia");
  const [jersey, setJersey] = useState("");
  const [birthday, setBirthday] = useState("");

  // Dados do time
  const [teamName, setTeamName] = useState("");
  const [teamCity, setTeamCity] = useState("");
  const [teamState, setTeamState] = useState("");

  // Dados do organizador
  const [orgName, setOrgName] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Cadastro no auth
    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: role === "captain" ? teamName : role === "organizer" && orgName ? orgName : fullName,
          phone,
          role,
        },
      },
    });

    if (authErr) {
      if (authErr.message.includes("already registered")) {
        setError("Este email já está cadastrado. Faça login.");
      } else {
        setError(authErr.message);
      }
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    // Atualizar perfil
    await supabase.from("profiles").update({
      full_name: role === "captain" ? teamName : role === "organizer" && orgName ? orgName : fullName,
      phone,
      neighborhood: neighborhood || null,
    }).eq("id", userId);

    // Jogador: criar player_resumes
    if (role === "player") {
      await supabase.from("player_resumes").insert({
        user_id: userId,
        position,
        jersey_number: jersey ? parseInt(jersey) : null,
        birthday: birthday || null,
        neighborhood: neighborhood || null,
      });
    }

    // Capitão: criar time
    if (role === "captain") {
      const { data: team } = await supabase.from("teams").insert({
        name: teamName,
        city: teamCity || null,
        state: teamState || null,
        captain_id: userId,
      }).select().single();

      // Adicionar capitão como membro
      if (team) {
        await supabase.from("team_members").insert({
          team_id: team.id,
          user_id: userId,
          role: "captain",
          status: "ativo",
        });
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  // STEP 1: Escolha do perfil
  if (step === "role") {
    return (
      <div className="w-full max-w-sm">
        <h1 className="text-center text-2xl font-bold">Criar conta</h1>
        <p className="mt-2 text-center text-sm text-neutral-500">
          Junte-se à comunidade do Conecta Fute
        </p>

        <div className="mt-8 space-y-3">
          <RoleCard
            icon="👤"
            title="Jogador"
            desc="Quero jogar e encontrar times"
            active={role === "player"}
            onClick={() => setRole("player")}
          />
          <RoleCard
            icon="⚽"
            title="Equipe"
            desc="Tenho ou gerencio um time"
            active={role === "captain"}
            onClick={() => setRole("captain")}
          />
          <RoleCard
            icon="🏆"
            title="Organizador"
            desc="Organizo campeonatos e torneios"
            active={role === "organizer"}
            onClick={() => setRole("organizer")}
          />
        </div>

        <button
          onClick={() => setStep("form")}
          className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Continuar
        </button>

        <p className="mt-6 text-center text-sm text-neutral-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-emerald-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    );
  }

  // STEP 2: Formulário por perfil
  return (
    <div className="w-full max-w-sm">
      <button onClick={() => setStep("role")} className="mb-4 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold">
        {role === "player" && "Dados do Jogador"}
        {role === "captain" && "Dados da Equipe"}
        {role === "organizer" && "Dados do Organizador"}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        {role === "player" && "Preencha seus dados para criar seu perfil"}
        {role === "captain" && "Preencha os dados do seu time"}
        {role === "organizer" && "Preencha seus dados de organizador"}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* === JOGADOR === */}
        {role === "player" && (
          <>
            <Field label="Nome completo">
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="Seu nome" />
            </Field>
            <Field label="Email">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="seu@email.com" />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="(11) 99999-9999" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Posição">
                <select value={position} onChange={e => setPosition(e.target.value)} className={inputCls}>
                  <option value="gk">Goleiro</option>
                  <option value="zagueiro">Zagueiro</option>
                  <option value="lateral_direito">Lateral Direito</option>
                  <option value="lateral_esquerdo">Lateral Esquerdo</option>
                  <option value="volante">Volante</option>
                  <option value="meia" selected>Meia</option>
                  <option value="meia_atacante">Meia Atacante</option>
                  <option value="ponta_direita">Ponta Direita</option>
                  <option value="ponta_esquerda">Ponta Esquerda</option>
                  <option value="centroavante">Centroavante</option>
                  <option value="atacante">Atacante</option>
                </select>
              </Field>
              <Field label="Camisa #">
                <input type="number" min="0" max="99" value={jersey} onChange={e => setJersey(e.target.value)} className={inputCls} placeholder="10" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data de nascimento">
                <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Bairro/Região">
                <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className={inputCls} placeholder="Centro, Zona Sul..." />
              </Field>
            </div>
            <Field label="Senha">
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Mín. 6 caracteres" />
            </Field>
          </>
        )}

        {/* === EQUIPE === */}
        {role === "captain" && (
          <>
            <Field label="Nome do time">
              <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} className={inputCls} placeholder="Ex: Atlético Schroeder FC" />
            </Field>
            <Field label="Email do responsável">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="time@email.com" />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="(11) 99999-9999" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade">
                <input type="text" value={teamCity} onChange={e => setTeamCity(e.target.value)} className={inputCls} placeholder="São Paulo" />
              </Field>
              <Field label="Estado">
                <select value={teamState} onChange={e => setTeamState(e.target.value)} className={inputCls}>
                  <option value="">UF</option>
                  {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Senha">
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Mín. 6 caracteres" />
            </Field>
          </>
        )}

        {/* === ORGANIZADOR === */}
        {role === "organizer" && (
          <>
            <Field label="Nome completo">
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} placeholder="Seu nome" />
            </Field>
            <Field label="Nome da organização (opcional)">
              <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} className={inputCls} placeholder="Ex: Liga Amadora SP" />
            </Field>
            <Field label="Email">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="organizador@email.com" />
            </Field>
            <Field label="WhatsApp">
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="(11) 99999-9999" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade">
                <input type="text" value={orgCity} onChange={e => setOrgCity(e.target.value)} className={inputCls} placeholder="São Paulo" />
              </Field>
              <Field label="Estado">
                <select value={orgState} onChange={e => setOrgState(e.target.value)} className={inputCls}>
                  <option value="">UF</option>
                  {["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Senha">
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="Mín. 6 caracteres" />
            </Field>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

function RoleCard({ icon, title, desc, active, onClick }: {
  icon: string; title: string; desc: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 rounded-xl border p-4 text-left transition ${
        active
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
          : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white dark:bg-neutral-800 text-xl shadow-sm">
        {icon}
      </div>
      <div>
        <p className={`text-sm font-bold ${active ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-800 dark:text-white"}`}>{title}</p>
        <p className="text-xs text-neutral-500">{desc}</p>
      </div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}
