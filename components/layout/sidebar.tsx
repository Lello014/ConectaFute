"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Inicio" },
  { href: "/perfil", icon: "👤", label: "Meu Perfil" },
  { href: "/times", icon: "⚽", label: "Meus Times" },
  { href: "/torneios", icon: "🏆", label: "Torneios" },
  { href: "/amistosos", icon: "🤝", label: "Amistosos" },
  { href: "/vagas", icon: "📋", label: "Vagas" },
  { href: "/locais", icon: "📍", label: "Locais" },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-neutral-200 px-5 dark:border-neutral-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
          CF
        </div>
        <span className="text-lg font-bold">Conecta Fute</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-900/20"
          >
            <span className="text-lg">🚪</span>
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
