import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { Card, SectionTitle, Container, Badge } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { REPORT_STATUS_LABELS } from "@/lib/types";
import type { ReportStatus, ReportTargetType } from "@/lib/types";

export const metadata: Metadata = { title: "Denúncias - Admin" };

interface ReportWithReporter {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  created_at: string;
  reporter: { id: string; full_name: string } | null;
}

async function getReports(): Promise<ReportWithReporter[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey (id, full_name)")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as unknown as ReportWithReporter[];
}

function getReportTypeLabel(type: ReportTargetType) {
  const labels: Record<ReportTargetType, string> = {
    user: "Usuário",
    team: "Time",
    tournament: "Torneio",
  };
  return labels[type] ?? type;
}

function getStatusVariant(status: ReportStatus) {
  const variants: Record<ReportStatus, string> = {
    pendente: "warning",
    analisado: "info",
    resolvido: "success",
    arquivado: "default",
  };
  return variants[status] ?? "default";
}

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await getReports();

  const pendingCount = reports.filter((r) => r.status === "pendente").length;

  return (
    <Container className="py-10">
      <SectionTitle
        title="Denúncias"
        subtitle={`${pendingCount} pendente(s) de ${reports.length} total(is).`}
      />

      <div className="space-y-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getStatusVariant(report.status)}>
                    {REPORT_STATUS_LABELS[report.status] ?? report.status}
                  </Badge>
                  <Badge variant="default">{getReportTypeLabel(report.target_type)}</Badge>
                </div>
                <h3 className="mt-2 font-semibold">{report.reason}</h3>
                {report.description && (
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {report.description}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-4 text-xs text-neutral-400">
                  <span>Por: {report.reporter?.full_name ?? "Anônimo"}</span>
                  <span>{new Date(report.created_at).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <Card>
            <p className="text-center text-neutral-500 py-8">Nenhuma denúncia encontrada.</p>
          </Card>
        )}
      </div>
    </Container>
  );
}
