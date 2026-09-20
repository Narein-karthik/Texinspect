import { constructionFieldsByType } from '../../constants/fabric';
import { DETAILED_RESULT_CHECKPOINTS } from '../../constants/inspection';
import { Inspection } from '../../types';
import { getCertificateRef } from '../../utils/certificate';
import { getDefaultFabricConstruction } from '../../utils/fabricConstruction';

export function buildReportData(inspection: Inspection) {
  const totalLength = inspection.rolls.reduce((s, r) => s + r.lengthYards, 0);
  const certificateRef = getCertificateRef(inspection);
  const fabricConstruction = getDefaultFabricConstruction(
    inspection.fabricType,
    inspection.fabricConstruction || {
      gsm: inspection.gsm,
      width: '',
      additionalData: '',
    }
  );
  const visibleConstructionFields = constructionFieldsByType[inspection.fabricType] || [];
  const representativeImage = inspection.representativeFabricImageUrl?.trim();
  const quantitySummary = inspection.quantitySummary || {};
  const quantityUom = quantitySummary.uom === 'Others'
    ? quantitySummary.customUom?.trim() || 'Others'
    : quantitySummary.uom || 'Meters';
  const formatQty = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString()
      : 'N/A';
  const formatNumber = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString()
      : 'N/A';
  const formatPct = (value?: number, total?: number) =>
    typeof value === 'number' &&
      typeof total === 'number' &&
      total > 0
      ? `${((value / total) * 100).toFixed(1)}%`
      : 'N/A';
  const getQtyValue = (value?: number, fallback?: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const inspectedRolls = getQtyValue(quantitySummary.inspectedRolls, inspection.rolls.length);
  const acceptedRolls = getQtyValue(
    quantitySummary.acceptedRolls,
    inspection.isPass ? inspectedRolls : undefined
  );
  const rejectedRolls = getQtyValue(
    quantitySummary.rejectedRolls,
    !inspection.isPass ? inspectedRolls : undefined
  );
  const rejectedFourPointQty = getQtyValue(
    quantitySummary.rejectedFourPointQty,
    quantitySummary.rejectedQty
  );
  const rejectedOtherQty = getQtyValue(quantitySummary.rejectedOtherQty, 0);
  const totalRejectedQty = getQtyValue(
    quantitySummary.rejectedQty,
    (rejectedFourPointQty || 0) + (rejectedOtherQty || 0)
  );
  const defectiveLinearMeters = getQtyValue(
    quantitySummary.defectiveLinearMeters,
    inspection.rolls.reduce(
      (sum, roll) => sum + new Set(roll.defects.map((defect) => Math.floor(defect.meterLocation))).size,
      0
    )
  );
  const replacementFabricMeters = getQtyValue(
    quantitySummary.replacementFabricMeters,
    defectiveLinearMeters
  );
  const estimatedReplacementMeters = getQtyValue(
    quantitySummary.estimatedReplacementMeters,
    replacementFabricMeters
  );
  const reportInfoItems = [
    { label: 'Report Number', value: certificateRef },
    { label: 'Customer Name', value: inspection.customerName },
    { label: 'Order Number', value: inspection.orderNumber },
    { label: 'Style', value: inspection.styleRef || 'N/A' },
    { label: 'Reference Number', value: inspection.referenceNumber || certificateRef },
    { label: 'Colour', value: inspection.color || 'N/A' },
    { label: 'Composition', value: inspection.composition || 'N/A' },
    { label: 'Season', value: inspection.season || 'N/A' },
  ];
  const standardsItems = [
    { label: 'Sampling Level', value: 'As per buyer / factory requirement' },
    { label: 'Inspection System Tolerance', value: '4 Point System' },
    { label: 'Acceptance Criteria', value: 'Accepted at 40 points or below per 100 sq meters' },
  ];
  const quantityItems = [
    { label: `Ordered Qty (${quantityUom})`, value: formatQty(quantitySummary.orderedQty), percent: '', rolls: 'N/A' },
    { label: `Produced Qty (${quantityUom})`, value: formatQty(quantitySummary.producedQty), percent: formatPct(quantitySummary.producedQty, quantitySummary.orderedQty), rolls: formatNumber(quantitySummary.producedRolls) },
    { label: `Presented Qty (${quantityUom})`, value: formatQty(quantitySummary.offeredQty), percent: formatPct(quantitySummary.offeredQty, quantitySummary.orderedQty), rolls: formatNumber(quantitySummary.offeredRolls) },
    { label: `Inspected Qty (${quantityUom})`, value: formatQty(quantitySummary.inspectedQty), percent: formatPct(quantitySummary.inspectedQty, quantitySummary.offeredQty), rolls: formatNumber(inspectedRolls) },
    { label: `Accepted Qty (${quantityUom})`, value: formatQty(quantitySummary.acceptedQty), percent: formatPct(quantitySummary.acceptedQty, quantitySummary.inspectedQty), rolls: formatNumber(acceptedRolls) },
  ];
  const inspectedPercent = formatPct(quantitySummary.inspectedQty, quantitySummary.offeredQty);
  const rejectedPercent = formatPct(totalRejectedQty, quantitySummary.inspectedQty);
  const summaryRows = [
    {
      key: inspection.color || 'color',
      color: inspection.color || 'N/A',
      orderedQty: formatQty(quantitySummary.orderedQty),
      producedQty: formatQty(quantitySummary.producedQty),
      offeredQty: formatQty(quantitySummary.offeredQty),
      inspectedQty: formatQty(quantitySummary.inspectedQty),
      inspectedPercent,
      rejectedQty: formatQty(totalRejectedQty),
      rejectedPercent,
      demeritPoints: inspection.totalPoints.toLocaleString(),
      customerTolerance: '40',
      rating: inspection.isPass ? 'Accepted' : 'Rejected',
      rejectedFabricMeters: formatQty(totalRejectedQty),
    },
  ];
  const quantityDetailItems = [
    {
      label: 'Qty Rejected - 4 Point System',
      quantity: formatQty(rejectedFourPointQty),
      percentage: formatPct(rejectedFourPointQty, quantitySummary.inspectedQty),
      rolls: formatNumber(quantitySummary.rejectedFourPointRolls),
    },
    {
      label: 'Qty Rejected - Other',
      quantity: formatQty(rejectedOtherQty),
      percentage: formatPct(rejectedOtherQty, quantitySummary.inspectedQty),
      rolls: formatNumber(quantitySummary.rejectedOtherRolls),
    },
    {
      label: 'Total Rejected Qty',
      quantity: formatQty(totalRejectedQty),
      percentage: rejectedPercent,
      rolls: formatNumber(rejectedRolls),
    },
  ];
  const quantityNotes = [
    {
      label: 'No. of linear meters of fabric having defects more than 1 point',
      value: `${formatQty(defectiveLinearMeters)} meters`,
    },
    {
      label: 'No. of meters of fabric rejected for other reasons',
      value: `${formatQty(quantitySummary.otherRejectedMeters)} meters`,
    },
    {
      label: 'Roll length discrepancies versus packing list',
      value: `${formatQty(quantitySummary.rollLengthDiscrepancyMeters)} meters`,
    },
    {
      label: 'Replacement of fabric quantity required for inspected qty',
      value: `${formatQty(replacementFabricMeters)} meters`,
    },
    {
      label: 'Total estimated fabric replacement required for presented qty',
      value: typeof estimatedReplacementMeters === 'number'
        ? `${formatQty(estimatedReplacementMeters)} meters`
        : 'To be confirmed by customer',
    },
  ];
  const detailedResults = DETAILED_RESULT_CHECKPOINTS.map((checkpoint) => ({
    checkpoint,
    result: inspection.detailedResults?.[checkpoint]?.result || 'N/A',
    remarks: inspection.detailedResults?.[checkpoint]?.remarks || '',
  }));
  return {
    totalLength,
    certificateRef,
    fabricConstruction,
    visibleConstructionFields,
    representativeImage,
    quantitySummary,
    quantityUom,
    formatQty,
    formatNumber,
    formatPct,
    getQtyValue,
    inspectedRolls,
    acceptedRolls,
    rejectedRolls,
    rejectedFourPointQty,
    rejectedOtherQty,
    totalRejectedQty,
    defectiveLinearMeters,
    replacementFabricMeters,
    estimatedReplacementMeters,
    reportInfoItems,
    standardsItems,
    quantityItems,
    inspectedPercent,
    rejectedPercent,
    summaryRows,
    quantityDetailItems,
    quantityNotes,
    detailedResults
  };
}

export type ReportData = ReturnType<typeof buildReportData>;
