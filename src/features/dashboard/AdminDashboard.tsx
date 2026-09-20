import { format } from 'date-fns';
import {
  Download,
  FileText,
  ShieldCheck,
  UserRoundCheck,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Inspection } from '../../types';
import { getAdminDashboardData } from '../analytics/dashboardAnalytics';

export function AdminDashboard({ inspections }: { inspections: Inspection[] }) {
  const navigate = useNavigate();
  const { completedReports, inspectors, recentReports } = getAdminDashboardData(inspections);
  return (
    <div className="space-y-6 animate-in">
      <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Admin Monitor</h2>
            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">
              Inspector activity and generated reports
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="text-2xl font-black">{inspections.length}</div>
            <div className="text-[9px] text-white/50 font-black uppercase">Reports</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="text-2xl font-black">{inspectors.length}</div>
            <div className="text-[9px] text-white/50 font-black uppercase">Inspectors</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="text-2xl font-black">{completedReports.length}</div>
            <div className="text-[9px] text-white/50 font-black uppercase">Completed</div>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Inspectors
          </h3>
          <Users size={18} className="text-gray-300" />
        </div>

        {inspectors.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
            <UserRoundCheck className="mx-auto mb-4 text-gray-200" size={42} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              No inspector activity yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inspectors.map((inspector) => (
              <div
                key={inspector.id}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-black text-gray-900 uppercase">
                      {inspector.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                      {inspector.customerCount.size} customers / {inspector.styles.size} styles
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-blue-600 leading-none">
                      {inspector.reportCount}
                    </div>
                    <div className="text-[8px] text-gray-400 font-black uppercase mt-1">
                      reports
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 pb-28">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
            Recent Reports
          </h3>
          <FileText size={18} className="text-gray-300" />
        </div>

        {recentReports.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center">
            <FileText className="mx-auto mb-4 text-gray-200" size={42} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
              No generated reports found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentReports.map((inspection) => (
              <button
                key={inspection.id}
                onClick={() => navigate(`/reports/${inspection.id}`)}
                className="w-full bg-white rounded-3xl p-5 border border-gray-100 shadow-sm text-left flex items-center justify-between gap-4 active:scale-[0.99] transition-all"
              >
                <div className="min-w-0">
                  <h4 className="font-black text-gray-900 uppercase truncate">
                    {inspection.customerName}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 truncate">
                    {inspection.styleRef || 'No style'} / {inspection.inspectorName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    {format(new Date(inspection.inspectionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Download size={18} />
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
