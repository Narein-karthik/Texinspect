import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import { calculateFourPointStats } from '../../../utils/inspectionCalculations';
import type { ReportData } from '../reportData';

export function RollSummaryTable({ inspection, data }: { inspection: Inspection; data: ReportData }) {

  return (
    <section className="report-section bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4 space-y-6">

      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
        Roll Summary
      </h3>

      <div className="overflow-x-auto print:overflow-visible rounded-2xl border border-gray-200">
        <table className="min-w-[620px] print:min-w-0 w-full text-xs md:text-sm print:text-[10px] text-left border-collapse">

          <thead>
            <tr className="bg-gray-100 text-[9px] uppercase font-black text-gray-500">
              <th className="px-4 py-4 border border-gray-200">Roll</th>
              <th className="px-4 py-4 border border-gray-200">Length (m)</th>
              <th className="px-4 py-4 border border-gray-200">Width (in)</th>
              <th className="px-4 py-4 border border-gray-200">Defects</th>
              <th className="px-4 py-4 border border-gray-200">Points</th>
              <th className="px-4 py-4 border border-gray-200">Yield</th>
            </tr>
          </thead>

          <tbody>
            {inspection.rolls.map((roll, idx) => {
              const rollPoints = roll.defects.reduce((s, d) => s + d.severity, 0);
              const rollYield = calculateFourPointStats(rollPoints, roll.lengthYards, roll.widthInches);

              return (
                <tr
                  key={roll.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-4 border border-gray-100 font-bold text-sm">{roll.rollNumber}</td>
                  <td className="px-4 py-4 border border-gray-100 text-sm">{roll.lengthYards}</td>
                  <td className="px-4 py-4 border border-gray-100 text-sm">{roll.widthInches}</td>
                  <td className="px-4 py-4 border border-gray-100 text-sm">{roll.defects.length}</td>
                  <td className="px-4 py-4 border border-gray-100 text-sm">{rollPoints}</td>
                  <td className={cn(
                    "px-4 py-4 border border-gray-100 text-sm font-bold",
                    rollYield > 40 ? "text-red-600" : "text-green-600"
                  )}>
                    {rollYield.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>

        </table>
      </div>

    </section>
  );
}
