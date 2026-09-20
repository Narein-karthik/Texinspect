import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import type { ReportData } from '../reportData';

export function ReportPageTwo({ inspection, data }: { inspection: Inspection; data: ReportData }) {
  const {
    certificateRef,
    quantitySummary,
    quantityUom,
    formatQty,
    totalRejectedQty,
    inspectedPercent,
    rejectedPercent,
    summaryRows,
    detailedResults
  } = data;
  return (
    <section className="report-page-two bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden space-y-6 mt-4">
      <div className="absolute inset-x-0 top-0 h-2 bg-gray-900" />

      <header className="flex flex-col gap-2 border-b-2 border-gray-900 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.35em] text-gray-400">
            Textile Inspection Report / Page 2
          </div>
          <h2 className="mt-1 text-xl font-black uppercase text-gray-900">
            Fabric Inspection Detailed Summary
          </h2>
        </div>
        <div className="font-mono text-xs font-black text-gray-500">
          {certificateRef}
        </div>
      </header>

      <section className="space-y-3">
        <div className="overflow-x-auto print:overflow-visible rounded-2xl border border-gray-200">
          <table className="min-w-[1120px] print:min-w-0 w-full table-fixed text-left text-[10px] print:text-[7px]">
            <thead className="bg-gray-900 text-white">
              <tr>
                {[
                  'Color',
                  `Ordered Qty (${quantityUom})`,
                  `Produced Qty (${quantityUom})`,
                  `Presented Qty (${quantityUom})`,
                  `Inspected Qty (${quantityUom})`,
                  'Inspected %',
                  `Rejected Qty (${quantityUom})`,
                  'Rejected %',
                  'Demerit Points',
                  'Customer Tolerance',
                  'Rating',
                  `Rejected Fabric (${quantityUom})`,
                ].map((heading) => (
                  <th key={heading} className="border border-gray-800 px-2 py-3 font-black uppercase tracking-wide">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summaryRows.map((row) => (
                <tr key={row.key} className="bg-white">
                  <td className="border border-gray-200 px-2 py-3 font-black text-gray-900">{row.color}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.orderedQty}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.producedQty}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.offeredQty}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.inspectedQty}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.inspectedPercent}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.rejectedQty}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.rejectedPercent}</td>
                  <td className="border border-gray-200 px-2 py-3 font-black text-gray-900">{row.demeritPoints}</td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.customerTolerance}</td>
                  <td className={cn(
                    'border border-gray-200 px-2 py-3 font-black uppercase',
                    inspection.isPass ? 'text-green-600' : 'text-red-600'
                  )}>
                    {row.rating}
                  </td>
                  <td className="border border-gray-200 px-2 py-3 font-bold text-gray-700">{row.rejectedFabricMeters}</td>
                </tr>
              ))}

              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-2 py-3 font-black uppercase text-gray-900">Total</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(quantitySummary.orderedQty)}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(quantitySummary.producedQty)}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(quantitySummary.offeredQty)}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(quantitySummary.inspectedQty)}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{inspectedPercent}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(totalRejectedQty)}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{rejectedPercent}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{inspection.totalPoints.toLocaleString()}</td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">40</td>
                <td className={cn(
                  'border border-gray-300 px-2 py-3 font-black uppercase',
                  inspection.isPass ? 'text-green-600' : 'text-red-600'
                )}>
                  {inspection.isPass ? 'Accepted' : 'Rejected'}
                </td>
                <td className="border border-gray-300 px-2 py-3 font-black text-gray-900">{formatQty(totalRejectedQty)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">
          Detailed Results
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full table-fixed text-left text-xs print:text-[9px]">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="w-[34%] border border-gray-800 px-3 py-3 text-[9px] font-black uppercase tracking-widest">Check Point</th>
                <th className="w-[18%] border border-gray-800 px-3 py-3 text-[9px] font-black uppercase tracking-widest">Result</th>
                <th className="border border-gray-800 px-3 py-3 text-[9px] font-black uppercase tracking-widest">Inspector Remarks</th>
              </tr>
            </thead>
            <tbody>
              {detailedResults.map((item, index) => (
                <tr key={item.checkpoint} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-200 px-3 py-3 font-black text-gray-900">{item.checkpoint}</td>
                  <td className={cn(
                    'border border-gray-200 px-3 py-3 font-black uppercase',
                    item.result === 'Pass' && 'text-green-600',
                    item.result === 'Fail' && 'text-red-600',
                    item.result === 'N/A' && 'text-gray-400'
                  )}>
                    {item.result}
                  </td>
                  <td className="border border-gray-200 px-3 py-3 font-bold text-gray-600">
                    {item.remarks || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
