"use client";

import { useActionState } from "react";
import { upsertPlayerResume, type ActionState } from "@/lib/actions/player";
import { Button, Input, Textarea } from "@/components/ui";
import { FormMessage } from "@/components/form-message";
import type { Profile, PlayerResume } from "@/lib/types";
import { POSITION_LABELS, AVAILABILITY_LABELS, DOMINANT_FOOT_LABELS } from "@/lib/types";

interface PlayerResumeFormProps {
  profile: Profile;
  resume: PlayerResume | null;
}

export function PlayerResumeForm({ profile, resume }: PlayerResumeFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    upsertPlayerResume,
    null
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="user_id" value={profile.id} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          Posição e Habilidades
        </h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Posição principal
              </label>
              <select
                name="position"
                defaultValue={resume?.position ?? "meio"}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.entries(POSITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Posição secundária
              </label>
              <select
                name="secondary_position"
                defaultValue={resume?.secondary_position ?? ""}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                <option value="">Nenhuma</option>
                {Object.entries(POSITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Altura (cm)"
              name="height"
              type="number"
              placeholder="180"
              defaultValue={resume?.height ?? ""}
            />
            <Input
              label="Peso (kg)"
              name="weight"
              type="number"
              placeholder="75"
              defaultValue={resume?.weight ?? ""}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Pé dominante
              </label>
              <select
                name="dominant_foot"
                defaultValue={resume?.dominant_foot ?? "destro"}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              >
                {Object.entries(DOMINANT_FOOT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          Experiência
        </h2>
        <div className="space-y-4">
          <Input
            label="Anos de experiência"
            name="experience_years"
            type="number"
            placeholder="5"
            defaultValue={resume?.experience_years ?? ""}
          />
          <Textarea
            label="Times anteriores"
            name="previous_teams"
            placeholder="Ex: FC Barcelona (2020-2022), Real Madrid (2022-2024)"
            rows={3}
            defaultValue={resume?.previous_teams ?? ""}
          />
          <Textarea
            label="Conquistas pessoais"
            name="achievements"
            placeholder="Ex: Artilheiro do campeonato 2023, Melhor jogador da copa 2024"
            rows={3}
            defaultValue={resume?.achievements ?? ""}
          />
          <Input
            label="URL do vídeo (opcional)"
            name="video_url"
            placeholder="https://youtube.com/watch?v=..."
            defaultValue={resume?.video_url ?? ""}
          />
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 dark:border-neutral-700">
        <h2 className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
          Disponibilidade
        </h2>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Status
            </label>
            <select
              name="availability"
              defaultValue={resume?.availability ?? "disponivel"}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
            >
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <FormMessage state={state} />

      <Button type="submit" loading={pending} className="w-full">
        {resume ? "Atualizar Currículo" : "Criar Currículo"}
      </Button>
    </form>
  );
}
