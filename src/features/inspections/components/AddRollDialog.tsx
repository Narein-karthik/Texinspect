import {
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../utils/classNames';
import type { InspectionWorkflow } from '../useInspectionWorkflow';

export function AddRollDialog({ setShowAddRoll, addRoll, isWeightPrimary, usesAutomaticRollMeasure, addRollDraft, updateAddRollMeasure }: Pick<InspectionWorkflow, 'setShowAddRoll' | 'addRoll' | 'isWeightPrimary' | 'usesAutomaticRollMeasure' | 'addRollDraft' | 'updateAddRollMeasure'>) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowAddRoll(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-6 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Add Roll
            </h3>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Register a new roll for this inspection
            </p>
          </div>

          <button
            onClick={() => setShowAddRoll(false)}
            className="p-2 bg-gray-50 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={addRoll} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase">
              Roll Number
            </label>

            <input
              name="rollNumber"
              required
              placeholder="1"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                {isWeightPrimary ? 'Weight (KG)' : 'Length (M)'}
              </label>

              <input
                type="number"
                name={isWeightPrimary ? 'weightKg' : 'lengthYards'}
                required
                min="0"
                step="0.01"
                placeholder={isWeightPrimary ? '22' : '125'}
                value={isWeightPrimary ? addRollDraft.weightKg : addRollDraft.lengthYards}
                onChange={(event) => updateAddRollMeasure(
                  isWeightPrimary ? 'weightKg' : 'lengthYards',
                  event.target.value
                )}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Width
              </label>

              <input
                type="number"
                name="widthInches"
                required
                min="0"
                step="0.01"
                placeholder="58"
                value={addRollDraft.widthInches}
                onChange={(event) => updateAddRollMeasure('widthInches', event.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                {isWeightPrimary ? 'Length (M)' : 'Weight (KG)'}
              </label>

              <input
                type="number"
                name={isWeightPrimary ? 'lengthYards' : 'weightKg'}
                required={usesAutomaticRollMeasure}
                min="0"
                step="0.01"
                placeholder={usesAutomaticRollMeasure ? 'Calculated automatically' : 'Optional'}
                value={isWeightPrimary ? addRollDraft.lengthYards : addRollDraft.weightKg}
                onChange={(event) => updateAddRollMeasure(
                  isWeightPrimary ? 'lengthYards' : 'weightKg',
                  event.target.value
                )}
                readOnly={usesAutomaticRollMeasure}
                aria-readonly={usesAutomaticRollMeasure}
                className={cn(
                  'w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500',
                  usesAutomaticRollMeasure
                    ? 'bg-blue-50 border-blue-100 text-blue-900 cursor-not-allowed'
                    : 'bg-gray-50 border-gray-200'
                )}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Shade
              </label>

              <input
                name="shade"
                placeholder="Optional"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white pt-4">
            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              Add Roll
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
