import type { Roll } from '../../types';
import { calculateFourPointStats } from '../../utils/inspectionCalculations';

// Inspection logging uses the first roll width; report editing uses weighted width.
export function calculateInspectionRollStats(updatedRolls: Roll[]) {
  const totalPoints = updatedRolls.reduce(
    (sum, r) =>
      sum + r.defects.reduce((dSum, d) => dSum + d.severity, 0),
    0
  );
  const totalLength = updatedRolls.reduce(
    (sum, r) => sum + r.lengthYards,
    0
  );
  const avgWidth =
    updatedRolls.length > 0 ? updatedRolls[0].widthInches : 0;
  const pointsPer100 = calculateFourPointStats(
    totalPoints,
    totalLength,
    avgWidth
  );

  return { totalPoints, pointsPer100 };
}
