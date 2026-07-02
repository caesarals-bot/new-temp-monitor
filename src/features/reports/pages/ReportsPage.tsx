import { useReport } from '../hooks/useReport';
import { ReportsDashboard } from '../components/ReportsDashboard';

export function ReportsPage() {
  const hook = useReport();

  return (
    <div className="flex flex-col">
      <header className="border-b border-[--color-border] bg-[--color-surface] px-6 py-4">
        <h1 className="text-lg font-semibold text-[--color-text-primary]">Reportes</h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Genera y exporta reportes de cumplimiento de cadena de frío.
        </p>
      </header>
      <div className="flex-1 p-6">
        <ReportsDashboard hook={hook} />
      </div>
    </div>
  );
}
