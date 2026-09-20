import { motion } from 'motion/react';
import { constructionFieldsByType } from '../../../constants/fabric';
import type { CreateInspectionForm } from '../useCreateInspection';

export function FabricDetailsStep({ formData, handleInputChange, handleConstructionChange }: Pick<CreateInspectionForm, 'formData' | 'handleInputChange' | 'handleConstructionChange'>) {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Color</label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleInputChange}
            placeholder="Midnight Blue"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Composition</label>
          <input
            type="text"
            name="composition"
            value={formData.composition}
            onChange={handleInputChange}
            placeholder="95% Cotton, 5% Elastane"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Fabric Type</label>
          <select
            name="fabricType"
            value={formData.fabricType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Type</option>
            <option value="Woven">Woven</option>
            <option value="Knitted">Knitted</option>
            <option value="Non-Woven">Non-Woven</option>
          </select>
        </div>
        {formData.fabricType && (
          <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                Fabric Construction
              </h3>
              <p className="mt-1 text-xs text-gray-400">
                Fields adjust based on selected fabric type.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {constructionFieldsByType[formData.fabricType]?.map((field) => (
                <div
                  key={field.name}
                  className={field.name === 'additionalData' ? 'sm:col-span-2' : ''}
                >
                  <label className="text-xs font-bold uppercase text-gray-400">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={(formData.fabricConstruction?.[field.name] ?? '') as string | number}
                    onChange={(event) => handleConstructionChange(field.name, event.target.value)}
                    className="mt-1 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
