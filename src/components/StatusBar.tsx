import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Wifi, WifiOff, Cloud, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { inspectionService } from '../services/inspectionService';

export const StatusBar = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const inspections = useStore((state) => state.inspections);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const unsyncedInspections = inspections.filter(
    (i) => i.syncStatus !== 'SYNCED'
  );

  const handleManualSync = async () => {
    if (!isOnline || unsyncedInspections.length === 0) return;

    setIsSyncing(true);

    try {
      for (const inspection of unsyncedInspections) {
        await inspectionService.saveInspection(inspection);

        useStore
          .getState()
          .updateInspection(inspection.id, {
            syncStatus: 'SYNCED',
          });
      }
    } catch (error) {
      console.error('Manual sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const pendingCount = unsyncedInspections.length;

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="
        fixed top-2 left-1/2 -translate-x-1/2
        w-[92%] max-w-md
        h-14
        px-4
        bg-[#1B2236]/95
        backdrop-blur-xl
        rounded-2xl
        border border-white/5
        shadow-2xl
        flex items-center justify-between
        z-50
      "
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center',
            isOnline
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/20 text-rose-400'
          )}
        >
          {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
        </div>

        <span className="text-[10px] font-bold text-white uppercase tracking-wide">
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </span>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing || !isOnline}
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all',
              isOnline
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-white/30'
            )}
          >
            {isSyncing ? (
              <RefreshCw size={11} className="animate-spin" />
            ) : (
              <Cloud size={11} />
            )}

            <span className="text-[9px] font-bold">
              {pendingCount}
            </span>
          </button>
        )}

        <div className="flex items-center gap-1 px-2.5 py-1 bg-white/5 rounded-xl">
          <span className="text-[9px] font-bold text-white uppercase">
            {unsyncedInspections.length} Drafts
          </span>

          <AlertCircle
            size={10}
            className={cn(
              unsyncedInspections.length > 0
                ? 'text-amber-400 animate-pulse'
                : 'text-white/20'
            )}
          />
        </div>
      </div>
    </motion.div>
  );
};