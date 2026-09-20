import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useReportsList } from '../../../features/reports/useReportsList';

export function ReportFilters({
  currentUser,
  hasActiveFilters,
  clearFilters,
  searchTerm,
  setSearchTerm,
  selectedInspector,
  setSelectedInspector,
  inspectors,
  selectedCustomer,
  setSelectedCustomer,
  customers,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: Pick<ReturnType<typeof useReportsList>, 'currentUser' | 'hasActiveFilters' | 'clearFilters' | 'searchTerm' | 'setSearchTerm' | 'selectedInspector' | 'setSelectedInspector' | 'inspectors' | 'selectedCustomer' | 'setSelectedCustomer' | 'customers' | 'startDate' | 'setStartDate' | 'endDate' | 'setEndDate'>) {
  return (
    <section className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
          <SlidersHorizontal size={16} className="text-blue-600" />
          Find reports
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900"
          >
            <X size={14} />
            Clear filters
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search customer, inspector, style, or order"
          className="w-full h-11 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Search reports"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        {currentUser?.role === 'ADMIN' && (
          <label className="block">
            <span className="sr-only">Filter by inspector</span>
            <select
              value={selectedInspector}
              onChange={(event) => setSelectedInspector(event.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All inspectors</option>
              {inspectors.map((inspector) => (
                <option key={inspector} value={inspector}>
                  {inspector}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="block">
          <span className="sr-only">Filter by customer</span>
          <select
            value={selectedCustomer}
            onChange={(event) => setSelectedCustomer(event.target.value)}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer} value={customer}>
                {customer}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">From date</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="From date"
          />
        </label>

        <label className="block">
          <span className="sr-only">To date</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="To date"
          />
        </label>
      </div>
    </section>
  );
}
