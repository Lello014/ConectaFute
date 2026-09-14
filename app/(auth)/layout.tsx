import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
          CF
        </div>
        <span className="font-semibold">Conecta Fute</span>
      </Link>
      {children}
    </div>
  );
}
