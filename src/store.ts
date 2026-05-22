import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Inspection, InspectionStore, User } from './types';
import { inspectionService } from './services/inspectionService';

// Custom storage for idb-keyval to handle persistence in IndexedDB
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useStore = create<InspectionStore>()(
  persist(
    (set, getStore) => ({
      inspections: [],
      syncQueue: [],
      currentUser: null,
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      setInspections: (inspections: Inspection[]) => set({ inspections }),
      addInspection: async (inspection) => {
        set((state) => ({ 
          inspections: [inspection, ...state.inspections] 
        }));
        
        // Try to sync to Firebase if online
        if (navigator.onLine) {
          try {
            await inspectionService.saveInspection(inspection);
            set((state) => ({
              inspections: state.inspections.map(i => i.id === inspection.id ? { ...i, syncStatus: 'SYNCED' } : i)
            }));
          } catch (error) {
            console.error("Sync failed, item in queue", error);
          }
        }
      },
      updateInspection: async (id, updates) => {
        set((state) => ({
          inspections: state.inspections.map((i) =>
            i.id === id ? { ...i, ...updates } : i
          ),
        }));

        const updated = getStore().inspections.find(i => i.id === id);
        if (updated && navigator.onLine) {
          try {
            await inspectionService.saveInspection(updated);
          } catch (error) {
            console.error("Update sync failed", error);
          }
        }
      },
      deleteInspection: (id) =>
        set((state) => ({
          inspections: state.inspections.filter((i) => i.id !== id),
        })),
      addToSyncQueue: (item) =>
        set((state) => ({
          syncQueue: [...state.syncQueue, item]
        })),
      removeFromSyncQueue: (id) =>
        set((state) => ({
          syncQueue: state.syncQueue.filter((q) => q.id !== id)
        })),
    }),
    {
      name: 'tex-inspect-storage',
      storage: createJSONStorage(() => storage as any),
    }
  )
);
