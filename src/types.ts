export type SyncStatus = 'LOCAL_ONLY' | 'PENDING_SYNC' | 'SYNCED' | 'ERROR';
export type UserRole = 'INSPECTOR' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  factoryId: string;
}

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
  customerName: string;
  orderNumber: string;
  styleRef: string;
  fabricType: string;
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

export interface SyncQueueItem {
  id: string;
  entityId: string;
  entityType: 'INSPECTION';
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  timestamp: string;
  retryCount: number;
}

export interface InspectionStore {
  inspections: Inspection[];
  syncQueue: SyncQueueItem[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  setInspections: (inspections: Inspection[]) => void;
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
}
