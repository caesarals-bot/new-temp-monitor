import { useCallback, useState, type RefObject } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Button } from '@/shared/components/ui/button';
import { exportReportPdf } from '../lib/pdfExport';
import type { ReportData } from '../types';

export interface PdfExportButtonProps {
  reportData: ReportData;
  chartRef: RefObject<HTMLDivElement | null>;
  onError: (message: string) => void;
}

export function PdfExportButton({ reportData, chartRef, onError }: PdfExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      const { blob, filename } = await exportReportPdf(chartRef.current, toPng, {
        report: reportData,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Error al exportar PDF');
    } finally {
      setIsExporting(false);
    }
  }, [chartRef, reportData, onError]);

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting}
      data-testid="export-pdf-button"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Generando...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" aria-hidden="true" />
          Exportar PDF
        </>
      )}
    </Button>
  );
}
