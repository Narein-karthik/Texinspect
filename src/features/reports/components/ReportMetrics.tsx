import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import type { ReportData } from '../reportData';

export function ReportMetrics({ inspection, data }: { inspection: Inspection; data: ReportData }) {
  const { totalLength } = data;
  return (
    <section className="report-section grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">

      <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Yield Points
        </div>
        <div className="text-3xl md:text-4xl font-black text-blue-600 leading-none mt-1">
          {inspection.pointsPer100Yds.toFixed(1)}
        </div>
        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
          per 100 sq meters
        </div>
      </div>

      <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Total Length
        </div>
        <div className="text-3xl md:text-4xl font-black text-gray-900 leading-none mt-1">
          {totalLength}
        </div>
        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
          meters
        </div>
      </div>

      <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          Unit Count
        </div>
        <div className="text-3xl md:text-4xl font-black text-gray-900 leading-none mt-1">
          {inspection.rolls.length}
        </div>
        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
          rolls inspected
        </div>
      </div>

      <div className={cn(
        "avoid-page-break rounded-3xl p-4 md:p-6 shadow-sm border flex flex-col items-center justify-center gap-2",
        inspection.isPass
          ? "bg-green-500 border-green-400"
          : "bg-red-500 border-red-400"
      )}>
        <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">
          Verdict
        </div>
        <div className="max-w-full px-1 text-center text-[11px] sm:text-sm md:text-xl font-black text-white tracking-[0.04em] sm:tracking-[0.08em] leading-tight break-words">
          {inspection.isPass ? 'ACCEPTED' : 'REJECTED'}
        </div>
      </div>

    </section>
  );
}
