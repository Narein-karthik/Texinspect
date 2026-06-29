import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FabricConstruction } from "../types";

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

function firstThreeClean(value?: string) {
  const cleaned = (value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return cleaned.slice(0, 3).padEnd(3, 'X');
}

function formatDateRef(dateValue?: string) {
  const date = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(date.getTime())) {
    return formatDateRef(new Date().toISOString());
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}

export function generateCertificateRef(
  customerName?: string,
  supplierName?: string,
  inspectionDate?: string
) {
  return `${firstThreeClean(customerName)}${firstThreeClean(supplierName)}${formatDateRef(inspectionDate)}`;
}

export function getCertificateRef(inspection: {
  certificateRef?: string;
  customerName?: string;
  supplierName?: string;
  inspectionDate?: string;
}) {
  return inspection.certificateRef ||
    generateCertificateRef(
      inspection.customerName,
      inspection.supplierName,
      inspection.inspectionDate
    );
}

export function getDefaultFabricConstruction(
  fabricType?: string,
  existing: FabricConstruction = {}
): FabricConstruction {
  const base = {
    gsm: existing.gsm ?? 0,
    width: existing.width ?? '',
    additionalData: existing.additionalData ?? '',
  };

  if (fabricType === 'Woven') {
    return {
      warpCount: existing.warpCount ?? '',
      weftCount: existing.weftCount ?? '',
      reed: existing.reed ?? '',
      pick: existing.pick ?? '',
      structure: existing.structure ?? '',
      ...base,
    };
  }

  if (fabricType === 'Knitted') {
    return {
      count1: existing.count1 ?? '',
      count2: existing.count2 ?? '',
      count3: existing.count3 ?? '',
      structure: existing.structure ?? '',
      ...base,
    };
  }

  if (fabricType === 'Non-Woven') {
    return base;
  }

  return existing;
}
