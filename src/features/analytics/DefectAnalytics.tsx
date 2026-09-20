import { Inspection } from '../../types';
import { DefectTrendChart } from './DefectTrendChart';
import { getReportAnalytics } from './reportAnalytics';

export function DefectAnalytics({ inspection }: { inspection: Inspection }) {
  const { allDefects, critical, major, minor, total, defectTrendData, defectTypeBreakdown, analytics } = getReportAnalytics(inspection);
  return (
    <section className="report-section bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4 space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
          Defect Analytics
        </h3>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
          {inspection.rolls.length} rolls · {total} total defects
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {analytics.map(({ label, count, color, bar, bg, border }) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={label} className={`avoid-page-break rounded-2xl p-4 md:p-5 border ${bg} ${border} flex flex-col gap-3`}>
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                {label}
              </div>
              <div className={`text-3xl md:text-4xl font-black leading-none ${color}`}>
                {count}
              </div>
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[9px] font-bold text-gray-400">
                  {label === 'Total' ? 'across all rolls' : `${pct}% of defects`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {defectTrendData.length > 0 && (
        <div className="bg-gray-50 rounded-3xl p-4 md:p-6 border border-gray-100">

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">
                Defect Trend
              </div>
              <div className="text-xs text-gray-400 uppercase mt-1">
                Defect severity across inspected fabric length
              </div>
            </div>
          </div>

          <DefectTrendChart defectTrendData={defectTrendData} />

        </div>
      )}

      <div className="bg-gray-50 rounded-3xl p-4 md:p-6 border border-gray-100">
        <div className="mb-4">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">
            Defect Breakdown
          </div>
          <div className="text-xs text-gray-400 uppercase mt-1">
            Count and demerit points by defect type
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible rounded-2xl border border-gray-200">
          <table className="min-w-[520px] print:min-w-0 w-full text-left text-xs">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest">Defect Type</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest">Count</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest">Demerit Points</th>
                <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest">Share</th>
              </tr>
            </thead>
            <tbody>
              {defectTypeBreakdown.length > 0 ? (
                defectTypeBreakdown.map((item, index) => (
                  <tr key={item.type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-200 px-4 py-3 font-black text-gray-900">{item.type}</td>
                    <td className="border border-gray-200 px-4 py-3 font-bold text-gray-700">{item.count}</td>
                    <td className="border border-gray-200 px-4 py-3 font-bold text-gray-700">{item.points}</td>
                    <td className="border border-gray-200 px-4 py-3 font-bold text-gray-700">
                      {total > 0 ? `${((item.count / total) * 100).toFixed(1)}%` : 'N/A'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="bg-white px-4 py-5 text-center text-xs font-bold text-gray-400">
                    No defects recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
