import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import {
  ArrowLeft,
  Download
} from 'lucide-react';

import {
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

import { format } from 'date-fns';
import { cn, calculateFourPointStats } from '../lib/utils';

export const ReportView = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const updateInspection = useStore((state) => state.updateInspection);
  const currentUser = useStore((state) => state.currentUser);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  console.log("ALL INSPECTIONS:", inspections);

  const inspection = inspections.find((i) => i.id === id);

  if (!inspection) {
    return (
      <div className="p-8 text-center uppercase font-black text-gray-400 tracking-widest">
        Document Registry Error: ID Not Found
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setIsPrinting(true);

    try {
      await document.fonts.ready;
      const printWindow = window.open('', '_blank', 'width=900,height=1200');

      if (!printWindow) {
        window.print();
        return;
      }

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map((node) => node.outerHTML)
        .join('\n');

      printWindow.document.open();
      printWindow.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>TexInspect Report</title>
            ${styles}
            <style>
              html, body, #root {
                height: auto !important;
                overflow: visible !important;
                background: #ffffff !important;
              }

              body {
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              #report-content {
                width: 190mm !important;
                max-width: 190mm !important;
                min-height: auto !important;
                margin: 0 auto !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }

              table {
                width: 100% !important;
                min-width: 0 !important;
                table-layout: fixed;
              }

              th, td {
                word-break: break-word;
              }

              tr,
              .avoid-page-break {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              @page {
                size: A4;
                margin: 10mm;
              }
            </style>
          </head>
          <body>
            ${reportRef.current.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();

      window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    } finally {
      window.setTimeout(() => setIsPrinting(false), 800);
    }
  };

  const totalLength = inspection.rolls.reduce((s, r) => s + r.lengthYards, 0);
  const canEditVerdict = currentUser?.role !== 'ADMIN';

  const handleManualVerdict = (isPass: boolean) => {
    if (!id) return;
    updateInspection(id, { isPass, verdictOverride: true });
  };

  return (
    <div className="report-screen space-y-5 pb-32 bg-[#F5F5F7] px-3 py-4 sm:p-6 md:p-8 lg:p-12 print:p-0">

      {/* TOP ACTIONS */}
      <header className="flex flex-row justify-between items-center gap-3 max-w-[8.5in] mx-auto w-full print:hidden">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-900 font-black uppercase tracking-widest text-[10px] bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={handleDownloadPdf}
          disabled={isPrinting}
          className="px-4 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          {isPrinting ? 'Generating...' : 'Download PDF'}
        </button>

      </header>

      {canEditVerdict && (
        <div className="max-w-[8.5in] mx-auto w-full print:hidden">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                Manual Verdict
              </p>
              <p className="text-xs font-bold text-gray-700 mt-1">
                Auto rule: accepted when points are 40 or below.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 shrink-0">
              <button
                onClick={() => handleManualVerdict(true)}
                className={cn(
                  'px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  inspection.isPass
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-green-700 border-green-200'
                )}
              >
                Accept
              </button>
              <button
                onClick={() => handleManualVerdict(false)}
                className={cn(
                  'px-3 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all',
                  !inspection.isPass
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-red-700 border-red-200'
                )}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT */}
      <div
        id="report-content"
        ref={reportRef}
        className="report-document bg-[#F5F5F7] mx-auto w-full max-w-[210mm] print:w-[210mm] print:min-h-[297mm] relative flex flex-col text-gray-900 font-sans shadow-xl print:shadow-none"
      >

        {/* ── HEADER CARD ─────────────────────────────────────── */}
        <section className="report-section avoid-page-break bg-white rounded-3xl p-4 sm:p-5 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">

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
                    TIC-{inspection.id.slice(0, 8).toUpperCase()}
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
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-5 md:mt-8">

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
                Primary Inspector
              </div>
              <div className="text-sm font-bold text-gray-900 uppercase">
                {inspection.inspectorName}
              </div>
            </div>

          </div>

        </section>

        {/* ── KPI CARDS ────────────────────────────────────────── */}
        <section className="report-section grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-4">

          <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Yield Points
            </div>
            <div className="text-3xl md:text-4xl font-black text-blue-600 leading-none mt-1">
              {inspection.pointsPer100Yds.toFixed(1)}
            </div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              per 100 sq meters
            </div>
          </div>

          <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Total Length
            </div>
            <div className="text-3xl md:text-4xl font-black text-gray-900 leading-none mt-1">
              {totalLength}
            </div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              meters
            </div>
          </div>

          <div className="avoid-page-break bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 flex flex-col gap-1">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
              Unit Count
            </div>
            <div className="text-3xl md:text-4xl font-black text-gray-900 leading-none mt-1">
              {inspection.rolls.length}
            </div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">
              rolls inspected
            </div>
          </div>

          <div className={cn(
            "avoid-page-break rounded-3xl p-4 md:p-6 shadow-sm border flex flex-col items-center justify-center gap-2",
            inspection.isPass
              ? "bg-green-500 border-green-400"
              : "bg-red-500 border-red-400"
          )}>
            <div className="text-[9px] font-black text-white/70 uppercase tracking-widest">
              Verdict
            </div>
            <div className="max-w-full px-1 text-center text-[11px] sm:text-sm md:text-xl font-black text-white tracking-[0.04em] sm:tracking-[0.08em] leading-tight break-words">
              {inspection.isPass ? 'ACCEPTED' : 'REJECTED'}
            </div>
          </div>

        </section>

        {/* ── DEFECT ANALYTICS ─────────────────────────────────── */}
        {(() => {
          const allDefects = inspection.rolls.flatMap(r => r.defects);
          const critical = allDefects.filter(d => d.severity >= 4).length;
          const major    = allDefects.filter(d => d.severity === 3).length;
          const minor    = allDefects.filter(d => d.severity <= 2 && d.severity >= 1).length;
          const total    = allDefects.length;

          const defectTrendData = inspection.rolls.flatMap((roll) =>
            roll.defects.map((d) => ({
              location: d.meterLocation,
              severity: d.severity,
              roll: roll.rollNumber
            }))
          ).sort((a, b) => a.location - b.location);

          const analytics = [
            { label: 'Critical', count: critical, color: 'text-red-600',    bar: 'bg-red-500',    bg: 'bg-red-50',    border: 'border-red-100'    },
            { label: 'Major',    count: major,    color: 'text-orange-600', bar: 'bg-orange-400', bg: 'bg-orange-50', border: 'border-orange-100' },
            { label: 'Minor',    count: minor,    color: 'text-yellow-600', bar: 'bg-yellow-400', bg: 'bg-yellow-50', border: 'border-yellow-100' },
            { label: 'Total',    count: total,    color: 'text-gray-900',   bar: 'bg-gray-400',   bg: 'bg-gray-50',   border: 'border-gray-200'   },
          ];

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

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={defectTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="location"
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                          tickLine={false}
                          axisLine={false}
                          label={{ value: 'Location (m)', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#9ca3af' }}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 4]}
                          ticks={[1, 2, 3, 4]}
                          label={{ value: 'Severity', angle: -90, position: 'insideLeft', fontSize: 9, fill: '#9ca3af' }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            const val = payload[0].value as number;
                            const severityLabel: Record<number, string> = {
                              1: 'Minor', 2: 'Minor', 3: 'Major', 4: 'Critical'
                            };
                            return (
                              <div style={{
                                background: '#111827', borderRadius: '12px',
                                padding: '10px 14px', color: '#fff',
                                fontSize: '11px', fontWeight: 700
                              }}>
                                <div style={{ opacity: 0.5, marginBottom: 4 }}>
                                  Location: {label} m
                                </div>
                                <div>
                                  Severity: {val} — {severityLabel[val] ?? 'Unknown'}
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="severity"
                          stroke="#2563eb"
                          strokeWidth={3}
                          isAnimationActive={false}
                          dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 7, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              )}

            </section>
          );
        })()}

        {/* ── ROLL DATA TABLE ───────────────────────────────────── */}
        <section className="report-section bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4 space-y-6">

          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
            Detailed Roll Data
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

        {/* ── DEFECT IMAGES ─────────────────────────────────────── */}
        {inspection.rolls.some(r => r.defects.some(d => d.photoUrl)) && (

          <section className="report-section bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4 space-y-6">

            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.5em] text-gray-900">
              Defect Images
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
                    className="w-full h-72 object-cover"
                    alt={`Defect on Roll ${defect.rollNumber}`}
                    loading="lazy"
                    crossOrigin="anonymous"
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

        )}

        {/* ── SIGNATURE ─────────────────────────────────────────── */}
        <section className="report-section avoid-page-break bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100 mt-4">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">

            <div>
              <div className="text-[20px] font-serif italic text-gray-900 font-bold border-b-2 border-gray-900 w-64 pb-2">
                {inspection.inspectorName}
              </div>
              <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-2">
                Senior Technical Inspector Signature
              </div>
            </div>

            <div className="w-16 h-16 sm:w-24 sm:h-24 border-4 border-gray-900 rounded-xl flex items-center justify-center text-center text-[9px] sm:text-[10px] font-black text-gray-900 shrink-0">
              VERIFIED
            </div>

          </div>

        </section>

      </div>

    </div>
  );
};
