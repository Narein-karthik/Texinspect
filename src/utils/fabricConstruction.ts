import type { FabricConstruction } from "../types";


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
