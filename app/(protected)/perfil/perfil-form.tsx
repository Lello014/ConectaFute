"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  avatar_url: string | null;
  nickname: string | null;
  roles: string[];
}

interface PlayerResume {
  id?: string;
  position: string;
  secondary_position: string | null;
  height: number | null;
  weight: number | null;
  dominant_foot: string;
  experience_years: number;
  previous_teams: string | null;
  achievements: string | null;
  video_url: string | null;
  availability: string;
  jersey_number: number | null;
  nickname: string | null;
  nationality: string | null;
  birthday: string | null;
  overall_rating: number;
  potential_rating: number;
  traits: string[];
  preferred_side: string;
}

const POSITIONS = [
  { value: "gk", label: "Goleiro" },
  { value: "zagueiro", label: "Zagueiro" },
  { value: "lateral_direito", label: "Lateral Direito" },
  { value: "lateral_esquerdo", label: "Lateral Esquerdo" },
  { value: "volante", label: "Volante" },
  { value: "meia", label: "Meia" },
  { value: "meia_atacante", label: "Meia Atacante" },
  { value: "ponta_direita", label: "Ponta Direita" },
  { value: "ponta_esquerda", label: "Ponta Esquerda" },
  { value: "centroavante", label: "Centroavante" },
  { value: "atacante", label: "Atacante" },
];

const TRAIT_OPTIONS = [
  "Velocidade", "Força", "Resistência", "Passe Curto", "Passe Longo",
  "Cruzamento", "Drible", "Finalização", "Cabeceio", "Marcação",
  "Posicionamento", "Liderança", "Visão de Jogo", "Cobertura",
  "Jogo Aéreo", "Tiro Livre", "Pênalti", "Reflexos", "Saída de Bola",
];

const AVAILABLE_TRAITS = ["disponivel", "em_negociacao", "indisponivel"];
const AVAILABLE_FOOT = ["destro", "canhoto", "ambos"];
const AVAILABLE_SIDE = ["esquerda", "direita", "ambas"];

const STATES = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT",
  "PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"
];

