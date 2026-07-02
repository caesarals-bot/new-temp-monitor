import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePdf, exportReportPdf } from '@/features/reports/lib/pdfExport';
import type { ReportData } from '@/features/reports/types';
import type { IncidentWithReading } from '@/features/incidents/types';
import type { TemperatureReading } from '@/shared/types/supabase';

const mockDoc = {
  internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
  setFillColor: vi.fn().mockReturnThis(),
  rect: vi.fn().mockReturnThis(),
  setTextColor: vi.fn().mockReturnThis(),
  setFontSize: vi.fn().mockReturnThis(),
  text: vi.fn().mockReturnThis(),
  addImage: vi.fn().mockReturnThis(),
  addPage: vi.fn().mockReturnThis(),
  getImageProperties: vi.fn().mockReturnValue({ width: 100, height: 50 }),
  output: vi.fn().mockReturnValue('blob-data'),
  lastAutoTable: { finalY: 200 },
};

vi.mock('jspdf', () => {
  function JsPDF() {
    return mockDoc;
  }
  return { jsPDF: JsPDF };
});

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((_doc: unknown, _opts: { body?: unknown[] }) => {
    mockDoc.lastAutoTable = { finalY: 200 };
    return mockDoc;
  }),
}));

import autoTable from 'jspdf-autotable';

const sampleReading: TemperatureReading = {
  id: 'r-1',
  equipment_id: 'eq-1',
  value: 4.5,
  reading_type: 'manual',
  sensor_battery: null,
  sensor_signal: null,
  snapshot_min_temp: 2,
  snapshot_max_temp: 8,
  recorded_by_profile: 'u-1',
  recorded_by_staff: null,
  taken_by: null,
  recorded_at: '2026-06-15T10:00:00Z',
};

const sampleIncident: IncidentWithReading = {
  id: 'inc-1',
  reading_id: 'r-1',
  status: 'resolved',
  description: 'Temperatura fuera de rango',
  action_taken: 'Se reubicaron los productos',
  resolved_by: 'u-1',
  resolved_at: '2026-06-15T11:00:00Z',
  created_at: '2026-06-15T10:05:00Z',
  reading: {
    id: 'r-1',
    value: 12,
    recorded_at: '2026-06-15T10:00:00Z',
    equipment: {
      id: 'eq-1',
      name: 'Eq',
      min_temp: 2,
      max_temp: 8,
      location_id: 'loc-1',
    },
  },
};

const sampleReport: ReportData = {
  organization: { id: 'org-1', name: 'Empresa Demo', business_type: 'restaurant' },
  filters: {
    from: '2026-06-01T00:00:00Z',
    to: '2026-07-01T00:00:00Z',
    readingType: 'all',
    onlyWithIncidents: false,
  },
  generatedAt: '2026-07-02T08:00:00Z',
  rangeLabel: '2026-06-01 → 2026-07-01',
  location: null,
  equipmentList: [{ id: 'eq-1', name: 'Refrigerador Lácteos', min_temp: 2, max_temp: 8 }],
  selectedEquipment: null,
  readings: [sampleReading],
  incidents: [sampleIncident],
  compliance: {
    totalReadings: 10,
    inRangeReadings: 9,
    percent: 90,
    byEquipment: [],
  },
  incidentSummary: { total: 1, resolved: 1, open: 0 },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('pdfExport · generatePdf', () => {
  it('creates a jsPDF instance', () => {
    const doc = generatePdf({ report: sampleReport });
    expect(doc).toBeDefined();
  });

  it('renders header with org name and period', () => {
    generatePdf({ report: sampleReport });
    const textCalls = mockDoc.text.mock.calls.map((c) => c[0]);
    expect(textCalls).toContain('TempMonitor — Reporte');
    expect(textCalls).toContain('Empresa Demo');
    expect(textCalls).toContain('Período: 2026-06-01 → 2026-07-01');
  });

  it('renders compliance block with percentage', () => {
    generatePdf({ report: sampleReport });
    expect(autoTable).toHaveBeenCalled();
  });

  it('inserts chart image when chartPng provided', () => {
    const fakePng = 'data:image/png;base64,FAKE';
    generatePdf({ report: sampleReport, chartPng: fakePng });
    expect(mockDoc.addImage).toHaveBeenCalledWith(
      fakePng,
      'PNG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
  });

  it('skips chart image when chartPng is null', () => {
    generatePdf({ report: sampleReport, chartPng: null });
    expect(mockDoc.addImage).not.toHaveBeenCalled();
  });

  it('uses snapshot ranges in readings table, not current ones', () => {
    generatePdf({ report: sampleReport });
    const tableCall = (autoTable as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
      Array.isArray(call[1]?.body)
    );
    expect(tableCall).toBeDefined();
    const body = tableCall![1].body as string[][];
    const rangeCell = body.find((row) => row[3]?.includes('°C a'));
    expect(rangeCell).toBeDefined();
    expect(rangeCell![3]).toContain('2°C a 8°C');
  });

  it('limits readings table to 200 rows', () => {
    const manyReadings = Array.from({ length: 500 }, (_, i) => ({
      ...sampleReading,
      id: `r-${i}`,
    }));
    generatePdf({
      report: { ...sampleReport, readings: manyReadings },
    });
    const tableCall = (autoTable as ReturnType<typeof vi.fn>).mock.calls.find((call) =>
      Array.isArray(call[1]?.body)
    );
    expect((tableCall![1].body as unknown[]).length).toBe(200);
  });

  it('renders incidents table with status and action', () => {
    generatePdf({ report: sampleReport });
    expect(autoTable).toHaveBeenCalledTimes(3);
  });
});

describe('pdfExport · exportReportPdf', () => {
  it('exports a blob with filename from filter range', async () => {
    const exporter = vi.fn().mockResolvedValue('data:image/png;base64,FAKE');
    const { blob, filename } = await exportReportPdf(document.createElement('div'), exporter, {
      report: sampleReport,
    });
    expect(blob).toBeDefined();
    expect(filename).toBe('reporte-2026-06-01-2026-07-01.pdf');
    expect(exporter).toHaveBeenCalled();
  });

  it('handles chart export failure gracefully', async () => {
    const exporter = vi.fn().mockRejectedValue(new Error('chart failed'));
    const { blob, filename } = await exportReportPdf(document.createElement('div'), exporter, {
      report: sampleReport,
    });
    expect(blob).toBeDefined();
    expect(filename).toBeDefined();
  });

  it('skips exporter when chartNode is null', async () => {
    const exporter = vi.fn().mockResolvedValue('png');
    await exportReportPdf(null, exporter, { report: sampleReport });
    expect(exporter).not.toHaveBeenCalled();
  });
});
