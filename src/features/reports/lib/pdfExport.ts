/**
 * Generación de PDF del reporte.
 *
 * Estrategia: jsPDF + jspdf-autotable (sin React wrapper). El chart se
 * exporta como PNG vía `html-to-image` (función inyectada para tests
 * deterministas — en producción se usa `toPng` del DOM).
 *
 * El PDF incluye:
 * - Header: logo (placeholder TempMonitor en V1) + nombre org + período
 * - Tabla de lecturas con snapshot de rangos térmicos (no los actuales)
 * - Tabla de incidentes del período (resueltos / abiertos)
 * - Footer: snapshot de rangos térmicos vigentes por equipo
 *
 * El chart se inserta como imagen solo si se provee (la página lo captura
 * del DOM con un ref y `html-to-image`).
 */
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportData } from '../types';

export interface GeneratePdfOptions {
  report: ReportData;
  chartPng?: string | null;
  generatedAt?: Date;
}

export type PngExporter = (node: HTMLElement) => Promise<string>;

export function generatePdf({
  report,
  chartPng = null,
  generatedAt = new Date(),
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  renderHeader(doc, report, pageWidth);
  renderComplianceBlock(doc, report, pageWidth);
  if (chartPng) {
    renderChart(doc, chartPng, pageWidth);
  }
  renderReadingsTable(doc, report);
  renderIncidentsTable(doc, report);
  renderFooter(doc, report, generatedAt, pageWidth);

  return doc;
}

function renderHeader(doc: jsPDF, report: ReportData, pageWidth: number): void {
  doc.setFillColor(46, 125, 107);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('TempMonitor — Reporte', 14, 12);
  doc.setFontSize(11);
  doc.text(report.organization.name, 14, 18);

  doc.setTextColor(28, 43, 53);
  doc.setFontSize(10);
  doc.text(`Período: ${report.rangeLabel}`, 14, 30);
  doc.text(`Generado: ${new Date(report.generatedAt).toLocaleString('es-CL')}`, 14, 35);

  if (report.location?.name) {
    doc.text(`Sede: ${report.location.name}`, 14, 40);
  }
}

function renderComplianceBlock(doc: jsPDF, report: ReportData, pageWidth: number): void {
  doc.setFontSize(12);
  doc.setTextColor(28, 43, 53);
  doc.text('Cumplimiento', 14, 52);

  doc.setFontSize(20);
  const pct = report.compliance.percent;
  doc.setTextColor(
    pct >= 90 ? 46 : pct >= 70 ? 217 : 232,
    pct >= 90 ? 125 : pct >= 70 ? 119 : 83,
    pct >= 90 ? 107 : pct >= 70 ? 6 : 58
  );
  doc.text(`${pct.toFixed(1)}%`, 14, 64);
  doc.setFontSize(10);
  doc.setTextColor(74, 96, 112);
  doc.text(
    `${report.compliance.inRangeReadings} de ${report.compliance.totalReadings} lecturas dentro del rango`,
    14,
    70
  );
  void pageWidth;
}

function renderChart(doc: jsPDF, png: string, pageWidth: number): void {
  const margin = 14;
  const maxWidth = pageWidth - margin * 2;
  const imgProps = doc.getImageProperties(png);
  const imgHeight = (imgProps.height / imgProps.width) * maxWidth;
  doc.addImage(png, 'PNG', margin, 78, maxWidth, imgHeight);
}

function renderReadingsTable(doc: jsPDF, report: ReportData): void {
  doc.setTextColor(28, 43, 53);
  doc.setFontSize(12);
  doc.text('Lecturas del período', 14, 180);

  autoTable(doc, {
    startY: 184,
    head: [['Fecha', 'Equipo', 'Temp.', 'Rango snapshot', 'Estado', 'Operario']],
    body: report.readings
      .slice(0, 200)
      .map((r) => [
        new Date(r.recorded_at).toLocaleString('es-CL'),
        r.equipment_id.slice(0, 8),
        `${r.value}°C`,
        r.snapshot_min_temp !== null && r.snapshot_max_temp !== null
          ? `${r.snapshot_min_temp}°C a ${r.snapshot_max_temp}°C`
          : '—',
        r.reading_type === 'iot' ? 'IoT' : 'Manual',
        r.taken_by ?? r.recorded_by_profile?.slice(0, 8) ?? '—',
      ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [46, 125, 107] },
  });
}

function renderIncidentsTable(doc: jsPDF, report: ReportData): void {
  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 200;
  if (finalY > 240) {
    doc.addPage();
  }
  doc.setFontSize(12);
  doc.setTextColor(28, 43, 53);
  doc.text(
    `Incidentes del período (${report.incidentSummary.resolved} resueltos, ${report.incidentSummary.open} abiertos)`,
    14,
    finalY + 10
  );

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Fecha', 'Descripción', 'Estado', 'Acción correctiva']],
    body: report.incidents.map((inc) => [
      new Date(inc.created_at).toLocaleString('es-CL'),
      inc.description.slice(0, 60),
      inc.status === 'resolved' ? 'Resuelto' : 'Abierto',
      inc.action_taken?.slice(0, 40) ?? '—',
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [46, 125, 107] },
  });
}

function renderFooter(doc: jsPDF, report: ReportData, generatedAt: Date, pageWidth: number): void {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(9);
  doc.setTextColor(74, 96, 112);
  doc.text('Rangos térmicos vigentes al momento de la lectura (snapshot)', 14, pageHeight - 28);

  autoTable(doc, {
    startY: pageHeight - 24,
    head: [['Equipo', 'Mínimo', 'Máximo']],
    body: report.equipmentList.map((e) => [e.name, `${e.min_temp}°C`, `${e.max_temp}°C`]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [168, 221, 212], textColor: [28, 43, 53] },
    margin: { left: 14, right: 14 },
    tableWidth: pageWidth - 28,
  });

  doc.setFontSize(7);
  doc.setTextColor(139, 163, 176);
  doc.text(`Reporte generado el ${generatedAt.toISOString()} — TempMonitor V1`, 14, pageHeight - 4);
}

export async function exportReportPdf(
  chartNode: HTMLElement | null,
  exporter: PngExporter,
  options: GeneratePdfOptions
): Promise<{ blob: Blob; filename: string }> {
  let chartPng: string | null = null;
  if (chartNode) {
    try {
      chartPng = await exporter(chartNode);
    } catch {
      chartPng = null;
    }
  }
  const doc = generatePdf({ ...options, chartPng });
  const filename = `reporte-${options.report.filters.from.slice(0, 10)}-${options.report.filters.to.slice(0, 10)}.pdf`;
  const blob = doc.output('blob');
  return { blob, filename };
}
