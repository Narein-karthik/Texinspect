import React from 'react';
import { Defect } from '../types';
import { cn } from '../lib/utils';

interface DefectTimelineProps {
  length: number; // in meters
  defects: Defect[];
  onDefectClick?: (defect: Defect) => void;
}

export const DefectTimeline: React.FC<DefectTimelineProps> = ({ length, defects, onDefectClick }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end border-b border-gray-100 pb-2">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Roll Timeline Overview</div>
        <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded leading-none">
          ASTM D5430 Visualization
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative py-12 px-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 overflow-x-auto overflow-y-hidden custom-scrollbar"
      >
        <div className="min-w-[800px] relative">
          {/* Main Visual Fabric Roll Heatmap */}
          <div className="h-16 w-full bg-white rounded-2xl relative shadow-inner overflow-hidden border border-gray-100">
            {/* Texture hint */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '10px 100%' }} />
            
            {/* Defect Markers - Heatmap Style */}
            {defects.map((defect) => {
              const positionPercent = (defect.meterLocation / length) * 100;
              return (
                <button
                  key={defect.id}
                  onClick={() => onDefectClick?.(defect)}
                  className="absolute top-0 bottom-0 group/marker transition-all hover:z-20 touch-target"
                  style={{ 
                    left: `${Math.min(Math.max(positionPercent, 0), 100)}%`,
                    width: '4px',
                    transform: 'translateX(-50%)' 
                  }}
                >
                  {/* Heatmap Bar */}
                  <div 
                    className={cn(
                      "h-full w-full opacity-60 group-hover/marker:opacity-100 transition-opacity",
                      defect.severity === 4 ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : 
                      defect.severity === 3 ? "bg-amber-500" :
                      defect.severity === 2 ? "bg-blue-500" : "bg-blue-400"
                    )} 
                  />
                  
                  {/* Floating Indicator */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/marker:opacity-100 transition-all scale-75 group-hover/marker:scale-100 pointer-events-none">
                    <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap font-black">
                      {defect.type} @ {defect.meterLocation} m
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scale Axis */}
          <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-0.5 pointer-events-none">
            {[...Array(11)].map((_, i) => {
              const val = Math.round((length / 10) * i);
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="w-0.5 h-2 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-black text-gray-300 tracking-tighter">{val} m</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
