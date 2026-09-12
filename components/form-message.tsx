import type { ActionState } from "@/lib/actions/auth";

interface FormMessageProps {
  state: ActionState;
}

export function FormMessage({ state }: FormMessageProps) {
  if (!state) return null;

  if (state.error) {
    return (
      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {state.error}
      </div>
    );
  }

  if (state.message) {
    return (
      <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
        {state.message}
      </div>
    );
  }

  return null;
}
