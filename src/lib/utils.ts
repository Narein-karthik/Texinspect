import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * ASTM D5430 4-Point System Calculation
 * Formula: (Total Points * 3600) / (Length in Yards * Width in Inches)
 */
export function calculateFourPointStats(
  totalPoints: number,
  lengthYards: number,
  widthInches: number
) {
  if (lengthYards <= 0 || widthInches <= 0) return 0;
  const pointsPer100SqYds = (totalPoints * 3600) / (lengthYards * widthInches);
  return Number(pointsPer100SqYds.toFixed(2));
}

export function getPassFailStatus(points: number, threshold: number = 40) {
  return points <= threshold ? "PASS" : "FAIL";
}
