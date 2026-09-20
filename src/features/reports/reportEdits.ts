import { Inspection } from '../../types';
import { generateCertificateRef } from '../../utils/certificate';
import { getDefaultFabricConstruction } from '../../utils/fabricConstruction';
import { calculateFourPointStats, getPassFailStatus } from '../../utils/inspectionCalculations';

export function buildReportEdits(editDraft: Inspection, inspection: Inspection): Partial<Inspection> {
  const totalPoints = editDraft.rolls.reduce(
    (sum, roll) =>
      sum + roll.defects.reduce((defectSum, defect) => defectSum + defect.severity, 0),
    0
  );
  const editedTotalLength = editDraft.rolls.reduce(
    (sum, roll) => sum + roll.lengthYards,
    0
  );
  const weightedWidth = editedTotalLength > 0
    ? editDraft.rolls.reduce(
      (sum, roll) => sum + (roll.lengthYards * roll.widthInches),
      0
    ) / editedTotalLength
    : 0;
  const pointsPer100 = calculateFourPointStats(
    totalPoints,
    editedTotalLength,
    weightedWidth
  );

  return {
    certificateRef: generateCertificateRef(
      editDraft.customerName,
      editDraft.supplierName,
      editDraft.inspectionDate
    ),
    customerName: editDraft.customerName.trim(),
    supplierName: editDraft.supplierName?.trim(),
    orderNumber: editDraft.orderNumber.trim(),
    styleRef: editDraft.styleRef.trim(),
    referenceNumber: editDraft.referenceNumber?.trim(),
    fabricType: editDraft.fabricType.trim(),
    fabricConstruction: getDefaultFabricConstruction(
      editDraft.fabricType,
      editDraft.fabricConstruction
    ),
    representativeFabricImageUrl: editDraft.representativeFabricImageUrl,
    quantitySummary: editDraft.quantitySummary,
    detailedResults: editDraft.detailedResults,
    color: editDraft.color.trim(),
    gsm: editDraft.gsm,
    composition: editDraft.composition.trim(),
    season: editDraft.season?.trim(),
    dyeLot: editDraft.dyeLot?.trim(),
    rolls: editDraft.rolls,
    totalPoints,
    pointsPer100Yds: pointsPer100,
    isPass: inspection.verdictOverride
      ? inspection.isPass
      : getPassFailStatus(pointsPer100) === 'PASS',
    version: (inspection.version || 1) + 1,
  };
}
