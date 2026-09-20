import { Inspection } from '../../../types';
import type { ReportData } from '../reportData';

export function ReportSignature({ inspection, data }: { inspection: Inspection; data: ReportData }) {

  return (
    <section className="report-section avoid-page-break bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">

        <div>
          <div className="text-[20px] font-serif italic text-gray-900 font-bold border-b-2 border-gray-900 w-64 pb-2">
            {inspection.inspectorName}
          </div>
          <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2">
            Senior Technical Inspector Signature
          </div>
        </div>

        <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-gray-900 rounded-xl flex items-center justify-center text-center text-[9px] sm:text-[10px] font-black text-gray-900 shrink-0">
          VERIFIED
        </div>

      </div>

    </section>
  );
}
