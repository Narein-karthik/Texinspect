import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Inspection } from '../types';
import { ArrowLeft, ArrowRight, Save, Clipboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const CreateInspection = () => {
  const navigate = useNavigate();
  const addInspection = useStore((state) => state.addInspection);
  const currentUser = useStore((state) => state.currentUser);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<Inspection>>({
    customerName: '',
    orderNumber: '',
    styleRef: '',
    fabricType: '',
    color: '',
    gsm: 0,
    composition: '',
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
    setFormData((prev) => ({ ...prev, [name]: name === 'gsm' ? Number(value) : value }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSave = () => {
    const id = crypto.randomUUID();
    const newInspection = { ...formData, id } as Inspection;
    addInspection(newInspection);
    navigate(`/inspection/${id}`);
  };

  const steps = [
    { id: 1, title: 'Order Info' },
    { id: 2, title: 'Fabric Details' },
    { id: 3, title: 'Summary' },
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
                <div className="grid grid-cols-2 gap-4">
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
                    <label className="text-sm font-semibold text-gray-700">GSM</label>
                    <input
                      type="number"
                      name="gsm"
                      value={formData.gsm || ''}
                      onChange={handleInputChange}
                      placeholder="180"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
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
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
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
          {step < 3 ? (
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
