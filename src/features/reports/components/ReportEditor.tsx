import {
  Save,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ReportEditorState } from '../useReportEditor';
import { ReportConstructionFields } from './ReportConstructionFields';
import { ReportDetailsFields } from './ReportDetailsFields';
import { ReportImageField } from './ReportImageField';
import { ReportQuantityFields } from './ReportQuantityFields';
import { ReportRollFields } from './ReportRollFields';

export function ReportEditor({ editor }: { editor: ReportEditorState }) {
  const {
    editDraft,
    setEditDraft,
    isSavingEdit,
    updateDraftField,
    updateDraftRoll,
    updateDraftDefect,
    replaceDraftDefectPhoto,
    replaceRepresentativeFabricImage,
    updateDraftQuantity,
    saveReportEdits
  } = editor;
  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
      <motion.button
        type="button"
        aria-label="Close report editor"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setEditDraft(null)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <motion.form
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        onSubmit={(event) => {
          event.preventDefault();
          void saveReportEdits();
        }}
        className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#F8F9FA] shadow-2xl sm:rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              Edit Report
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Changes update the saved inspection
            </p>
          </div>

          <button
            type="button"
            onClick={() => setEditDraft(null)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
            aria-label="Close report editor"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
          <ReportDetailsFields editDraft={editDraft} setEditDraft={setEditDraft} updateDraftField={updateDraftField} />

          {editDraft.fabricType && (
            <ReportConstructionFields editDraft={editDraft} setEditDraft={setEditDraft} />
          )}

          <ReportImageField editDraft={editDraft} replaceRepresentativeFabricImage={replaceRepresentativeFabricImage} />

          <ReportQuantityFields editDraft={editDraft} setEditDraft={setEditDraft} updateDraftQuantity={updateDraftQuantity} />

          {editDraft.rolls.map((roll, rollIndex) => (
            <ReportRollFields
              key={roll.id}
              roll={roll}
              rollIndex={rollIndex}
              editDraft={editDraft}
              updateDraftRoll={updateDraftRoll}
              updateDraftDefect={updateDraftDefect}
              replaceDraftDefectPhoto={replaceDraftDefectPhoto}
            />
          ))}
        </div>

        <footer className="flex gap-3 border-t border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={() => setEditDraft(null)}
            className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-black uppercase text-gray-500"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSavingEdit}
            className="flex-[2] rounded-2xl bg-blue-600 py-3 text-xs font-black uppercase text-white shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={17} />
            {isSavingEdit ? 'Saving...' : 'Save Changes'}
          </button>
        </footer>
      </motion.form>
    </div>
  );
}
