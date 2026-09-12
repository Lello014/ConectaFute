import { Card } from "@/components/ui";

interface FinanceSummaryProps {
  totalReceitas: number;
  totalDespesas: number;
}

export function FinanceSummary({ totalReceitas, totalDespesas }: FinanceSummaryProps) {
  const saldo = totalReceitas - totalDespesas;

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      <Card>
        <p className="text-sm text-emerald-600 font-medium">Receitas</p>
        <p className="text-2xl font-bold text-emerald-600">R$ {totalReceitas.toFixed(2)}</p>
      </Card>
      <Card>
        <p className="text-sm text-red-600 font-medium">Despesas</p>
        <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
      </Card>
      <Card>
        <p className="text-sm text-neutral-600 font-medium">Saldo</p>
        <p className={`text-2xl font-bold ${saldo >= 0 ? "text-emerald-600" : "text-red-600"}`}>
          R$ {saldo.toFixed(2)}
        </p>
      </Card>
    </div>
  );
}
