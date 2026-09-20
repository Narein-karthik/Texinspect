import React from 'react';
import { Inspection } from '../../../types';

import { DefectAnalytics } from '../../analytics/DefectAnalytics';
import { buildReportData } from '../reportData';
import { DefectEvidence } from './DefectEvidence';
import { LegacyReportSections } from './LegacyReportSections';
import { ReportMetrics } from './ReportMetrics';
import { ReportPageOne } from './ReportPageOne';
import { ReportPageTwo } from './ReportPageTwo';
import { ReportSignature } from './ReportSignature';
import { RollSummaryTable } from './RollSummaryTable';

export function ReportDocument({ inspection, reportRef }: { inspection: Inspection; reportRef: React.Ref<HTMLDivElement> }) {
  const data = buildReportData(inspection);
  return (
    <div
      id="report-content"
      ref={reportRef}
      className="report-document bg-[#F5F5F7] mx-auto w-full max-w-[210mm] print:w-[210mm] print:min-h-[297mm] relative flex flex-col text-gray-900 font-sans shadow-xl print:shadow-none"
    >
      <ReportPageOne inspection={inspection} data={data} />

      {/* ── HEADER CARD ─────────────────────────────────────── */}
      <LegacyReportSections inspection={inspection} data={data} />



      {/* ── KPI CARDS ────────────────────────────────────────── */}
      <ReportPageTwo inspection={inspection} data={data} />

      <section className="report-page-three space-y-4">
        <header className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 mt-4">
          <div className="text-[8px] font-black uppercase tracking-[0.35em] text-gray-400">
            Textile Inspection Report / Page 3
          </div>
          <h2 className="mt-1 text-xl font-black uppercase text-gray-900">
            Analytics and Defect Breakdown
          </h2>
        </header>

        <ReportMetrics inspection={inspection} data={data} />

        {/* ── DEFECT ANALYTICS ─────────────────────────────────── */}
        <DefectAnalytics inspection={inspection} />

        {/* ── ROLL DATA TABLE ───────────────────────────────────── */}
        <RollSummaryTable inspection={inspection} data={data} />

        {/* ── DEFECT IMAGES ─────────────────────────────────────── */}
        {inspection.rolls.some(r => r.defects.some(d => d.photoUrl)) && (

          <DefectEvidence inspection={inspection} data={data} />

        )}

        {/* ── SIGNATURE ─────────────────────────────────────────── */}
      </section>

      <ReportSignature inspection={inspection} data={data} />

    </div>
  );
}
