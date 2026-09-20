import {
  Plus
} from 'lucide-react';
import { cn } from '../../../utils/classNames';
import type { InspectionWorkflow } from '../useInspectionWorkflow';

export function RollSelection({ inspection, activeRollId, setActiveRollId, setShowAddRoll }: Pick<InspectionWorkflow, 'inspection' | 'activeRollId' | 'setActiveRollId' | 'setShowAddRoll'>) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Roll Selection
        </h3>

        <button
          onClick={() => setShowAddRoll(true)}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all"
        >
          <Plus size={14} strokeWidth={3} />
          Add New
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {inspection.rolls.map((roll) => (
          <button
            key={roll.id}
            onClick={() => setActiveRollId(roll.id)}
            className={cn(
              'flex-shrink-0 px-6 py-4 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 min-w-[120px]',
              activeRollId === roll.id
                ? 'bg-gray-900 border-gray-900 text-white shadow-lg shadow-gray-200'
                : 'bg-white border-gray-100 text-gray-400'
            )}
          >
            <div className="text-[9px] font-black uppercase opacity-60">
              Roll {roll.rollNumber}
            </div>

            <div className="text-sm font-black">
              {roll.lengthYards} M
            </div>

            <div className="text-[10px] font-bold opacity-40">
              {roll.defects.length} Def
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
