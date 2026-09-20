import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { FabricDetailsStep } from '../features/inspections/components/FabricDetailsStep';
import { InitialQuantityStep } from '../features/inspections/components/InitialQuantityStep';
import { InspectionSummaryStep } from '../features/inspections/components/InspectionSummaryStep';
import { OrderInfoStep } from '../features/inspections/components/OrderInfoStep';
import { QualityCheckpointsStep } from '../features/inspections/components/QualityCheckpointsStep';
import { useCreateInspection } from '../features/inspections/useCreateInspection';
import { cn } from '../utils/classNames';


export const CreateInspection = () => {
  const form = useCreateInspection();
  const { navigate, step, steps, handleBack, handleNext, handleSave, formData } = form;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold">Create New Report</h2>
          <div className="flex gap-2 mt-1">
            {steps.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "h-1.5 w-12 rounded-full transition-all duration-300",
                  step >= s.id ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <OrderInfoStep key="step1" formData={form.formData} handleInputChange={form.handleInputChange} />
          )}

          {step === 2 && (
            <FabricDetailsStep key="step2" formData={form.formData} handleInputChange={form.handleInputChange} handleConstructionChange={form.handleConstructionChange} />
          )}

          {step === 3 && (
            <InitialQuantityStep
              key="step3"
              formData={form.formData}
              handleQuantityChange={form.handleQuantityChange}
              handleQuantityUomChange={form.handleQuantityUomChange}
              handleCustomUomChange={form.handleCustomUomChange}
            />
          )}

          {step === 4 && (
            <InspectionSummaryStep key="step4" formData={form.formData} />
          )}

          {step === 5 && (
            <QualityCheckpointsStep key="step5" formData={form.formData} handleQualityCheckpointChange={form.handleQualityCheckpointChange} />
          )}
        </AnimatePresence>

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 text-gray-600 transition-all"
            >
              Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !formData.customerName}
              className="flex-[2] px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="flex-[2] px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Start Inspection
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
