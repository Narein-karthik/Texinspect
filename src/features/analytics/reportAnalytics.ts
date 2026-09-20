import type { Inspection } from '../../types';

export function getReportAnalytics(inspection: Inspection) {
  const allDefects = inspection.rolls.flatMap(r => r.defects);
  const critical = allDefects.filter(d => d.severity >= 4).length;
  const major = allDefects.filter(d => d.severity === 3).length;
  const minor = allDefects.filter(d => d.severity <= 2 && d.severity >= 1).length;
  const total = allDefects.length;

  const defectTrendData = inspection.rolls.flatMap((roll) =>
    roll.defects.map((d) => ({
      location: d.meterLocation,
      severity: d.severity,
      roll: roll.rollNumber
    }))
  ).sort((a, b) => a.location - b.location);
  const defectTypeBreakdown = Object.values(
    allDefects.reduce<Record<string, { type: string; count: number; points: number }>>(
      (acc, defect) => {
        const type = defect.type || 'Other';
        acc[type] = acc[type] || { type, count: 0, points: 0 };
        acc[type].count += 1;
        acc[type].points += defect.severity;
        return acc;
      },
      {}
    )
  ).sort((a, b) => b.points - a.points || b.count - a.count);

  const analytics = [
    { label: 'Critical', count: critical, color: 'text-red-600', bar: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { label: 'Major', count: major, color: 'text-orange-600', bar: 'bg-orange-400', bg: 'bg-orange-50', border: 'border-orange-100' },
    { label: 'Minor', count: minor, color: 'text-yellow-600', bar: 'bg-yellow-400', bg: 'bg-yellow-50', border: 'border-yellow-100' },
    { label: 'Total', count: total, color: 'text-gray-900', bar: 'bg-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' },
  ];

  return { allDefects, critical, major, minor, total, defectTrendData, defectTypeBreakdown, analytics };
}
