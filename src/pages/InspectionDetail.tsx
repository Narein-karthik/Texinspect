import {
  CheckCircle2,
  Plus
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ActiveRoll } from '../features/inspections/components/ActiveRoll';
import { AddDefectDialog } from '../features/inspections/components/AddDefectDialog';
import { AddRollDialog } from '../features/inspections/components/AddRollDialog';
import { InspectionHeader } from '../features/inspections/components/InspectionHeader';
import { RollSelection } from '../features/inspections/components/RollSelection';
import { useInspectionWorkflow } from '../features/inspections/useInspectionWorkflow';

export const InspectionDetail = () => {
  const workflow = useInspectionWorkflow();
  const { inspection, activeRoll, showAddRoll, showAddDefect, setShowAddDefect, completeInspection } = workflow;

  if (!inspection) {
    return (
      <div className="p-8 text-center uppercase font-black text-gray-400">
        Registry Error: 404
      </div>
    );
  }


  return (
    <div className="space-y-6 animate-in pb-40 pt-20">
      {/* HEADER */}
      <InspectionHeader inspection={workflow.inspection} navigate={workflow.navigate} handleManualVerdict={workflow.handleManualVerdict} />

      {/* ROLL SELECTION */}
      <RollSelection
        inspection={workflow.inspection}
        activeRollId={workflow.activeRollId}
        setActiveRollId={workflow.setActiveRollId}
        setShowAddRoll={workflow.setShowAddRoll}
      />

      {/* ACTIVE ROLL */}
      <AnimatePresence mode="wait">
        {activeRoll && (
          <ActiveRoll key={activeRoll.id} activeRoll={workflow.activeRoll} />
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
          <AddRollDialog
            setShowAddRoll={workflow.setShowAddRoll}
            addRoll={workflow.addRoll}
            isWeightPrimary={workflow.isWeightPrimary}
            usesAutomaticRollMeasure={workflow.usesAutomaticRollMeasure}
            addRollDraft={workflow.addRollDraft}
            updateAddRollMeasure={workflow.updateAddRollMeasure}
          />
        )}
      </AnimatePresence>

      {/* ADD DEFECT MODAL */}
      <AnimatePresence>
        {showAddDefect && (
          <AddDefectDialog
            inspection={workflow.inspection}
            showAddDefect={workflow.showAddDefect}
            setShowAddDefect={workflow.setShowAddDefect}
            addDefect={workflow.addDefect}
            photoEvidenceEnabled={workflow.photoEvidenceEnabled}
            handlePhotoEvidenceToggle={workflow.handlePhotoEvidenceToggle}
            defectPhoto={workflow.defectPhoto}
            setDefectPhoto={workflow.setDefectPhoto}
            defectComment={workflow.defectComment}
            setDefectComment={workflow.setDefectComment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
