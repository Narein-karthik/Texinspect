import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import type { ReportData } from '../reportData';

export function DefectEvidence({ inspection, data }: { inspection: Inspection; data: ReportData }) {

  return (
    <section className="report-section bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4 space-y-6">

      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
        Defect Image Evidence
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inspection.rolls.flatMap(r =>
          r.defects
            .filter(d => d.photoUrl)
            .map(d => ({ ...d, rollNumber: r.rollNumber }))
        ).sort((a, b) => a.meterLocation - b.meterLocation).map((defect) => (

          <div
            key={defect.id}
            className="avoid-page-break border border-gray-200 rounded-2xl overflow-hidden"
          >
            <img
              src={defect.photoUrl}
              className="w-full h-72 object-contain bg-gray-100"
              style={{ filter: 'brightness(1.12) contrast(1.06)' }}
              alt={`Defect on Roll ${defect.rollNumber}`}
              loading="lazy"
            />
            <div className="p-4 bg-gray-50">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-black text-sm">Roll: {defect.rollNumber}</div>
                  <div className="text-xs text-gray-500 uppercase mt-1">
                    Location: {defect.meterLocation} M
                  </div>
                  {defect.type && (
                    <div className="text-xs font-bold text-gray-700 uppercase tracking-wide mt-1">
                      Type: {defect.type}
                    </div>
                  )}
                </div>
                <span className={cn(
                  "shrink-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                  defect.severity >= 4 ? "bg-red-100 text-red-600" :
                    defect.severity === 3 ? "bg-orange-100 text-orange-600" :
                      "bg-yellow-100 text-yellow-600"
                )}>
                  {defect.severity >= 4 ? 'Critical' :
                    defect.severity === 3 ? 'Major' : 'Minor'}
                </span>
              </div>
            </div>
          </div>

        ))}
      </div>

    </section>
  );
}
