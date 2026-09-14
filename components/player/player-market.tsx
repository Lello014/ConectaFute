"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível", icon: "✅", desc: "Aberto a propostas de times", color: "emerald" },
  { value: "apenas_avulso", label: "Apenas Avulso", icon: "🔄", desc: "Só para substituições ou rachas", color: "blue" },
  { value: "fechando_elenco", label: "Fechando Elenco", icon: "⏳", desc: "Em negociação com time", color: "yellow" },
  { value: "indisponivel", label: "Indisponível", icon: "🚫", desc: "Não aceita propostas no momento", color: "red" },
];

const colorMap: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  emerald: { border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", ring: "ring-emerald-500/30" },
  blue: { border: "border-blue-500/40", bg: "bg-blue-500/10", text: "text-blue-400", ring: "ring-blue-500/30" },
  yellow: { border: "border-yellow-500/40", bg: "bg-yellow-500/10", text: "text-yellow-400", ring: "ring-yellow-500/30" },
  red: { border: "border-red-500/40", bg: "bg-red-500/10", text: "text-red-400", ring: "ring-red-500/30" },
};

export function PlayerMarketStatus({
  userId,
  currentStatus = "disponivel",
}: {
  userId: string;
  currentStatus?: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function updateStatus(newStatus: string) {
    setSaving(true);
    setMsg("");
    const supabase = createClient();

    const { error } = await supabase
      .from("player_resumes")
      .upsert({ user_id: userId, market_status: newStatus }, { onConflict: "user_id" });

    if (error) {
      setMsg("Erro ao atualizar");
    } else {
      setStatus(newStatus);
      setMsg("Status atualizado!");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 2000);
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a0f1a] via-[#0d1526] to-[#060a12] overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Status de Mercado</p>
        <p className="mt-1 text-[10px] text-neutral-500">Informe se está disponível para contratação</p>
      </div>

      <div className="grid grid-cols-2 gap-2 px-5 pb-4">
        {STATUS_OPTIONS.map((opt) => {
          const c = colorMap[opt.color];
          const isActive = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updateStatus(opt.value)}
              disabled={saving}
              className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition ${
                isActive
                  ? `${c.border} ${c.bg} ring-2 ${c.ring}`
                  : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08]"
              }`}
            >
              <span className="text-lg">{opt.icon}</span>
              <span className={`text-[10px] font-bold ${isActive ? c.text : "text-neutral-400"}`}>{opt.label}</span>
              <span className="text-[8px] text-neutral-600 leading-tight">{opt.desc}</span>
            </button>
          );
        })}
      </div>

      {msg && (
        <div className={`mx-5 mb-4 rounded-lg px-3 py-1.5 text-center text-[10px] font-medium ${
          msg.includes("Erro") ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}
