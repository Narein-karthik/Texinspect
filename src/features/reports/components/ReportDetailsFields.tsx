import { getDefaultFabricConstruction } from '../../../utils/fabricConstruction';
import type { ReportEditorState } from '../useReportEditor';

export function ReportDetailsFields({ editDraft, setEditDraft, updateDraftField }: Pick<ReportEditorState, 'editDraft' | 'setEditDraft' | 'updateDraftField'>) {
  return (
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
  );
}