export function PerfilForm({
  profile,
  resume,
}: {
  profile: Profile;
  resume: PlayerResume | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const isPlayer = profile.roles.includes("player");

  // Profile fields
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [nick, setNick] = useState(profile.nickname || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [city, setCity] = useState(profile.city || "");
  const [state, setState] = useState(profile.state || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");

  // Player fields
  const [position, setPosition] = useState(resume?.position || "meia");
  const [secPosition, setSecPosition] = useState(resume?.secondary_position || "");
  const [jersey, setJersey] = useState(resume?.jersey_number?.toString() || "");
  const [height, setHeight] = useState(resume?.height?.toString() || "");
  const [weight, setWeight] = useState(resume?.weight?.toString() || "");
  const [domFoot, setDomFoot] = useState(resume?.dominant_foot || "destro");
  const [prefSide, setPrefSide] = useState(resume?.preferred_side || "direita");
  const [exp, setExp] = useState(resume?.experience_years?.toString() || "0");
  const [birthday, setBirthday] = useState(resume?.birthday || "");
  const [nationality, setNationality] = useState(resume?.nationality || "");
  const [over, setOver] = useState(resume?.overall_rating?.toString() || "50");
  const [potential, setPotential] = useState(resume?.potential_rating?.toString() || "50");
  const [prevTeams, setPrevTeams] = useState(resume?.previous_teams || "");
  const [achievementsText, setAchievementsText] = useState(resume?.achievements || "");
  const [videoUrl, setVideoUrl] = useState(resume?.video_url || "");
  const [availability, setAvailability] = useState(resume?.availability || "disponivel");
  const [traits, setTraits] = useState<string[]>(resume?.traits || []);

  function toggleTrait(t: string) {
    setTraits(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    // Update profile
    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        nickname: nick || null,
        phone: phone || null,
        city: city || null,
        state: state || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      })
      .eq("id", profile.id);

    if (profErr) {
      setMsg(`Erro ao salvar perfil: ${profErr.message}`);
      setSaving(false);
      return;
    }

    // Upsert player resume
    if (isPlayer) {
      const resumeData = {
        user_id: profile.id,
        position,
        secondary_position: secPosition || null,
        jersey_number: jersey ? parseInt(jersey) : null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        dominant_foot: domFoot,
        preferred_side: prefSide,
        experience_years: parseInt(exp) || 0,
        birthday: birthday || null,
        nationality: nationality || null,
        overall_rating: parseInt(over) || 50,
        potential_rating: parseInt(potential) || 50,
        previous_teams: prevTeams || null,
        achievements: achievementsText || null,
        video_url: videoUrl || null,
        availability,
        traits,
      };

      const { error: resErr } = await supabase
        .from("player_resumes")
        .upsert(resumeData, { onConflict: "user_id" });

      if (resErr) {
        setMsg(`Erro ao salvar currículo: ${resErr.message}`);
        setSaving(false);
        return;
      }
    }

    setMsg("Perfil salvo com sucesso!");
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
          msg.includes("sucesso")
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-red-500/10 text-red-400"
        }`}>
          {msg}
        </div>
      )}

      {/* Dados Pessoais */}
      <Section title="Dados Pessoais">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome Completo">
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} required />
          </Field>
          <Field label="Apelido">
            <input value={nick} onChange={e => setNick(e.target.value)} className={inputCls} placeholder="Ex: Pelé" />
          </Field>
          <Field label="Telefone">
            <input value={phone} onChange={e => setPhone(e.target.value)} className={inputCls} placeholder="(11) 99999-0000" />
          </Field>
          <Field label="Cidade">
            <input value={city} onChange={e => setCity(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Estado">
            <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
              <option value="">Selecione</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Foto (URL)">
            <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className={inputCls} placeholder="https://..." />
          </Field>
        </div>
        <Field label="Bio">
          <textarea value={bio} onChange={e => setBio(e.target.value)} className={inputCls + " min-h-[80px]"} placeholder="Conte um pouco sobre você..." />
        </Field>
      </Section>

      {/* Dados do Jogador */}
      {isPlayer && (
        <Section title="Dados do Jogador">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Posição Principal">
              <select value={position} onChange={e => setPosition(e.target.value)} className={inputCls}>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Posição Secundária">
              <select value={secPosition} onChange={e => setSecPosition(e.target.value)} className={inputCls}>
                <option value="">Nenhuma</option>
                {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Camisa #">
              <input type="number" min="0" max="99" value={jersey} onChange={e => setJersey(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Altura (cm)">
              <input type="number" min="100" max="230" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Peso (kg)">
              <input type="number" min="40" max="150" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Data de Nascimento">
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Nacionalidade">
              <input value={nationality} onChange={e => setNationality(e.target.value)} className={inputCls} placeholder="Brasileiro" />
            </Field>
            <Field label="Pé Preferido">
              <select value={domFoot} onChange={e => setDomFoot(e.target.value)} className={inputCls}>
                <option value="destro">Destro</option>
                <option value="canhoto">Canhoto</option>
                <option value="ambos">Ambos</option>
              </select>
            </Field>
            <Field label="Lado Preferido">
              <select value={prefSide} onChange={e => setPrefSide(e.target.value)} className={inputCls}>
                <option value="direita">Direita</option>
                <option value="esquerda">Esquerda</option>
                <option value="ambas">Ambas</option>
              </select>
            </Field>
            <Field label="Experiência (anos)">
              <input type="number" min="0" max="50" value={exp} onChange={e => setExp(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Nível Atual (1-99)">
              <input type="number" min="1" max="99" value={over} onChange={e => setOver(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Potencial (1-99)">
              <input type="number" min="1" max="99" value={potential} onChange={e => setPotential(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Status">
            <div className="flex gap-3">
              {AVAILABLE_TRAITS.map(a => (
                <button key={a} type="button" onClick={() => setAvailability(a)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition ${
                    availability === a
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                  }`}>
                  {a === "disponivel" ? "Disponível" : a === "em_negociacao" ? "Em Negociação" : "Indisponível"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Times Anteriores">
            <input value={prevTeams} onChange={e => setPrevTeams(e.target.value)} className={inputCls} placeholder="Ex: São Paulo, Corinthians" />
          </Field>
          <Field label="Conquistas">
            <textarea value={achievementsText} onChange={e => setAchievementsText(e.target.value)} className={inputCls + " min-h-[80px]"} placeholder="Ex: Campeão Municipal 2024" />
          </Field>
          <Field label="Link do Vídeo">
            <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className={inputCls} placeholder="https://youtube.com/..." />
          </Field>
        </Section>
      )}

      {/* Rasgos */}
      {isPlayer && (
        <Section title="Rasgos">
          <p className="text-xs text-neutral-500 mb-3">Selecione seus principais atributos:</p>
          <div className="flex flex-wrap gap-2">
            {TRAIT_OPTIONS.map(t => (
              <button key={t} type="button" onClick={() => toggleTrait(t)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                  traits.includes(t)
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </Section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar Perfil"}
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-emerald-400">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-neutral-400">{label}</label>
      {children}
    </div>
  );
}
