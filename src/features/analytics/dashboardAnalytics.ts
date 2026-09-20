import type { Inspection } from '../../types';

export function getAdminDashboardData(inspections: Inspection[]) {
  const completedReports = inspections.filter((inspection) => inspection.status !== 'DRAFT');
  const inspectorMap = inspections.reduce((acc, inspection) => {
    const inspector = acc.get(inspection.inspectorId) || {
      id: inspection.inspectorId,
      name: inspection.inspectorName || 'Unknown Inspector',
      reportCount: 0,
      customerCount: new Set<string>(),
      styles: new Set<string>(),
    };

    inspector.reportCount += 1;
    inspector.customerCount.add(inspection.customerName || 'Unknown Customer');
    if (inspection.styleRef) inspector.styles.add(inspection.styleRef);
    acc.set(inspection.inspectorId, inspector);
    return acc;
  }, new Map<string, {
    id: string;
    name: string;
    reportCount: number;
    customerCount: Set<string>;
    styles: Set<string>;
  }>());

  const inspectors = Array.from(inspectorMap.values())
    .sort((a, b) => b.reportCount - a.reportCount);

  const recentReports = [...inspections]
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
    .slice(0, 8);

  return { completedReports, inspectors, recentReports };
}
