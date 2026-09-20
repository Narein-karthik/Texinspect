import { format } from 'date-fns';
import { Inspection } from '../../../types';
import { cn } from '../../../utils/classNames';
import type { ReportData } from '../reportData';

export function LegacyReportSections({ inspection, data }: { inspection: Inspection; data: ReportData }) {
  const { certificateRef, fabricConstruction, visibleConstructionFields } = data;
  return (
    <>
      <section className="hidden">

        {/* Watermark inside header */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.04] rotate-[-35deg] whitespace-nowrap z-0">
          <div className="text-[8rem] md:text-[12rem] font-black tracking-tighter uppercase leading-none">
            {inspection.isPass ? 'PASS' : 'FAIL'}
          </div>
        </div>

        <div className="relative z-10 flex flex-col gap-5 border-b-4 border-gray-900 pb-6 md:pb-8">

          {/* Logo + Cert ref row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-gray-900 text-white p-2.5 md:p-3 rounded-xl font-black text-xl md:text-2xl shrink-0">
                TX
              </div>
              <div className="min-w-0">
                <div className="text-[10px] sm:text-[11px] md:text-[12px] font-black uppercase tracking-[0.18em] sm:tracking-[0.3em] md:tracking-[0.4em] text-gray-900 leading-tight">
                  TexInspect Industrial
                </div>
                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-[0.08em] sm:tracking-widest">
                  Quality Assurance Division / ISO 9001:2015
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <div className="bg-gray-900 text-white px-3 md:px-6 py-3 md:py-4 rounded-2xl">
                <div className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-0.5">
                  Cert. Ref.
                </div>
                <div className="text-sm md:text-xl font-mono font-bold tracking-tighter break-all">
                  {certificateRef}
                </div>
                <div className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1">
                  VER: {inspection.version || 1}.0.0
                </div>
              </div>
            </div>

          </div>

          {/* Customer name */}
          <div className="space-y-1">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Customer Registry
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none text-gray-900 break-words">
              {inspection.customerName}
            </h1>
          </div>

        </div>

        {/* METADATA GRID */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-8">

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Inspection Date
            </div>
            <div className="text-sm font-bold text-gray-900">
              {format(new Date(inspection.inspectionDate), 'PPP')}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Order Number
            </div>
            <div className="text-sm font-bold text-gray-900">
              ORD-{inspection.orderNumber}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Supplier
            </div>
            <div className="text-sm font-bold text-gray-900 uppercase">
              {inspection.supplierName || 'N/A'}
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Primary Inspector
            </div>
            <div className="text-sm font-bold text-gray-900 uppercase">
              {inspection.inspectorName}
            </div>
          </div>

        </div>

      </section>
      <section className="hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
            Fabric Construction
          </h3>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
            {inspection.fabricType || 'N/A'}
          </span>
        </div>

        {visibleConstructionFields.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {visibleConstructionFields.map((field) => (
              <div
                key={field.name}
                className={cn(
                  'rounded-2xl border border-gray-100 bg-gray-50 p-4',
                  field.name === 'additionalData' ? 'col-span-2 md:col-span-4' : ''
                )}
              >
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {field.label}
                </div>
                <div className="mt-2 text-sm font-black text-gray-900 break-words">
                  {fabricConstruction[field.name] || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-bold text-gray-400">
            No construction data recorded.
          </div>
        )}
      </section>
    </>
  );
}
