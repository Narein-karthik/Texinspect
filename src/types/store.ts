import type { User } from './auth';
import type { Inspection } from './inspection';
export type SyncStatus = 'LOCAL_ONLY' | 'PENDING_SYNC' | 'SYNCED' | 'ERROR';

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
  photoEvidenceEnabled: boolean;
  setCurrentUser: (user: User | null) => void;
  setInspections: (inspections: Inspection[]) => void;
  setPhotoEvidenceEnabled: (enabled: boolean) => void;
  addInspection: (inspection: Inspection) => void;
  updateInspection: (id: string, updates: Partial<Inspection>) => void;
  deleteInspection: (id: string) => Promise<void>;
  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
}
