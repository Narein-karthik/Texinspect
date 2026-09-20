import { motion } from 'motion/react';
import type { CreateInspectionForm } from '../useCreateInspection';

export function OrderInfoStep({ formData, handleInputChange }: Pick<CreateInspectionForm, 'formData' | 'handleInputChange'>) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="grid gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Customer Name</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="e.g. Acme Textiles"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Supplier Name</label>
          <input
            type="text"
            name="supplierName"
            value={formData.supplierName || ''}
            onChange={handleInputChange}
            placeholder="e.g. Ultimate Exports"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Order #</label>
            <input
              type="text"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleInputChange}
              placeholder="PO-12345"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Style Ref</label>
            <input
              type="text"
              name="styleRef"
              value={formData.styleRef}
              onChange={handleInputChange}
              placeholder="Cotton Twill"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
