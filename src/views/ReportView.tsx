import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import {
  ArrowLeft,
  Download,
  ImagePlus,
  Pencil,
  Save,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
import {
  cn,
  calculateFourPointStats,
  generateCertificateRef,
  getCertificateRef,
  getDefaultFabricConstruction,
  getPassFailStatus,
} from '../lib/utils';
import { DEFECT_TYPES } from '../constants';
import { DefectType, DetailedResultStatus, FabricConstruction, Inspection } from '../types';

const constructionFieldsByType: Record<string, Array<{ name: keyof FabricConstruction; label: string; type?: string }>> = {
  Woven: [
    { name: 'warpCount', label: 'Warp Count' },
    { name: 'weftCount', label: 'Weft Count' },
    { name: 'reed', label: 'Reed' },
    { name: 'pick', label: 'Pick' },
    { name: 'structure', label: 'Structure' },
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
  Knitted: [
    { name: 'count1', label: 'Count 1' },
    { name: 'count2', label: 'Count 2' },
    { name: 'count3', label: 'Count 3' },
    { name: 'structure', label: 'Structure' },
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
  'Non-Woven': [
    { name: 'gsm', label: 'GSM', type: 'number' },
    { name: 'width', label: 'Width' },
    { name: 'additionalData', label: 'Additional Data' },
  ],
};

const detailedResultCheckpoints = [
  'Color Conformity',
  'Face to Face / Edge to Edge',
  'Roll to Roll Variation',
  'Width',
  'Bow / Skew',
  'GSM',
  'Roll Length',
  'Joint Pieces',
  'Handfeel',
  'General Conformity',
];

const detailedResultOptions: DetailedResultStatus[] = ['Pass', 'Fail', 'N/A'];
const quantityUomOptions: Array<NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>> = [
  'Meters',
  'Kgs',
  'Pcs',
  'Others',
];

export const ReportView = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const inspections = useStore((state) => state.inspections);
  const updateInspection = useStore((state) => state.updateInspection);
  const currentUser = useStore((state) => state.currentUser);
  const [isPrinting, setIsPrinting] = React.useState(false);
  const [editDraft, setEditDraft] = React.useState<Inspection | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const autoOpenedEditorRef = React.useRef(false);
  console.log("ALL INSPECTIONS:", inspections);

  const inspection = inspections.find((i) => i.id === id);
  const canEditReport =
    currentUser?.role === 'INSPECTOR' &&
    !!inspection &&
    currentUser.id === inspection.inspectorId;

  React.useEffect(() => {
    if (
      searchParams.get('edit') === 'final' &&
      inspection &&
      canEditReport &&
      !autoOpenedEditorRef.current
    ) {
      autoOpenedEditorRef.current = true;
      setEditDraft(JSON.parse(JSON.stringify(inspection)) as Inspection);
      setSearchParams({}, { replace: true });
    }
  }, [canEditReport, inspection, searchParams, setSearchParams]);

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
  const certificateRef = getCertificateRef(inspection);
  const fabricConstruction = getDefaultFabricConstruction(
    inspection.fabricType,
    inspection.fabricConstruction || {
      gsm: inspection.gsm,
      width: '',
      additionalData: '',
    }
  );
  const visibleConstructionFields = constructionFieldsByType[inspection.fabricType] || [];
  const representativeImage =
    inspection.representativeFabricImageUrl ||
    inspection.rolls
      .flatMap((roll) => roll.defects)
      .find((defect) => defect.photoUrl)?.photoUrl;
  const quantitySummary = inspection.quantitySummary || {};
  const quantityUom = quantitySummary.uom === 'Others'
    ? quantitySummary.customUom?.trim() || 'Others'
    : quantitySummary.uom || 'Meters';
  const formatQty = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString()
      : 'N/A';
  const formatNumber = (value?: number) =>
    typeof value === 'number' && Number.isFinite(value)
      ? value.toLocaleString()
      : 'N/A';
  const formatPct = (value?: number, total?: number) =>
    typeof value === 'number' &&
    typeof total === 'number' &&
    total > 0
      ? `${((value / total) * 100).toFixed(1)}%`
      : 'N/A';
  const getQtyValue = (value?: number, fallback?: number) =>
    typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  const inspectedRolls = getQtyValue(quantitySummary.inspectedRolls, inspection.rolls.length);
  const acceptedRolls = getQtyValue(
    quantitySummary.acceptedRolls,
    inspection.isPass ? inspectedRolls : undefined
  );
  const rejectedRolls = getQtyValue(
    quantitySummary.rejectedRolls,
    !inspection.isPass ? inspectedRolls : undefined
  );
  const rejectedFourPointQty = getQtyValue(
    quantitySummary.rejectedFourPointQty,
    quantitySummary.rejectedQty
  );
  const rejectedOtherQty = getQtyValue(quantitySummary.rejectedOtherQty, 0);
  const totalRejectedQty = getQtyValue(
    quantitySummary.rejectedQty,
    (rejectedFourPointQty || 0) + (rejectedOtherQty || 0)
  );
  const defectiveLinearMeters = getQtyValue(
    quantitySummary.defectiveLinearMeters,
    inspection.rolls.reduce(
      (sum, roll) => sum + new Set(roll.defects.map((defect) => Math.floor(defect.meterLocation))).size,
      0
    )
  );
  const replacementFabricMeters = getQtyValue(
    quantitySummary.replacementFabricMeters,
    defectiveLinearMeters
  );
  const estimatedReplacementMeters = getQtyValue(
    quantitySummary.estimatedReplacementMeters,
    replacementFabricMeters
  );
  const reportInfoItems = [
    { label: 'Report Number', value: certificateRef },
    { label: 'Customer Name', value: inspection.customerName },
    { label: 'Order Number', value: inspection.orderNumber },
    { label: 'Style', value: inspection.styleRef || 'N/A' },
    { label: 'Reference Number', value: inspection.referenceNumber || certificateRef },
    { label: 'Colour', value: inspection.color || 'N/A' },
    { label: 'Composition', value: inspection.composition || 'N/A' },
    { label: 'Season', value: inspection.season || 'N/A' },
  ];
  const standardsItems = [
    { label: 'Sampling Level', value: 'As per buyer / factory requirement' },
    { label: 'Inspection System Tolerance', value: '4 Point System' },
    { label: 'Acceptance Criteria', value: 'Accepted at 40 points or below per 100 sq meters' },
  ];
  const quantityItems = [
    { label: `Ordered Qty (${quantityUom})`, value: formatQty(quantitySummary.orderedQty), percent: '', rolls: 'N/A' },
    { label: `Produced Qty (${quantityUom})`, value: formatQty(quantitySummary.producedQty), percent: formatPct(quantitySummary.producedQty, quantitySummary.orderedQty), rolls: formatNumber(quantitySummary.producedRolls) },
    { label: `Presented Qty (${quantityUom})`, value: formatQty(quantitySummary.offeredQty), percent: formatPct(quantitySummary.offeredQty, quantitySummary.orderedQty), rolls: formatNumber(quantitySummary.offeredRolls) },
    { label: `Inspected Qty (${quantityUom})`, value: formatQty(quantitySummary.inspectedQty), percent: formatPct(quantitySummary.inspectedQty, quantitySummary.offeredQty), rolls: formatNumber(inspectedRolls) },
    { label: `Accepted Qty (${quantityUom})`, value: formatQty(quantitySummary.acceptedQty), percent: formatPct(quantitySummary.acceptedQty, quantitySummary.inspectedQty), rolls: formatNumber(acceptedRolls) },
  ];
  const inspectedPercent = formatPct(quantitySummary.inspectedQty, quantitySummary.offeredQty);
  const rejectedPercent = formatPct(totalRejectedQty, quantitySummary.inspectedQty);
  const summaryRows = [
    {
      key: inspection.color || 'color',
      color: inspection.color || 'N/A',
      orderedQty: formatQty(quantitySummary.orderedQty),
      producedQty: formatQty(quantitySummary.producedQty),
      offeredQty: formatQty(quantitySummary.offeredQty),
      inspectedQty: formatQty(quantitySummary.inspectedQty),
      inspectedPercent,
      rejectedQty: formatQty(totalRejectedQty),
      rejectedPercent,
      demeritPoints: inspection.totalPoints.toLocaleString(),
      customerTolerance: '40',
      rating: inspection.isPass ? 'Accepted' : 'Rejected',
      rejectedFabricMeters: formatQty(totalRejectedQty),
    },
  ];
  const quantityDetailItems = [
    {
      label: 'Qty Rejected - 4 Point System',
      quantity: formatQty(rejectedFourPointQty),
      percentage: formatPct(rejectedFourPointQty, quantitySummary.inspectedQty),
      rolls: formatNumber(quantitySummary.rejectedFourPointRolls),
    },
    {
      label: 'Qty Rejected - Other',
      quantity: formatQty(rejectedOtherQty),
      percentage: formatPct(rejectedOtherQty, quantitySummary.inspectedQty),
      rolls: formatNumber(quantitySummary.rejectedOtherRolls),
    },
    {
      label: 'Total Rejected Qty',
      quantity: formatQty(totalRejectedQty),
      percentage: rejectedPercent,
      rolls: formatNumber(rejectedRolls),
    },
  ];
  const quantityNotes = [
    {
      label: 'No. of linear meters of fabric having defects more than 1 point',
      value: `${formatQty(defectiveLinearMeters)} meters`,
    },
    {
      label: 'No. of meters of fabric rejected for other reasons',
      value: `${formatQty(quantitySummary.otherRejectedMeters)} meters`,
    },
    {
      label: 'Roll length discrepancies versus packing list',
      value: `${formatQty(quantitySummary.rollLengthDiscrepancyMeters)} meters`,
    },
    {
      label: 'Replacement of fabric quantity required for inspected qty',
      value: `${formatQty(replacementFabricMeters)} meters`,
    },
    {
      label: 'Total estimated fabric replacement required for presented qty',
      value: typeof estimatedReplacementMeters === 'number'
        ? `${formatQty(estimatedReplacementMeters)} meters`
        : 'To be confirmed by customer',
    },
  ];
  const detailedResults = detailedResultCheckpoints.map((checkpoint) => ({
    checkpoint,
    result: inspection.detailedResults?.[checkpoint]?.result || 'N/A',
    remarks: inspection.detailedResults?.[checkpoint]?.remarks || '',
  }));
  const canEditVerdict = currentUser?.role !== 'ADMIN';
  const handleManualVerdict = (isPass: boolean) => {
    if (!id) return;
    updateInspection(id, { isPass, verdictOverride: true });
  };

  const openReportEditor = () => {
    setEditDraft(JSON.parse(JSON.stringify(inspection)) as Inspection);
  };

  const updateDraftField = <K extends keyof Inspection>(
    field: K,
    value: Inspection[K]
  ) => {
    setEditDraft((draft) => draft ? { ...draft, [field]: value } : draft);
  };

  const updateDraftRoll = (
    rollId: string,
    updates: Partial<Inspection['rolls'][number]>
  ) => {
    setEditDraft((draft) => draft ? {
      ...draft,
      rolls: draft.rolls.map((roll) =>
        roll.id === rollId ? { ...roll, ...updates } : roll
      ),
    } : draft);
  };

  const updateDraftDefect = (
    rollId: string,
    defectId: string,
    updates: Partial<Inspection['rolls'][number]['defects'][number]>
  ) => {
    setEditDraft((draft) => draft ? {
      ...draft,
      rolls: draft.rolls.map((roll) =>
        roll.id === rollId
          ? {
              ...roll,
              defects: roll.defects.map((defect) =>
                defect.id === defectId ? { ...defect, ...updates } : defect
              ),
            }
          : roll
      ),
    } : draft);
  };

  const replaceDraftDefectPhoto = (
    rollId: string,
    defectId: string,
    file?: File
  ) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const scale = Math.min(1, maxWidth / image.width);
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateDraftDefect(rollId, defectId, {
          photoUrl: canvas.toDataURL('image/jpeg', 0.65),
        });
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const replaceRepresentativeFabricImage = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 1000;
        const scale = Math.min(1, maxWidth / image.width);
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext('2d');
        if (!context) return;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        updateDraftField('representativeFabricImageUrl', canvas.toDataURL('image/jpeg', 0.7));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateDraftQuantity = (
    field: keyof NonNullable<Inspection['quantitySummary']>,
    value: string
  ) => {
    setEditDraft((draft) => draft ? {
      ...draft,
      quantitySummary: {
        ...draft.quantitySummary,
        [field]: value ? Number(value) : undefined,
      },
    } : draft);
  };

  const updateDraftDetailedResult = (
    checkpoint: string,
    updates: { result?: DetailedResultStatus; remarks?: string }
  ) => {
    setEditDraft((draft) => draft ? {
      ...draft,
      detailedResults: {
        ...draft.detailedResults,
        [checkpoint]: {
          result: draft.detailedResults?.[checkpoint]?.result || 'N/A',
          remarks: draft.detailedResults?.[checkpoint]?.remarks || '',
          ...updates,
        },
      },
    } : draft);
  };

  const saveReportEdits = async () => {
    if (!id || !editDraft || !canEditReport) return;

    setIsSavingEdit(true);

    try {
      const totalPoints = editDraft.rolls.reduce(
        (sum, roll) =>
          sum + roll.defects.reduce((defectSum, defect) => defectSum + defect.severity, 0),
        0
      );
      const editedTotalLength = editDraft.rolls.reduce(
        (sum, roll) => sum + roll.lengthYards,
        0
      );
      const weightedWidth = editedTotalLength > 0
        ? editDraft.rolls.reduce(
            (sum, roll) => sum + (roll.lengthYards * roll.widthInches),
            0
          ) / editedTotalLength
        : 0;
      const pointsPer100 = calculateFourPointStats(
        totalPoints,
        editedTotalLength,
        weightedWidth
      );

      await Promise.resolve(updateInspection(id, {
        certificateRef: generateCertificateRef(
          editDraft.customerName,
          editDraft.supplierName,
          editDraft.inspectionDate
        ),
        customerName: editDraft.customerName.trim(),
        supplierName: editDraft.supplierName?.trim(),
        orderNumber: editDraft.orderNumber.trim(),
        styleRef: editDraft.styleRef.trim(),
        referenceNumber: editDraft.referenceNumber?.trim(),
        fabricType: editDraft.fabricType.trim(),
        fabricConstruction: getDefaultFabricConstruction(
          editDraft.fabricType,
          editDraft.fabricConstruction
        ),
        representativeFabricImageUrl: editDraft.representativeFabricImageUrl,
        quantitySummary: editDraft.quantitySummary,
        detailedResults: editDraft.detailedResults,
        color: editDraft.color.trim(),
        gsm: editDraft.gsm,
        composition: editDraft.composition.trim(),
        season: editDraft.season?.trim(),
        dyeLot: editDraft.dyeLot?.trim(),
        rolls: editDraft.rolls,
        totalPoints,
        pointsPer100Yds: pointsPer100,
        isPass: inspection.verdictOverride
          ? inspection.isPass
          : getPassFailStatus(pointsPer100) === 'PASS',
        version: (inspection.version || 1) + 1,
      }));

      setEditDraft(null);
    } finally {
      setIsSavingEdit(false);
    }
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

        <div className="flex items-center gap-2">
          {canEditReport && (
            <button
              onClick={openReportEditor}
              className="px-4 py-3 bg-white text-blue-700 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-sm border border-blue-100 hover:border-blue-500 transition-colors"
            >
              <Pencil size={17} />
              <span className="hidden sm:inline">Edit Report</span>
            </button>
          )}

          <button
            onClick={handleDownloadPdf}
            disabled={isPrinting}
            className="px-4 py-3 bg-gray-900 text-white rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-gray-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            <span className="hidden sm:inline">
              {isPrinting ? 'Generating...' : 'Download PDF'}
            </span>
          </button>
        </div>

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

      <AnimatePresence>
        {editDraft && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 print:hidden">
            <motion.button
              type="button"
              aria-label="Close report editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditDraft(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.form
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              onSubmit={(event) => {
                event.preventDefault();
                void saveReportEdits();
              }}
              className="relative flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#F8F9FA] shadow-2xl sm:rounded-3xl"
            >
              <header className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    Edit Report
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Changes update the saved inspection
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setEditDraft(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500"
                  aria-label="Close report editor"
                >
                  <X size={18} />
                </button>
              </header>

              <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
                <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Report Details
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Customer</span>
                      <input
                        required
                        value={editDraft.customerName}
                        onChange={(event) => updateDraftField('customerName', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Supplier</span>
                      <input
                        value={editDraft.supplierName || ''}
                        onChange={(event) => updateDraftField('supplierName', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Order Number</span>
                      <input
                        required
                        value={editDraft.orderNumber}
                        onChange={(event) => updateDraftField('orderNumber', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Style Number</span>
                      <input
                        value={editDraft.styleRef}
                        onChange={(event) => updateDraftField('styleRef', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Reference Number</span>
                      <input
                        value={editDraft.referenceNumber || ''}
                        onChange={(event) => updateDraftField('referenceNumber', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Fabric Type</span>
                      <select
                        value={editDraft.fabricType}
                        onChange={(event) => {
                          const fabricType = event.target.value;
                          setEditDraft((draft) => draft ? {
                            ...draft,
                            fabricType,
                            fabricConstruction: getDefaultFabricConstruction(
                              fabricType,
                              draft.fabricConstruction
                            ),
                          } : draft);
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Woven">Woven</option>
                        <option value="Knitted">Knitted</option>
                        <option value="Non-Woven">Non-Woven</option>
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Color</span>
                      <input
                        value={editDraft.color}
                        onChange={(event) => updateDraftField('color', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">GSM</span>
                      <input
                        type="number"
                        min="0"
                        value={editDraft.gsm}
                        onChange={(event) => updateDraftField('gsm', Number(event.target.value))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1 sm:col-span-2">
                      <span className="text-xs font-bold text-gray-500">Composition</span>
                      <input
                        value={editDraft.composition}
                        onChange={(event) => updateDraftField('composition', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Season</span>
                      <input
                        value={editDraft.season || ''}
                        onChange={(event) => updateDraftField('season', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs font-bold text-gray-500">Dye Lot</span>
                      <input
                        value={editDraft.dyeLot || ''}
                        onChange={(event) => updateDraftField('dyeLot', event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </section>

                {editDraft.fabricType && (
                  <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Fabric Construction
                      </h3>
                      <p className="mt-1 text-xs font-bold text-gray-400">
                        Fields are based on {editDraft.fabricType}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {constructionFieldsByType[editDraft.fabricType]?.map((field) => (
                        <label
                          key={field.name}
                          className={cn(
                            'space-y-1',
                            field.name === 'additionalData' ? 'sm:col-span-2' : ''
                          )}
                        >
                          <span className="text-xs font-bold text-gray-500">
                            {field.label}
                          </span>
                          <input
                            type={field.type || 'text'}
                            value={(editDraft.fabricConstruction?.[field.name] ?? '') as string | number}
                            onChange={(event) => {
                              const nextValue = field.name === 'gsm'
                                ? Number(event.target.value)
                                : event.target.value;
                              setEditDraft((draft) => draft ? {
                                ...draft,
                                gsm: field.name === 'gsm' ? Number(nextValue) : draft.gsm,
                                fabricConstruction: {
                                  ...getDefaultFabricConstruction(
                                    draft.fabricType,
                                    draft.fabricConstruction
                                  ),
                                  [field.name]: nextValue,
                                },
                              } : draft);
                            }}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </label>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Representative Fabric Image
                      </h3>
                      <p className="text-xs font-bold text-gray-400">
                        Used on Page 1 of the PDF report.
                      </p>
                    </div>

                    <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-xs font-black uppercase text-white">
                      <ImagePlus size={16} />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => replaceRepresentativeFabricImage(event.target.files?.[0])}
                      />
                    </label>
                  </div>

                  {editDraft.representativeFabricImageUrl ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                      <img
                        src={editDraft.representativeFabricImageUrl}
                        alt="Representative fabric preview"
                        className="h-44 w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center text-xs font-bold text-gray-400">
                      No representative image selected.
                    </div>
                  )}
                </section>

                <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Quantity Summary
                    </h3>
                    <p className="mt-1 text-xs font-bold text-gray-400">
                      These values populate the Page 1 quantity table.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <label className="space-y-1 sm:col-span-3">
                      <span className="text-[10px] font-bold text-gray-500">
                        UOM - Unit of Measure
                      </span>
                      <select
                        value={editDraft.quantitySummary?.uom || 'Meters'}
                        onChange={(event) => {
                          const uom = event.target.value as NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>;
                          setEditDraft((draft) => draft ? {
                            ...draft,
                            quantitySummary: {
                              ...draft.quantitySummary,
                              uom,
                              customUom: uom === 'Others' ? draft.quantitySummary?.customUom : undefined,
                            },
                          } : draft);
                        }}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {quantityUomOptions.map((uom) => (
                          <option key={uom} value={uom}>{uom}</option>
                        ))}
                      </select>
                    </label>

                    {editDraft.quantitySummary?.uom === 'Others' && (
                      <label className="space-y-1 sm:col-span-3">
                        <span className="text-[10px] font-bold text-gray-500">
                          Other Unit of Measure
                        </span>
                        <input
                          value={editDraft.quantitySummary?.customUom || ''}
                          onChange={(event) => {
                            const customUom = event.target.value;
                            setEditDraft((draft) => draft ? {
                              ...draft,
                              quantitySummary: {
                                ...draft.quantitySummary,
                                uom: 'Others',
                                customUom,
                              },
                            } : draft);
                          }}
                          placeholder="Enter unit"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    )}

                    {[
                      ['orderedQty', 'Ordered Qty'],
                      ['producedQty', 'Produced Qty'],
                      ['offeredQty', 'Presented Qty'],
                      ['inspectedQty', 'Inspected Qty'],
                      ['acceptedQty', 'Accepted Qty'],
                      ['rejectedQty', 'Rejected Qty'],
                      ['producedRolls', 'Produced Rolls'],
                      ['offeredRolls', 'Presented Rolls'],
                      ['inspectedRolls', 'Inspected Rolls'],
                      ['acceptedRolls', 'Accepted Rolls'],
                      ['rejectedRolls', 'Rejected Rolls'],
                      ['rejectedFourPointQty', 'Rejected Qty - 4 Point'],
                      ['rejectedOtherQty', 'Rejected Qty - Other'],
                      ['rejectedFourPointRolls', 'Rejected Rolls - 4 Point'],
                      ['rejectedOtherRolls', 'Rejected Rolls - Other'],
                      ['defectiveLinearMeters', 'Defective Linear Meters'],
                      ['otherRejectedMeters', 'Other Rejected Meters'],
                      ['rollLengthDiscrepancyMeters', 'Roll Length Difference'],
                      ['replacementFabricMeters', 'Replacement Fabric'],
                      ['estimatedReplacementMeters', 'Estimated Replacement'],
                    ].map(([field, label]) => (
                      <label key={field} className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500">{label}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editDraft.quantitySummary?.[field as keyof NonNullable<Inspection['quantitySummary']>] ?? ''}
                          onChange={(event) => updateDraftQuantity(
                            field as keyof NonNullable<Inspection['quantitySummary']>,
                            event.target.value
                          )}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5">
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                      Detailed Results
                    </h3>
                    <p className="mt-1 text-xs font-bold text-gray-400">
                      These checkpoints appear on Page 2 of the PDF report.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {detailedResultCheckpoints.map((checkpoint) => (
                      <div
                        key={checkpoint}
                        className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 sm:grid-cols-[1fr_120px_1.4fr]"
                      >
                        <div className="text-xs font-black text-gray-800">
                          {checkpoint}
                        </div>

                        <select
                          value={editDraft.detailedResults?.[checkpoint]?.result || 'N/A'}
                          onChange={(event) => updateDraftDetailedResult(
                            checkpoint,
                            { result: event.target.value as DetailedResultStatus }
                          )}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {detailedResultOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>

                        <input
                          value={editDraft.detailedResults?.[checkpoint]?.remarks || ''}
                          onChange={(event) => updateDraftDetailedResult(
                            checkpoint,
                            { remarks: event.target.value }
                          )}
                          placeholder="Inspector remarks"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {editDraft.rolls.map((roll, rollIndex) => (
                  <section
                    key={roll.id}
                    className="space-y-4 rounded-3xl border border-gray-100 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Roll {rollIndex + 1}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400">
                        {roll.defects.length} defects
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500">Roll No.</span>
                        <input
                          required
                          value={roll.rollNumber}
                          onChange={(event) => updateDraftRoll(roll.id, { rollNumber: event.target.value })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500">Length (m)</span>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={roll.lengthYards}
                          onChange={(event) => updateDraftRoll(roll.id, { lengthYards: Number(event.target.value) })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500">Width (in)</span>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={roll.widthInches}
                          onChange={(event) => updateDraftRoll(roll.id, { widthInches: Number(event.target.value) })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-500">Weight (kg)</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={roll.weightKg || ''}
                          onChange={(event) => updateDraftRoll(roll.id, {
                            weightKg: event.target.value ? Number(event.target.value) : undefined,
                          })}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-gray-500">Shade</span>
                      <input
                        value={roll.shade || ''}
                        onChange={(event) => updateDraftRoll(roll.id, { shade: event.target.value })}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </label>

                    {roll.defects.length > 0 && (
                      <div className="space-y-3 border-t border-gray-100 pt-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Recorded Defects
                        </h4>

                        {roll.defects.map((defect, defectIndex) => (
                          <div
                            key={defect.id}
                            className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-3"
                          >
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                              Defect {defectIndex + 1}
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <label className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-500">Type</span>
                                <select
                                  value={defect.type}
                                  onChange={(event) => updateDraftDefect(
                                    roll.id,
                                    defect.id,
                                    { type: event.target.value as DefectType }
                                  )}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {DEFECT_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-500">Severity</span>
                                <select
                                  value={defect.severity}
                                  onChange={(event) => updateDraftDefect(
                                    roll.id,
                                    defect.id,
                                    { severity: Number(event.target.value) as 1 | 2 | 3 | 4 }
                                  )}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  {[1, 2, 3, 4].map((point) => (
                                    <option key={point} value={point}>{point} point</option>
                                  ))}
                                </select>
                              </label>

                              <label className="space-y-1">
                                <span className="text-[10px] font-bold text-gray-500">Location (m)</span>
                                <input
                                  required
                                  type="number"
                                  min="0"
                                  max={roll.lengthYards}
                                  step="0.01"
                                  value={defect.meterLocation}
                                  onChange={(event) => updateDraftDefect(
                                    roll.id,
                                    defect.id,
                                    { meterLocation: Number(event.target.value) }
                                  )}
                                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </label>
                            </div>

                            <label className="block space-y-1">
                              <span className="text-[10px] font-bold text-gray-500">Comment</span>
                              <textarea
                                rows={2}
                                value={defect.comment || ''}
                                onChange={(event) => updateDraftDefect(
                                  roll.id,
                                  defect.id,
                                  { comment: event.target.value }
                                )}
                                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </label>

                            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                              {defect.photoUrl ? (
                                <img
                                  src={defect.photoUrl}
                                  alt={`Defect ${defectIndex + 1}`}
                                  className="h-28 w-full rounded-2xl object-cover"
                                />
                              ) : (
                                <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white text-[10px] font-black uppercase tracking-widest text-gray-300">
                                  No Photo
                                </div>
                              )}

                              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-xs font-black uppercase text-white">
                                <ImagePlus size={16} />
                                Photo
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(event) => replaceDraftDefectPhoto(
                                    roll.id,
                                    defect.id,
                                    event.target.files?.[0]
                                  )}
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>

              <footer className="flex gap-3 border-t border-gray-200 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setEditDraft(null)}
                  className="flex-1 rounded-2xl border border-gray-200 py-3 text-xs font-black uppercase text-gray-500"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-[2] rounded-2xl bg-blue-600 py-3 text-xs font-black uppercase text-white shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save size={17} />
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </footer>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT */}
      <div
        id="report-content"
        ref={reportRef}
        className="report-document bg-[#F5F5F7] mx-auto w-full max-w-[210mm] print:w-[210mm] print:min-h-[297mm] relative flex flex-col text-gray-900 font-sans shadow-xl print:shadow-none"
      >
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

            <div className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-900">Representative Fabric Image</h2>
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
                {representativeImage ? (
                  <img src={representativeImage} alt="Representative fabric" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center text-xs font-black uppercase tracking-widest text-gray-300">
                    No Image Available
                  </div>
                )}
              </div>
            </div>
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

        {/* ── HEADER CARD ─────────────────────────────────────── */}
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

        {/* ── KPI CARDS ────────────────────────────────────────── */}
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

        <section className="report-page-three space-y-4">
          <header className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 mt-4">
            <div className="text-[8px] font-black uppercase tracking-[0.35em] text-gray-400">
              Textile Inspection Report / Page 3
            </div>
            <h2 className="mt-1 text-xl font-black uppercase text-gray-900">
              Analytics and Defect Breakdown
            </h2>
          </header>

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
          const defectTypeBreakdown = Object.values(
            allDefects.reduce<Record<string, { type: string; count: number; points: number }>>(
              (acc, defect) => {
                const type = defect.type || 'Other';
                acc[type] = acc[type] || { type, count: 0, points: 0 };
                acc[type].count += 1;
                acc[type].points += defect.severity;
                return acc;
              },
              {}
            )
          ).sort((a, b) => b.points - a.points || b.count - a.count);

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
                                  Severity: {val} - {severityLabel[val] ?? 'Unknown'}
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
        })()}

        {/* ── ROLL DATA TABLE ───────────────────────────────────── */}
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

        {/* ── DEFECT IMAGES ─────────────────────────────────────── */}
        {inspection.rolls.some(r => r.defects.some(d => d.photoUrl)) && (

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
        </section>

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
