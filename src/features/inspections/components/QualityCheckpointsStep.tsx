import { motion } from 'motion/react';
import { DETAILED_RESULT_CHECKPOINTS, DETAILED_RESULT_OPTIONS } from '../../../constants/inspection';
import { DetailedResultStatus } from '../../../types';
import type { CreateInspectionForm } from '../useCreateInspection';

export function QualityCheckpointsStep({ formData, handleQualityCheckpointChange }: Pick<CreateInspectionForm, 'formData' | 'handleQualityCheckpointChange'>) {
  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <h3 className="font-bold text-lg text-gray-900">Quality Checkpoints</h3>
        <p className="text-sm text-gray-500">
          Record the quality observations known before you begin the roll inspection. They will appear in the final report.
        </p>
      </div>

      <div className="space-y-3">
        {DETAILED_RESULT_CHECKPOINTS.map((checkpoint) => (
          <div
            key={checkpoint}
            className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[1fr_120px_1.4fr]"
          >
            <div className="self-center text-xs font-black text-gray-800">
              {checkpoint}
            </div>

            <select
              value={formData.detailedResults?.[checkpoint]?.result || 'N/A'}
              onChange={(event) => handleQualityCheckpointChange(
                checkpoint,
                { result: event.target.value as DetailedResultStatus }
              )}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DETAILED_RESULT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <input
              value={formData.detailedResults?.[checkpoint]?.remarks || ''}
              onChange={(event) => handleQualityCheckpointChange(
                checkpoint,
                { remarks: event.target.value }
              )}
              placeholder="Inspector remarks"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
