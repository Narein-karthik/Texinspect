import {
  FileBarChart
} from 'lucide-react';
import { cn } from '../../../utils/classNames';
import type { InspectionWorkflow } from '../useInspectionWorkflow';

export function InspectionHeader({ inspection, navigate, handleManualVerdict }: Pick<InspectionWorkflow, 'inspection' | 'navigate' | 'handleManualVerdict'>) {
  return (
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
  );
}
