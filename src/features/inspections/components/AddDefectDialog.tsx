import {
  Camera,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { SpeechToTextButton } from '../../../components/common/SpeechToTextButton';
import { DEFECT_TYPES } from '../../../constants/inspection';
import { cn } from '../../../utils/classNames';
import { compressEvidenceImage } from '../../../utils/evidenceImage';
import type { InspectionWorkflow } from '../useInspectionWorkflow';

export function AddDefectDialog({
  inspection,
  showAddDefect,
  setShowAddDefect,
  addDefect,
  photoEvidenceEnabled,
  handlePhotoEvidenceToggle,
  defectPhoto,
  setDefectPhoto,
  defectComment,
  setDefectComment
}: Pick<InspectionWorkflow, 'inspection' | 'showAddDefect' | 'setShowAddDefect' | 'addDefect' | 'photoEvidenceEnabled' | 'handlePhotoEvidenceToggle' | 'defectPhoto' | 'setDefectPhoto' | 'defectComment' | 'setDefectComment'>) {
  return (
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

          {/* photo preference */}
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 px-4 py-3 border border-gray-100">
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gray-700">
                Photo Evidence
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {photoEvidenceEnabled ? 'Required for this defect' : 'No image needed'}
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={photoEvidenceEnabled}
              aria-label="Photo Evidence"
              onClick={() => handlePhotoEvidenceToggle(!photoEvidenceEnabled)}
              className={cn(
                "relative h-7 w-12 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                photoEvidenceEnabled ? "bg-blue-600" : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
                  photoEvidenceEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* photo */}
          {photoEvidenceEnabled && (!defectPhoto ? (
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    try {
                      setDefectPhoto(await compressEvidenceImage(file));
                    } catch (error) {
                      console.error('Unable to process defect evidence photo', error);
                      alert('Unable to process this image. Please try again.');
                    }
                    return;

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
                className="w-full max-h-80 object-contain bg-gray-100"
              />

              <button
                type="button"
                onClick={() => setDefectPhoto(null)}
                className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-xl text-xs font-bold"
              >
                Retake
              </button>
            </div>
          ))}

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
  );
}
