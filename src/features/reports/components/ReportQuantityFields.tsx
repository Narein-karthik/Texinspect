import { quantityUomOptions } from '../../../constants/fabric';
import { Inspection } from '../../../types';
import type { ReportEditorState } from '../useReportEditor';

export function ReportQuantityFields({ editDraft, setEditDraft, updateDraftQuantity }: Pick<ReportEditorState, 'editDraft' | 'setEditDraft' | 'updateDraftQuantity'>) {
  return (
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
  );
}
