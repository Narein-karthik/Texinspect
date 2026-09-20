import { FileText } from 'lucide-react';
import { DeleteReportDialog } from '../features/reports/components/DeleteReportDialog';
import { ReportFilters } from '../features/reports/components/ReportFilters';
import { ReportListItem } from '../features/reports/components/ReportListItem';
import { useReportsList } from '../features/reports/useReportsList';

export const ReportsView = () => {
  const {
    navigate,
    inspections,
    currentUser,
    searchTerm,
    setSearchTerm,
    selectedInspector,
    setSelectedInspector,
    selectedCustomer,
    setSelectedCustomer,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reportToDelete,
    setReportToDelete,
    isDeleting,
    inspectors,
    customers,
    filteredInspections,
    hasActiveFilters,
    clearFilters,
    confirmDelete
  } = useReportsList();

  return (
    <div className="space-y-6 pb-32">
      <div>
        <h1 className="text-2xl font-black text-gray-900">
          {currentUser?.role === 'ADMIN' ? 'All Inspection Reports' : 'Inspection Reports'}
        </h1>

        <p className="text-gray-500 mt-1">
          {currentUser?.role === 'ADMIN'
            ? 'Track inspectors, customers, style numbers, and downloads'
            : 'View all generated inspection reports'}
        </p>
      </div>

      {inspections.length > 0 && (
        <ReportFilters
          currentUser={currentUser}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedInspector={selectedInspector}
          setSelectedInspector={setSelectedInspector}
          inspectors={inspectors}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          customers={customers}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />
      )}

      {inspections.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
          <FileText className="mx-auto mb-4 text-gray-300" size={50} />

          <h2 className="text-lg font-bold text-gray-700">
            No Reports Found
          </h2>

          <p className="text-gray-400 mt-2">
            Create a new inspection to generate reports.
          </p>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
          <FileText className="mx-auto mb-4 text-gray-300" size={42} />
          <h2 className="text-lg font-bold text-gray-700">No matching reports</h2>
          <p className="text-sm text-gray-400 mt-2">Try changing or clearing the filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInspections.map((inspection) => (
            <ReportListItem key={inspection.id} inspection={inspection} currentUser={currentUser} navigate={navigate} setReportToDelete={setReportToDelete} />
          ))}
        </div>
      )}

      {reportToDelete && (
        <DeleteReportDialog reportToDelete={reportToDelete} isDeleting={isDeleting} setReportToDelete={setReportToDelete} confirmDelete={confirmDelete} />
      )}
    </div>
  );
};
