import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
