

/**
 * 4-Point System Calculation using metric length.
 * Formula: (Total Points * 100) / (Length in Meters * Width in Meters)
 */
export function calculateFourPointStats(
  totalPoints: number,
  lengthMeters: number,
  widthInches: number
) {
  const widthMeters = widthInches * 0.0254;
  if (lengthMeters <= 0 || widthMeters <= 0) return 0;
  const pointsPer100SqMeters = (totalPoints * 100) / (lengthMeters * widthMeters);
  return Number(pointsPer100SqMeters.toFixed(2));
}

export function getPassFailStatus(points: number, threshold: number = 40) {
  return points <= threshold ? "PASS" : "FAIL";
}

function roundToTwo(value: number) {
  return Number(value.toFixed(2));
}

export function calculateRollWeightKg(
  gsm: number,
  widthInches: number,
  lengthMeters: number
) {
  const widthMeters = widthInches * 0.0254;
  if (gsm <= 0 || widthMeters <= 0 || lengthMeters <= 0) return undefined;
  return roundToTwo((gsm * widthMeters * lengthMeters) / 1000);
}

export function calculateRollLengthMeters(
  gsm: number,
  widthInches: number,
  weightKg: number
) {
  const widthMeters = widthInches * 0.0254;
  if (gsm <= 0 || widthMeters <= 0 || weightKg <= 0) return undefined;
  return roundToTwo((weightKg * 1000) / (gsm * widthMeters));
}
