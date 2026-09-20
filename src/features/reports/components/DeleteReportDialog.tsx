import { Trash2 } from 'lucide-react';
import { useReportsList } from '../../../features/reports/useReportsList';

export function DeleteReportDialog({ reportToDelete, isDeleting, setReportToDelete, confirmDelete }: Pick<ReturnType<typeof useReportsList>, 'reportToDelete' | 'isDeleting' | 'setReportToDelete' | 'confirmDelete'>) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        aria-label="Close delete confirmation"
        onClick={() => !isDeleting && setReportToDelete(null)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-report-title"
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <Trash2 size={21} />
        </div>

        <h2 id="delete-report-title" className="mt-4 text-lg font-black text-gray-900">
          Delete this report?
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          This permanently removes the report for {reportToDelete.customerName}. It cannot be restored.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => setReportToDelete(null)}
            className="h-11 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep report
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => void confirmDelete()}
            className="h-11 rounded-xl bg-red-600 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete report'}
          </button>
        </div>
      </div>
    </div>
  );
}
