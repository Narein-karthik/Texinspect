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

export function compressEvidenceImage(
  file: File,
  {
    maxWidth = 1200,
    quality = 0.82,
  }: {
    maxWidth?: number;
    quality?: number;
  } = {}
) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(reader.error);
    reader.onloadend = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Unable to read evidence image'));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) {
          reject(new Error('Unable to prepare evidence image'));
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.filter = 'brightness(1.12) contrast(1.06)';
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL('image/jpeg', quality));
      };

      image.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
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
