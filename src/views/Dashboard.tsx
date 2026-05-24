import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { 
  ClipboardCheck, 
  Download,
  FileText,
  Plus,
  ShieldCheck,
  UserRoundCheck,
  Users
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();
  const inspections = useStore((state) => state.inspections);
  const currentUser = useStore((state) => state.currentUser);

  if (currentUser?.role === 'ADMIN') {
    const completedReports = inspections.filter((inspection) => inspection.status !== 'DRAFT');
    const inspectorMap = inspections.reduce((acc, inspection) => {
      const inspector = acc.get(inspection.inspectorId) || {
        id: inspection.inspectorId,
        name: inspection.inspectorName || 'Unknown Inspector',
        reportCount: 0,
        customerCount: new Set<string>(),
        styles: new Set<string>(),
      };

      inspector.reportCount += 1;
      inspector.customerCount.add(inspection.customerName || 'Unknown Customer');
      if (inspection.styleRef) inspector.styles.add(inspection.styleRef);
      acc.set(inspection.inspectorId, inspector);
      return acc;
    }, new Map<string, {
      id: string;
      name: string;
      reportCount: number;
      customerCount: Set<string>;
      styles: Set<string>;
    }>());

    const inspectors = Array.from(inspectorMap.values())
      .sort((a, b) => b.reportCount - a.reportCount);

    const recentReports = [...inspections]
      .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
      .slice(0, 8);

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

  return (
    <div className="space-y-8 animate-in">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">System Activity</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <div className="text-2xl font-black text-gray-900 tracking-tighter">{inspections.length}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase">Total Sessions</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl">
            <div className="text-2xl font-black text-blue-600 tracking-tighter">
              {inspections.filter(i => i.isPass).length}
            </div>
            <div className="text-[10px] font-bold text-blue-400 uppercase">Success Rate</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/new')}
        className="w-full bg-blue-600 text-white p-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 shadow-xl shadow-blue-200 active:scale-95 transition-all"
      >
        <Plus size={28} strokeWidth={3} />
        <span className="uppercase tracking-widest text-sm">Start New Session</span>
      </button>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Recent Registry</h3>
        </div>

        <div className="space-y-4">
          {inspections.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2.5rem] p-12 text-center">
              <ClipboardCheck className="mx-auto mb-4 text-gray-200" size={48} />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">No active inspections recorded</p>
            </div>
          ) : (
            inspections.map((inspection) => (
              <motion.div
                key={inspection.id}
                onClick={() => navigate(`/inspection/${inspection.id}`)}
                className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between group active:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-sm",
                    inspection.isPass ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                  )}>
                    {inspection.isPass ? 'OK' : 'FAIL'}
                  </div>
                  <div>
                    <div className="font-black text-gray-900 group-hover:text-blue-600 uppercase text-sm leading-none mb-1 truncate max-w-[150px]">
                      {inspection.customerName}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {inspection.orderNumber} • {format(new Date(inspection.inspectionDate), 'MMM dd')}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-black text-gray-900 tracking-tighter leading-none">
                    {inspection.pointsPer100Yds.toFixed(1)}
                  </div>
                  <div className="text-[8px] text-gray-400 font-black uppercase">PTS</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
