import { Clipboard } from 'lucide-react';
import { motion } from 'motion/react';
import { generateCertificateRef } from '../../../utils/certificate';
import type { CreateInspectionForm } from '../useCreateInspection';

export function InspectionSummaryStep({ formData }: Pick<CreateInspectionForm, 'formData'>) {
  return (
    <motion.div
      key="step4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
        <Clipboard size={32} />
      </div>
      <div>
        <h3 className="font-bold text-lg text-gray-900">Ready to Inspect?</h3>
        <p className="text-gray-500 text-sm">System will initialize with 0 rolls. You can add rolls during inspection.</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl text-left space-y-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-tighter">
          <span>Customer</span>
          <span>Style</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>{formData.customerName || 'N/A'}</span>
          <span>{formData.styleRef || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-tighter pt-2">
          <span>Supplier</span>
          <span>Certificate</span>
        </div>
        <div className="flex justify-between gap-4 font-bold text-sm">
          <span className="truncate">{formData.supplierName || 'N/A'}</span>
          <span className="shrink-0">
            {generateCertificateRef(
              formData.customerName,
              formData.supplierName,
              formData.inspectionDate
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
