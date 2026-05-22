import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { 
  BarChart3, 
  Clock, 
  ClipboardCheck, 
  AlertCircle, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const Dashboard = () => {
  const navigate = useNavigate();
  const inspections = useStore((state) => state.inspections);

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
