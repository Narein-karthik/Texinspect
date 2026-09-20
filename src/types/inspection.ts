import type { SyncStatus } from './store';

export type FabricType = 'Woven' | 'Knitted' | 'Non-Woven';

export interface FabricConstruction {
  warpCount?: string;
  weftCount?: string;
  reed?: string;
  pick?: string;
  count1?: string;
  count2?: string;
  count3?: string;
  structure?: string;
  gsm?: number;
  width?: string;
  additionalData?: string;
}

export interface QuantitySummary {
  uom?: 'Meters' | 'Kgs' | 'Pcs' | 'Others';
  customUom?: string;
  orderedQty?: number;
  producedQty?: number;
  offeredQty?: number;
  inspectedQty?: number;
  acceptedQty?: number;
  rejectedQty?: number;
  orderedRolls?: number;
  producedRolls?: number;
  offeredRolls?: number;
  inspectedRolls?: number;
  acceptedRolls?: number;
  rejectedRolls?: number;
  rejectedFourPointQty?: number;
  rejectedOtherQty?: number;
  rejectedFourPointRolls?: number;
  rejectedOtherRolls?: number;
  defectiveLinearMeters?: number;
  otherRejectedMeters?: number;
  rollLengthDiscrepancyMeters?: number;
  replacementFabricMeters?: number;
  estimatedReplacementMeters?: number;
}

export type DetailedResultStatus = 'Pass' | 'Fail' | 'N/A';

export interface DetailedResultItem {
  result?: DetailedResultStatus;
  remarks?: string;
}

export type DetailedResults = Record<string, DetailedResultItem>;

export type DefectType =
  | "Abrasion mark"
  | "Dyeing / Knitting / Weaving Barre"
  | "Crease / Pleat mark"
  | "Dye stains"
  | "Embroidery Broken"
  | "Embroidery placement"
  | "Embroidery wrong pattern"
  | "Filling bar / weaving bar"
  | "Hole"
  | "Irregular Weaving / Knitting"
  | "Jacquard"
  | "Joint piece / splice"
  | "Knot"
  | "Loose warp / weft"
  | "Mending mark"
  | "Neps / slub"
  | "Oil stain"
  | "Pen mark"
  | "Printing stain"
  | "Dirty stain"
  | "Water mark"
  | "Printing missing"
  | "Printing tilted"
  | "Printing wrong"
  | "Printing uneven"
  | "Selvage wavy"
  | "Selvage broken"
  | "Selvage tight"
  | "Selvage slack"
  | "Uneven dye"
  | "Yarn foreign / color"
  | "Yarn pulled"
  | "Yarn missing"
  | "Coarse yarn"
  | "Double Yarn"
  | "Other";

export interface Defect {
  id: string;
  meterLocation: number;
  type: DefectType;
  severity: 1 | 2 | 3 | 4;
  comment?: string;
  photoUrl?: string; // base64 for offline storage
  timestamp: string;
}

export interface Roll {
  id: string;
  rollNumber: string;
  lengthYards: number;
  widthInches: number;
  weightKg?: number;
  shade?: string;
  defects: Defect[];
  status: "PENDING" | "COMPLETED";
  comments?: string;
  startTime?: string;
  endTime?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
}

export interface Inspection {
  id: string;
  version: number;
  certificateRef?: string;
  referenceNumber?: string;
  customerName: string;
  supplierName?: string;
  orderNumber: string;
  styleRef: string;
  fabricType: string;
  fabricConstruction?: FabricConstruction;
  representativeFabricImageUrl?: string;
  quantitySummary?: QuantitySummary;
  detailedResults?: DetailedResults;
  color: string;
  gsm: number;
  composition: string;
  season?: string;
  dyeLot?: string;
  inspectorId: string;
  inspectorName: string;
  inspectionDate: string;
  rolls: Roll[];
  status: "DRAFT" | "COMPLETED" | "SYNCED";
  syncStatus: SyncStatus;
  totalPoints: number;
  pointsPer100Yds: number;
  isPass: boolean;
  verdictOverride?: boolean;
  logs: ActivityLog[];
}
