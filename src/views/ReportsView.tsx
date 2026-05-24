import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { FileText, ArrowRight, Download } from 'lucide-react';
import { format } from 'date-fns';

export const ReportsView = () => {
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const currentUser = useStore((state) => state.currentUser);

  console.log("ALL INSPECTIONS:", inspections);

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
      ) : (
        <div className="space-y-4">
          {inspections.map((inspection) => (
            <button
              key={inspection.id}
              onClick={() => navigate(`/reports/${inspection.id}`)}
              className="w-full bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between hover:border-blue-500 transition-all"
            >
              <div className="text-left">
                <h2 className="font-black text-lg text-gray-900 uppercase">
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

              <div className="flex items-center gap-3">
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
          ))}
        </div>
      )}
    </div>
  );
};
