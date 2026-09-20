import assert from 'node:assert/strict';
import test from 'node:test';
import { getAdminDashboardData } from '../src/features/analytics/dashboardAnalytics';
import { getReportAnalytics } from '../src/features/analytics/reportAnalytics';
import { calculateInspectionRollStats } from '../src/features/inspections/inspectionCalculations';
import { buildReportData } from '../src/features/reports/reportData';
import { buildReportEdits } from '../src/features/reports/reportEdits';
import { generateCertificateRef, getCertificateRef } from '../src/utils/certificate';
import { getDefaultFabricConstruction } from '../src/utils/fabricConstruction';
import { calculateFourPointStats, calculateRollLengthMeters, calculateRollWeightKg, getPassFailStatus } from '../src/utils/inspectionCalculations';
import { inspectionFixture } from './inspectionFixture';

test('certificate generation and stored references remain backward compatible', () => {
  assert.equal(generateCertificateRef('Global Apparel', 'Ultimate Exports', '2026-06-16T12:00:00'), 'GLOULT16062026');
  assert.equal(generateCertificateRef(' G! l@ o ', ' U#l t ', '2026-06-16T12:00:00'), 'GLOULT16062026');
  assert.equal(getCertificateRef(inspectionFixture({ certificateRef: 'LEGACY-REF' })), 'LEGACY-REF');
  assert.equal(generateCertificateRef('', 'A', '2026-06-16T12:00:00'), 'XXXAXX16062026');
});

test('metric calculations retain thresholds, rounding, and invalid-input behavior', () => {
  assert.equal(calculateFourPointStats(40, 100, 40), 39.37);
  assert.equal(calculateFourPointStats(40, 0, 40), 0);
  assert.equal(calculateFourPointStats(40, 100, 0), 0);
  assert.equal(getPassFailStatus(40), 'PASS');
  assert.equal(getPassFailStatus(40.01), 'FAIL');
  assert.equal(calculateRollWeightKg(150, 40, 100), 15.24);
  assert.equal(calculateRollLengthMeters(150, 40, 15.24), 100);
  assert.equal(calculateRollLengthMeters(0, 40, 15.24), undefined);
  assert.equal(calculateRollWeightKg(150, 0, 100), undefined);
});

test('logging and report editing preserve their distinct existing width formulas', () => {
  const inspection = inspectionFixture();
  const before = structuredClone(inspection);
  const logged = calculateInspectionRollStats(inspection.rolls);
  assert.equal(logged.totalPoints, 8);
  assert.equal(logged.pointsPer100, calculateFourPointStats(8, 150, 40));
  const edited = buildReportEdits(inspection, inspection);
  assert.equal(edited.pointsPer100Yds, calculateFourPointStats(8, 150, (100 * 40 + 50 * 60) / 150));
  assert.notEqual(edited.pointsPer100Yds, logged.pointsPer100);
  assert.equal(edited.version, 3);
  assert.equal(edited.certificateRef, 'GLOULT16062026');
  assert.equal('pointsPer100Meters' in edited, false);
  assert.deepEqual(inspection, before);
});

test('report edits preserve manual verdicts, nested fields, and zero-roll reports', () => {
  const inspection = inspectionFixture({ isPass: false, verdictOverride: true });
  const draft = inspectionFixture({ customerName: ' Global Apparel ', quantitySummary: { uom: 'Others', customUom: 'Bundles', acceptedQty: 0 } });
  const edited = buildReportEdits(draft, inspection);
  assert.equal(edited.isPass, false);
  assert.equal(edited.customerName, 'Global Apparel');
  assert.deepEqual(edited.quantitySummary, draft.quantitySummary);
  assert.deepEqual(edited.rolls, draft.rolls);
  const empty = inspectionFixture({ rolls: [] });
  assert.equal(buildReportEdits(empty, empty).pointsPer100Yds, 0);
  assert.equal(buildReportEdits(empty, empty).isPass, true);
});

test('fabric defaults retain dynamic fields and legacy data without mutation', () => {
  const woven = getDefaultFabricConstruction('Woven', { gsm: 150, warpCount: '40' });
  assert.equal(woven.warpCount, '40');
  assert.equal(woven.weftCount, '');
  assert.equal(woven.gsm, 150);
  const knitted = getDefaultFabricConstruction('Knitted', woven);
  assert.equal(knitted.count1, '');
  assert.equal('warpCount' in knitted, false);
  assert.deepEqual(getDefaultFabricConstruction('Non-Woven'), { gsm: 0, width: '', additionalData: '' });
  assert.deepEqual(getDefaultFabricConstruction('Legacy', woven), woven);
});

test('quantity percentages retain their original denominators and missing-value defaults', () => {
  const data = buildReportData(inspectionFixture({ quantitySummary: {
    uom: 'Others', customUom: ' Bundles ', orderedQty: 1000, producedQty: 900,
    offeredQty: 800, inspectedQty: 200, acceptedQty: 180, rejectedFourPointQty: 15, rejectedOtherQty: 5,
  } }));
  assert.equal(data.quantityUom, 'Bundles');
  assert.equal(data.quantityItems.find(item => item.label.startsWith('Produced')).percent, '90.0%');
  assert.equal(data.inspectedPercent, '25.0%');
  assert.equal(data.rejectedPercent, '10.0%');
  assert.equal(data.totalRejectedQty, 20);
  assert.equal(data.quantityItems.find(item => item.label.startsWith('Accepted')).percent, '90.0%');
  const legacy = buildReportData(inspectionFixture());
  assert.equal(legacy.quantityUom, 'Meters');
  assert.equal(legacy.inspectedPercent, 'N/A');
  assert.equal(legacy.quantityItems[0].value, 'N/A');
  assert.equal(legacy.fabricConstruction.gsm, 150);
  assert.equal(legacy.detailedResults.length, 10);
  assert.ok(legacy.detailedResults.every(item => item.result === 'N/A'));
  const zero = buildReportData(inspectionFixture({ quantitySummary: { inspectedQty: 0, rejectedQty: 0, acceptedRolls: 0 } }));
  assert.equal(zero.rejectedPercent, 'N/A');
  assert.equal(zero.quantityItems.find(item => item.label.startsWith('Accepted')).rolls, '0');
});

test('analytics preserve severity buckets, ordering, distinct meters and admin counts', () => {
  const inspection = inspectionFixture();
  const analytics = getReportAnalytics(inspection);
  assert.deepEqual([analytics.critical, analytics.major, analytics.minor, analytics.total], [1, 1, 1, 3]);
  assert.deepEqual(analytics.defectTrendData.map(item => item.location), [2.1, 2.9, 10]);
  assert.deepEqual(analytics.defectTypeBreakdown, [{ type: 'Knot', count: 2, points: 4 }, { type: 'Hole', count: 1, points: 4 }]);
  assert.equal(buildReportData(inspection).defectiveLinearMeters, 2);
  const dashboard = getAdminDashboardData([inspection, inspectionFixture({ id: 'second', status: 'DRAFT' })]);
  assert.equal(dashboard.inspectors.length, 1);
  assert.equal(dashboard.inspectors[0].reportCount, 2);
  assert.equal(dashboard.inspectors[0].customerCount.size, 1);
  assert.equal(dashboard.completedReports.length, 1);
});
