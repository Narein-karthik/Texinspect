import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { FabricConstruction, Inspection } from '../types';
import { ArrowLeft, ArrowRight, Save, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, generateCertificateRef, getDefaultFabricConstruction } from '../lib/utils';

const constructionFieldsByType: Record<string, Array<{ name: keyof FabricConstruction; label: string; type?: string }>> = {
  Woven: [
    { name: 'warpCount', label: 'Warp Count' },
    { name: 'weftCount', label: 'Weft Count' },
    { name: 'reed', label: 'Reed' },
    { name: 'pick', label: 'Pick' },
    { name: 'structure', label: 'Structure' },
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
  Knitted: [
    { name: 'count1', label: 'Count 1' },
    { name: 'count2', label: 'Count 2' },
    { name: 'count3', label: 'Count 3' },
    { name: 'structure', label: 'Structure' },
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
  'Non-Woven': [
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
};

const initialQuantityFields: Array<{
  name: keyof NonNullable<Inspection['quantitySummary']>;
  label: string;
}> = [
  { name: 'orderedQty', label: 'Ordered Qty' },
  { name: 'producedQty', label: 'Produced Qty' },
  { name: 'offeredQty', label: 'Presented Qty' },
  { name: 'producedRolls', label: 'Produced Rolls' },
  { name: 'offeredRolls', label: 'Presented Rolls' },
];

const quantityUomOptions: Array<NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>> = [
  'Meters',
  'Kgs',
  'Pcs',
  'Others',
];

export const CreateInspection = () => {
  const navigate = useNavigate();
  const addInspection = useStore((state) => state.addInspection);
  const currentUser = useStore((state) => state.currentUser);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<Inspection>>({
    customerName: '',
    supplierName: '',
    orderNumber: '',
    styleRef: '',
    fabricType: '',
    color: '',
    gsm: 0,
    composition: '',
    fabricConstruction: {},
    quantitySummary: { uom: 'Meters' },
    season: '',
    inspectorName: currentUser?.name || 'Inspector',
    inspectorId: currentUser?.id || '',
    inspectionDate: new Date().toISOString(),
    rolls: [],
    status: 'DRAFT',
    totalPoints: 0,
    pointsPer100Yds: 0,
    isPass: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'fabricType') {
        return {
          ...prev,
          fabricType: value,
          fabricConstruction: getDefaultFabricConstruction(value, prev.fabricConstruction),
        };
      }

      return { ...prev, [name]: name === 'gsm' ? Number(value) : value };
    });
  };

  const handleConstructionChange = (
    name: keyof FabricConstruction,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      fabricConstruction: {
        ...getDefaultFabricConstruction(prev.fabricType, prev.fabricConstruction),
        [name]: name === 'gsm' ? Number(value) : value,
      },
      gsm: name === 'gsm' ? Number(value) : prev.gsm,
    }));
  };

  const handleQuantityChange = (
    name: keyof NonNullable<Inspection['quantitySummary']>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        [name]: value ? Number(value) : undefined,
      },
    }));
  };

  const handleQuantityUomChange = (
    value: NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>
  ) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        uom: value,
        customUom: value === 'Others' ? prev.quantitySummary?.customUom : undefined,
      },
    }));
  };

  const handleCustomUomChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        uom: 'Others',
        customUom: value,
      },
    }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSave = () => {
    const id = crypto.randomUUID();
    const inspectionDate = formData.inspectionDate || new Date().toISOString();
    const newInspection = {
      ...formData,
      id,
      inspectionDate,
      certificateRef: generateCertificateRef(
        formData.customerName,
        formData.supplierName,
        inspectionDate
      ),
      fabricConstruction: getDefaultFabricConstruction(
        formData.fabricType,
        formData.fabricConstruction
      ),
    } as Inspection;
    addInspection(newInspection);
    navigate(`/inspection/${id}`);
  };

  const steps = [
    { id: 1, title: 'Order Info' },
    { id: 2, title: 'Fabric Details' },
    { id: 3, title: 'Initial Qty' },
    { id: 4, title: 'Summary' },
  ];

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
          )}

          {step === 2 && (
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
          )}

          {step === 3 && (
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
          )}

          {step === 4 && (
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
          {step < 4 ? (
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
