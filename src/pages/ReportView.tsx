import {
  ArrowLeft,
  Download,
  Pencil
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReportDocument } from '../features/reports/components/ReportDocument';
import { ReportEditor } from '../features/reports/components/ReportEditor';
import { useReportEditor } from '../features/reports/useReportEditor';
import { useReportPrint } from '../features/reports/useReportPrint';
import { useStore } from '../store';


import { cn } from '../utils/classNames';


export const ReportView = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const updateInspection = useStore((state) => state.updateInspection);
  const currentUser = useStore((state) => state.currentUser);
  const { isPrinting, reportRef, handleDownloadPdf } = useReportPrint();
  console.log("ALL INSPECTIONS:", inspections);

  const inspection = inspections.find((i) => i.id === id);
  const canEditReport =
    currentUser?.role === 'INSPECTOR' &&
    !!inspection &&
    currentUser.id === inspection.inspectorId;

  const editor = useReportEditor(inspection, canEditReport);
  const { editDraft, openReportEditor } = editor;

  if (!inspection) {
    return (
      <div className="p-8 text-center uppercase font-black text-gray-400 tracking-widest">
        Document Registry Error: ID Not Found
      </div>
    );
  }


  const canEditVerdict = currentUser?.role !== 'ADMIN';
  const handleManualVerdict = (isPass: boolean) => {
    if (!id) return;
    updateInspection(id, { isPass, verdictOverride: true });
  };


  return (
    <div className="report-screen space-y-5 pb-32 bg-[#F5F5F7] px-3 py-4 sm:p-6 md:p-8 lg:p-12 print:p-0">

      {/* TOP ACTIONS */}
      <header className="flex flex-row justify-between items-center gap-3 max-w-[8.5in] mx-auto w-full print:hidden">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest text-[10px] bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="flex items-center gap-2">
          {canEditReport && (
            <button
              onClick={openReportEditor}
              className="px-4 py-3 bg-white text-blue-700 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm border border-blue-100 hover:border-blue-500 transition-colors"
            >
              <Pencil size={17} />
              <span className="hidden sm:inline">Edit Report</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={isPrinting}
            className="px-4 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span className="hidden sm:inline">
              {isPrinting ? 'Generating...' : 'Download PDF'}
            </span>
          </button>
        </div>

      </header>

      {canEditVerdict && (
        <div className="max-w-[8.5in] mx-auto w-full print:hidden">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Manual Verdict
              </p>
              <p className="text-xs font-bold text-gray-700 mt-1">
                Auto rule: accepted when points are 40 or below.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => handleManualVerdict(true)}
                className={cn(
                  'px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
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
                  'px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  !inspection.isPass
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-red-700 border-red-200'
                )}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {editDraft && (
          <ReportEditor editor={editor} />
        )}
      </AnimatePresence>

      {/* REPORT */}
      <ReportDocument inspection={inspection} reportRef={reportRef} />

    </div>
  );
};
