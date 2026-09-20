import { motion } from 'motion/react';
import { initialQuantityFields, quantityUomOptions } from '../../../constants/fabric';
import { Inspection } from '../../../types';
import type { CreateInspectionForm } from '../useCreateInspection';

export function InitialQuantityStep({ formData, handleQuantityChange, handleQuantityUomChange, handleCustomUomChange }: Pick<CreateInspectionForm, 'formData' | 'handleQuantityChange' | 'handleQuantityUomChange' | 'handleCustomUomChange'>) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div>
        <h3 className="font-bold text-lg text-gray-900">Initial Quantity</h3>
        <p className="text-sm text-gray-500">
          Enter known packing-list values before inspection. Final accepted/rejected values can be filled after tapping Finish Report.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-bold uppercase text-gray-400">
            UOM - Unit of Measure
          </span>
          <select
            value={formData.quantitySummary?.uom || 'Meters'}
            onChange={(event) => handleQuantityUomChange(
              event.target.value as NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>
            )}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {quantityUomOptions.map((uom) => (
              <option key={uom} value={uom}>{uom}</option>
            ))}
          </select>
        </label>

        {formData.quantitySummary?.uom === 'Others' && (
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-bold uppercase text-gray-400">
              Other Unit of Measure
            </span>
            <input
              type="text"
              value={formData.quantitySummary?.customUom || ''}
              onChange={(event) => handleCustomUomChange(event.target.value)}
              placeholder="Enter unit"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </label>
        )}

        {initialQuantityFields.map((field) => (
          <label key={field.name} className="space-y-1">
            <span className="text-xs font-bold uppercase text-gray-400">
              {field.label}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.quantitySummary?.[field.name] ?? ''}
              onChange={(event) => handleQuantityChange(field.name, event.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </label>
        ))}
      </div>
    </motion.div>
  );
}
