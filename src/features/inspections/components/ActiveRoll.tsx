import {
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import { DefectTimeline } from '../../../features/inspections/components/DefectTimeline';
import { cn } from '../../../utils/classNames';
import type { InspectionWorkflow } from '../useInspectionWorkflow';

export function ActiveRoll({ activeRoll }: Pick<InspectionWorkflow, 'activeRoll'>) {
  return (
    <motion.div
      key={activeRoll.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
          Roll Timeline
        </div>

        <DefectTimeline
          length={activeRoll.lengthYards}
          defects={activeRoll.defects}
        />
      </div>

      {/* DEFECT LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Defect Log
          </h3>

          <span className="text-[10px] font-bold text-gray-300">
            {activeRoll.defects.length} Entries
          </span>
        </div>

        <div className="space-y-3">
          {activeRoll.defects.length === 0 ? (
            <div className="bg-gray-50 p-10 rounded-[2rem] border border-dashed border-gray-200 text-center">
              <Camera
                className="mx-auto mb-2 text-gray-200"
                size={24}
              />

              <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                Clean Roll Segment
              </span>
            </div>
          ) : (
            activeRoll.defects.map((defect) => (
              <div
                key={defect.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs',
                      defect.severity === 4
                        ? 'bg-rose-500'
                        : defect.severity === 3
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    )}
                  >
                    {defect.severity}
                  </div>

                  <div>
                    <div className="font-black text-gray-900 uppercase text-xs leading-none mb-1">
                      {defect.type}
                    </div>

                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      Pos: {defect.meterLocation} M
                    </div>
                  </div>
                </div>

                {defect.photoUrl && (
                  <img
                    src={defect.photoUrl}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
