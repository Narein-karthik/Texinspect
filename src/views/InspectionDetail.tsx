import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Roll, Defect, DefectType } from '../types';
import {
  Plus,
  Trash2,
  Camera,
  X,
  CheckCircle2,
  FileBarChart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DefectTimeline } from '../components/DefectTimeline';
import { SpeechToTextButton } from '../components/SpeechToTextButton';
import { DEFECT_TYPES } from '../constants';
import { calculateFourPointStats, getPassFailStatus, cn } from '../lib/utils';

export const InspectionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const updateInspection = useStore((state) => state.updateInspection);

  const inspection = inspections.find((i) => i.id === id);

  const [activeRollId, setActiveRollId] = useState<string | null>(null);
  const [showAddRoll, setShowAddRoll] = useState(false);
  const [showAddDefect, setShowAddDefect] = useState<{ rollId: string } | null>(null);

  const [defectComment, setDefectComment] = useState('');
  const [defectPhoto, setDefectPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (inspection && inspection.rolls.length > 0 && !activeRollId) {
      setActiveRollId(inspection.rolls[0].id);
    }
  }, [inspection, activeRollId]);

  if (!inspection) {
    return (
      <div className="p-8 text-center uppercase font-black text-gray-400">
        Registry Error: 404
      </div>
    );
  }

  const activeRoll = inspection.rolls.find((r) => r.id === activeRollId);

  const handleUpdate = (updates: Partial<typeof inspection>) => {
    if (id) updateInspection(id, updates);
  };

  const handleManualVerdict = (isPass: boolean) => {
    handleUpdate({ isPass, verdictOverride: true });
  };

  const completeInspection = () => {
    handleUpdate({ status: 'COMPLETED' });
    navigate(`/reports/${inspection.id}?edit=final`);
  };

  const addRoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const newRoll: Roll = {
      id: crypto.randomUUID(),
      rollNumber: fd.get('rollNumber') as string,
      lengthYards: Number(fd.get('lengthYards')),
      widthInches: Number(fd.get('widthInches')),
      weightKg: Number(fd.get('weightKg')),
      shade: fd.get('shade') as string,
      defects: [],
      status: 'PENDING',
      startTime: new Date().toISOString(),
    };

    const updatedRolls = [...inspection.rolls, newRoll];
    const totalPoints = updatedRolls.reduce(
      (sum, r) =>
        sum + r.defects.reduce((dSum, d) => dSum + d.severity, 0),
      0
    );
    const totalLength = updatedRolls.reduce(
      (sum, r) => sum + r.lengthYards,
      0
    );
    const avgWidth =
      updatedRolls.length > 0 ? updatedRolls[0].widthInches : 0;
    const pointsPer100 = calculateFourPointStats(
      totalPoints,
      totalLength,
      avgWidth
    );

    handleUpdate({
      rolls: updatedRolls,
      totalPoints,
      pointsPer100Yds: pointsPer100,
      isPass: inspection.verdictOverride
        ? inspection.isPass
        : getPassFailStatus(pointsPer100) === 'PASS',
    });

    setActiveRollId(newRoll.id);
    setShowAddRoll(false);
  };

  const addDefect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!showAddDefect) return;

    if (!defectPhoto) {
      alert('Please attach defect evidence photo');
      return;
    }

    const fd = new FormData(e.currentTarget);

    const newDefect: Defect = {
      id: crypto.randomUUID(),
      meterLocation: Number(fd.get('meterLocation')),
      type: fd.get('type') as DefectType,
      severity: Number(fd.get('severity')) as 1 | 2 | 3 | 4,
      comment: defectComment || '',
      photoUrl: defectPhoto || '',
      timestamp: new Date().toISOString(),
    };

    const updatedRolls = inspection.rolls.map((r) => {
      if (r.id === showAddDefect.rollId) {
        return {
          ...r,
          defects: [...r.defects, newDefect],
        };
      }

      return r;
    });

    const totalPoints = updatedRolls.reduce(
      (sum, r) =>
        sum + r.defects.reduce((dSum, d) => dSum + d.severity, 0),
      0
    );

    const totalLength = updatedRolls.reduce(
      (sum, r) => sum + r.lengthYards,
      0
    );

    const avgWidth =
      updatedRolls.length > 0 ? updatedRolls[0].widthInches : 0;

    const pointsPer100 = calculateFourPointStats(
      totalPoints,
      totalLength,
      avgWidth
    );

    handleUpdate({
      rolls: updatedRolls,
      totalPoints,
      pointsPer100Yds: pointsPer100,
      isPass: inspection.verdictOverride
        ? inspection.isPass
        : getPassFailStatus(pointsPer100) === 'PASS',
    });

    setDefectComment('');
    setDefectPhoto(null);
    setShowAddDefect(null);
  };

  return (
    <div className="space-y-6 animate-in pb-40 pt-20">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-1">
              {inspection.customerName}
            </h2>

            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              PO: {inspection.orderNumber} • {inspection.fabricType}
            </div>
          </div>

          <button
            onClick={() => navigate(`/reports/${inspection.id}`)}
            className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-blue-600 active:scale-95 transition-all"
          >
            <FileBarChart size={20} />
          </button>
        </div>

        <div
          className={cn(
            'p-6 rounded-[2rem] flex items-center justify-between border-2 transition-all',
            inspection.isPass
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          )}
        >
          <div>
            <div className="text-3xl font-black tracking-tighter leading-none mb-1">
              {inspection.pointsPer100Yds.toFixed(1)}
            </div>

            <div className="text-[9px] font-black uppercase tracking-widest opacity-60">
              PTS / 100M²
            </div>
          </div>

          <div className="px-5 py-2 bg-white rounded-full font-black text-xs uppercase tracking-widest shadow-sm">
            {inspection.isPass ? 'PASS' : 'FAIL'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-[2rem] p-4 border border-gray-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Manual Verdict
              </div>
              <div className="text-xs font-bold text-gray-500 mt-1">
                Auto rule accepts reports at 40 points or below.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleManualVerdict(true)}
              className={cn(
                'py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
                inspection.isPass
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-green-700 border-green-200'
              )}
            >
              Accept
            </button>

            <button
              onClick={() => handleManualVerdict(false)}
              className={cn(
                'py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
                !inspection.isPass
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-rose-700 border-rose-200'
              )}
            >
              Reject
            </button>
          </div>
        </div>
      </div>

      {/* ROLL SELECTION */}
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

      {/* ACTIVE ROLL */}
      <AnimatePresence mode="wait">
        {activeRoll && (
          <motion.div
            key={activeRoll.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                Roll Timeline
              </div>

              <DefectTimeline
                length={activeRoll.lengthYards}
                defects={activeRoll.defects}
              />
            </div>

            {/* DEFECT LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Defect Log
                </h3>

                <span className="text-[10px] font-bold text-gray-300">
                  {activeRoll.defects.length} Entries
                </span>
              </div>

              <div className="space-y-3">
                {activeRoll.defects.length === 0 ? (
                  <div className="bg-gray-50 p-10 rounded-[2rem] border border-dashed border-gray-200 text-center">
                    <Camera
                      className="mx-auto mb-2 text-gray-200"
                      size={24}
                    />

                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                      Clean Roll Segment
                    </span>
                  </div>
                ) : (
                  activeRoll.defects.map((defect) => (
                    <div
                      key={defect.id}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs',
                            defect.severity === 4
                              ? 'bg-rose-500'
                              : defect.severity === 3
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          )}
                        >
                          {defect.severity}
                        </div>

                        <div>
                          <div className="font-black text-gray-900 uppercase text-xs leading-none mb-1">
                            {defect.type}
                          </div>

                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            Pos: {defect.meterLocation} M
                          </div>
                        </div>
                      </div>

                      {defect.photoUrl && (
                        <img
                          src={defect.photoUrl}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-24 left-4 right-4 z-40">
        <div className="bg-gray-900 text-white rounded-[2rem] p-3 flex items-center gap-3 shadow-2xl">
          <button
            disabled={!activeRoll}
            onClick={() => setShowAddDefect({ rollId: activeRoll!.id })}
            className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} strokeWidth={3} />
            Log Defect
          </button>

          <button
            onClick={completeInspection}
            className="shrink-0 px-4 sm:px-5 h-14 bg-white/10 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest text-blue-100"
          >
            <CheckCircle2 size={24} className="text-blue-400" />
            <span className="hidden sm:inline">Finish Report</span>
            <span className="sm:hidden">Finish</span>
          </button>
        </div>
      </div>

      {/* ADD ROLL MODAL */}
      <AnimatePresence>
        {showAddRoll && (
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
                      Length (M)
                    </label>

                    <input
                      type="number"
                      name="lengthYards"
                      required
                      min="0"
                      step="0.01"
                      placeholder="125"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                      Weight
                    </label>

                    <input
                      type="number"
                      name="weightKg"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
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
        )}
      </AnimatePresence>

      {/* ADD DEFECT MODAL */}
      <AnimatePresence>
        {showAddDefect && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDefect(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              layoutId="defect-modal"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="
                relative
                w-full
                max-w-lg
                max-h-[90vh]
                overflow-y-auto
                bg-white
                rounded-[2rem]
                p-6
                shadow-2xl
              "
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold">Record Defect</h3>

                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Adding to Roll{' '}
                    {
                      inspection.rolls.find(
                        (r) => r.id === showAddDefect.rollId
                      )?.rollNumber
                    }
                  </p>
                </div>

                <button
                  onClick={() => setShowAddDefect(null)}
                  className="p-2 bg-gray-50 rounded-full"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={addDefect} className="space-y-6">
                {/* severity */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Severity Point
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((pt) => (
                      <label key={pt} className="relative cursor-pointer">
                        <input
                          type="radio"
                          name="severity"
                          value={pt}
                          className="peer hidden"
                          required
                          defaultChecked={pt === 1}
                        />

                        <div className="h-12 border-2 border-gray-100 rounded-xl flex items-center justify-center font-black text-gray-400 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-600 transition-all uppercase text-xs">
                          {pt} PTS
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                      Length (M)
                    </label>

                    <input
                      type="number"
                      name="meterLocation"
                      required
                      placeholder="0.0"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                      Defect Type
                    </label>

                    <select
                      name="type"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                    >
                      {DEFECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* photo */}
                {!defectPhoto ? (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (file) {
                          const reader = new FileReader();

                          reader.onloadend = () => {
                            const img = new Image();

                            img.onload = () => {
                              const canvas = document.createElement('canvas');

                              const maxWidth = 600;

                              const scale = maxWidth / img.width;

                              canvas.width = maxWidth;
                              canvas.height = img.height * scale;

                              const ctx = canvas.getContext('2d');

                              if (!ctx) return;

                              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                              // SAFE compression → returns BASE64 STRING
                              const compressedBase64 = canvas.toDataURL(
                                'image/jpeg',
                                0.5
                              );

                              setDefectPhoto(compressedBase64);
                            };

                            img.src = reader.result as string;
                          };

                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div className="flex flex-col items-center justify-center gap-3 py-10 bg-gray-50 border-4 border-dashed border-gray-100 rounded-[2rem] text-gray-400">
                      <Camera size={32} />

                      <span className="text-xs font-black uppercase tracking-widest">
                        Snap Direct Evidence
                      </span>
                    </div>
                  </label>
                ) : (
                  <div className="relative overflow-hidden rounded-[2rem]">
                    <img
                      src={defectPhoto}
                      className="w-full aspect-video object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => setDefectPhoto(null)}
                      className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-xl text-xs font-bold"
                    >
                      Retake
                    </button>
                  </div>
                )}

                {/* comment */}
                <div className="flex gap-2">
                  <input
                    name="comment"
                    value={defectComment}
                    onChange={(e) => setDefectComment(e.target.value)}
                    placeholder="Optional notes..."
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
                  />

                  <SpeechToTextButton
                    onTranscript={(text) =>
                      setDefectComment((prev) =>
                        prev ? `${prev} ${text}` : text
                      )
                    }
                  />
                </div>

                {/* sticky submit */}
                <div className="sticky bottom-0 bg-white pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-rose-600 text-white font-bold rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-95"
                  >
                    Log Defect
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
