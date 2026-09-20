import { format } from 'date-fns';
import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import type { ReportData } from '../reportData';

export function ReportPageOne({ inspection, data }: { inspection: Inspection; data: ReportData }) {
  const {
    certificateRef,
    fabricConstruction,
    visibleConstructionFields,
    representativeImage,
    reportInfoItems,
    standardsItems,
    quantityItems,
    quantityDetailItems,
    quantityNotes
  } = data;
  return (
    <section className="report-page-one bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden space-y-5">
      <div className="absolute inset-x-0 top-0 h-2 bg-gray-900" />

      <header className="flex flex-col gap-4 border-b-2 border-gray-900 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 text-white p-3 rounded-xl font-black text-2xl shrink-0">TX</div>
          <div>
            <div className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.35em] text-gray-900">
              TexInspect Industrial
            </div>
            <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">
              Textile Inspection Report / Page 1
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-900 px-5 py-4 text-white">
          <div className="text-[8px] font-black uppercase tracking-widest text-white/50">Report Number</div>
          <div className="mt-1 font-mono text-lg font-black tracking-tight break-all">{certificateRef}</div>
          <div className="mt-1 text-[8px] font-black uppercase tracking-widest text-white/40">
            Date: {format(new Date(inspection.inspectionDate), 'dd/MM/yyyy')}
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">1. Report Information</h2>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {reportInfoItems.map((item) => (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">{item.label}</div>
              <div className="mt-1 text-xs font-black text-gray-900 break-words">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">
            2. Fabric Construction Details
          </h2>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-gray-500">
            {inspection.fabricType || 'N/A'}
          </span>
        </div>

        {visibleConstructionFields.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {visibleConstructionFields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  'rounded-xl border border-gray-200 bg-white p-3',
                  field.name === 'additionalData' ? 'col-span-2 md:col-span-4' : ''
                )}
              >
                <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">{field.label}</div>
                <div className="mt-1 text-xs font-black text-gray-900 break-words">
                  {fabricConstruction[field.name] || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs font-bold text-gray-400">
            No construction data recorded.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">3. Global Result</h2>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="text-[8px] font-black uppercase tracking-widest text-blue-400">4 Point System Result</div>
              <div className="mt-2 text-4xl font-black text-blue-600">{inspection.pointsPer100Yds.toFixed(1)}</div>
              <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-blue-400">points / 100 sq meters</div>
            </div>

            <div className={cn('rounded-2xl border p-4 flex flex-col justify-center', inspection.isPass ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50')}>
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Final Verdict</div>
              <div className={cn('mt-2 text-2xl font-black uppercase', inspection.isPass ? 'text-green-600' : 'text-red-600')}>
                {inspection.isPass ? 'Accepted' : 'Rejected'}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Supplier Name</div>
              <div className="mt-1 text-xs font-black text-gray-900 break-words">{inspection.supplierName || 'N/A'}</div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Style / Reference Number</div>
              <div className="mt-1 text-xs font-black text-gray-900 break-words">{inspection.styleRef || certificateRef}</div>
            </div>
          </div>
        </div>

        {representativeImage && (
          <div className="space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">Representative Fabric Image</h2>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
              <img src={representativeImage} alt="Representative fabric" className="h-full w-full object-cover" />
            </div>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">4. Standards</h2>
          <div className="space-y-2">
            {standardsItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">{item.label}</div>
                <div className="mt-1 text-xs font-bold text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">5. Quantity Summary</h2>
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest">Quantity</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest">Quantity</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest">Percentage %</th>
                  <th className="px-3 py-2 text-[8px] font-black uppercase tracking-widest">Quantity of Rolls</th>
                </tr>
              </thead>
              <tbody>
                {quantityItems.map((item, index) => (
                  <tr key={item.label} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 font-bold text-gray-500">{item.label}</td>
                    <td className="px-3 py-2 font-black text-gray-900">{item.value}</td>
                    <td className="px-3 py-2 font-bold text-blue-600">{item.percent || 'N/A'}</td>
                    <td className="px-3 py-2 font-bold text-gray-600">{item.rolls}</td>
                  </tr>
                ))}
                {quantityDetailItems.map((item, index) => (
                  <tr key={item.label} className={index % 2 === 0 ? 'bg-red-50/50' : 'bg-white'}>
                    <td className="px-3 py-2 font-bold text-red-700">{item.label}</td>
                    <td className="px-3 py-2 font-black text-red-700">{item.quantity}</td>
                    <td className="px-3 py-2 font-bold text-red-600">{item.percentage}</td>
                    <td className="px-3 py-2 font-bold text-red-700">{item.rolls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-1 gap-2 text-[10px] md:grid-cols-2">
            {quantityNotes.map((item) => (
              <div key={item.label} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="font-bold text-red-700">{item.label}</div>
                <div className="mt-1 font-black text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
