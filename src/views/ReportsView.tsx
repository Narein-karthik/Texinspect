import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { FileText, ArrowRight, Download, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { Inspection } from '../types';

export const ReportsView = () => {
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const currentUser = useStore((state) => state.currentUser);
  const deleteInspection = useStore((state) => state.deleteInspection);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspector, setSelectedInspector] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportToDelete, setReportToDelete] = useState<Inspection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inspectors = useMemo(
    () => Array.from(new Set(inspections.map((inspection) => inspection.inspectorName).filter(Boolean))).sort(),
    [inspections]
  );

  const customers = useMemo(
    () => Array.from(new Set(inspections.map((inspection) => inspection.customerName).filter(Boolean))).sort(),
    [inspections]
  );

  const filteredInspections = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const inspectionDate = inspection.inspectionDate.slice(0, 10);
      const searchableValues = [
        inspection.customerName,
        inspection.inspectorName,
        inspection.styleRef,
        inspection.orderNumber,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedSearch || searchableValues.includes(normalizedSearch)) &&
        (!selectedInspector || inspection.inspectorName === selectedInspector) &&
        (!selectedCustomer || inspection.customerName === selectedCustomer) &&
        (!startDate || inspectionDate >= startDate) &&
        (!endDate || inspectionDate <= endDate)
      );
    });
  }, [endDate, inspections, searchTerm, selectedCustomer, selectedInspector, startDate]);

  const hasActiveFilters = Boolean(searchTerm || selectedInspector || selectedCustomer || startDate || endDate);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInspector('');
    setSelectedCustomer('');
    setStartDate('');
    setEndDate('');
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);

    try {
      await deleteInspection(reportToDelete.id);
      setReportToDelete(null);
    } catch (error) {
      console.error('Unable to delete report', error);
      alert(error instanceof Error ? error.message : 'Unable to delete this report. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

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
                    className={`px-4 py-2 rounded-full text-xs font-black ${
                      inspection.isPass
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
          ))}
        </div>
      )}

      {reportToDelete && (
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
      )}
    </div>
  );
};
