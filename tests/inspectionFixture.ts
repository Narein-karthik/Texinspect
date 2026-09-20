import type { Inspection } from '../src/types';

export function inspectionFixture(overrides: Partial<Inspection> = {}): Inspection {
  return {
    id: 'inspection-1',
    version: 2,
    customerName: 'Global Apparel',
    supplierName: 'Ultimate Exports',
    orderNumber: 'PO-1',
    styleRef: 'STYLE-1',
    fabricType: 'Woven',
    color: 'Blue',
    gsm: 150,
    composition: 'Cotton',
    inspectorId: 'inspector-1',
    inspectorName: 'Inspector',
    inspectionDate: '2026-06-16T12:00:00',
    rolls: [
      {
        id: 'roll-1', rollNumber: '1', lengthYards: 100, widthInches: 40, status: 'PENDING',
        defects: [
          { id: 'd1', type: 'Hole', severity: 4, meterLocation: 2.1, timestamp: '2026-06-16' },
          { id: 'd2', type: 'Knot', severity: 3, meterLocation: 2.9, timestamp: '2026-06-16' },
        ],
      },
      {
        id: 'roll-2', rollNumber: '2', lengthYards: 50, widthInches: 60, status: 'COMPLETED',
        defects: [{ id: 'd3', type: 'Knot', severity: 1, meterLocation: 10, timestamp: '2026-06-16' }],
      },
    ],
    status: 'COMPLETED',
    syncStatus: 'SYNCED',
    totalPoints: 8,
    pointsPer100Yds: 4.5,
    isPass: true,
    logs: [],
    ...overrides,
  };
}
