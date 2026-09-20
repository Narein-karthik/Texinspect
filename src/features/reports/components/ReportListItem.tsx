import { format } from 'date-fns';
import { ArrowRight, Download, Trash2 } from 'lucide-react';
import { useReportsList } from '../../../features/reports/useReportsList';
import type { Inspection } from '../../../types';

export function ReportListItem({ currentUser, navigate, setReportToDelete, inspection }: Pick<ReturnType<typeof useReportsList>, 'currentUser' | 'navigate' | 'setReportToDelete'> & { inspection: Inspection }) {
  return (
    <article
      key={inspection.id}
      className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-3 hover:border-blue-500 transition-all"
    >
      <button
        type="button"
        onClick={() => navigate(`/reports/${inspection.id}`)}
        className="min-w-0 flex flex-1 items-center justify-between gap-4 text-left"
      >
        <div className="min-w-0">
          <h2 className="truncate font-black text-lg text-gray-900 uppercase">
            {inspection.customerName}
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {format(
              new Date(inspection.inspectionDate),
              'PPP'
            )}
          </p>

          <div className="mt-2 text-xs text-gray-400 uppercase tracking-wider">
            Inspector: {inspection.inspectorName}
          </div>

          <div className="mt-1 text-xs text-gray-400 uppercase tracking-wider">
            Style: {inspection.styleRef || 'N/A'} / Order: {inspection.orderNumber || 'N/A'}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            className={`px-4 py-2 rounded-full text-xs font-black ${inspection.isPass
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
              }`}
          >
            {inspection.isPass ? 'PASS' : 'FAIL'}
          </div>

          {currentUser?.role === 'ADMIN' ? (
            <Download className="text-gray-400" />
          ) : (
            <ArrowRight className="text-gray-400" />
          )}
        </div>
      </button>

      {currentUser?.role === 'ADMIN' && (
        <button
          type="button"
          onClick={() => setReportToDelete(inspection)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition-colors hover:border-red-300 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Delete report for ${inspection.customerName}`}
          title="Delete report"
        >
          <Trash2 size={17} />
        </button>
      )}
    </article>
  );
}
