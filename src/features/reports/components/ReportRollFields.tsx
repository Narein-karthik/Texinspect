import {
  ImagePlus
} from 'lucide-react';
import { DEFECT_TYPES } from '../../../constants/inspection';
import { DefectType, Inspection } from '../../../types';
import type { ReportEditorState } from '../useReportEditor';

export function ReportRollFields({ roll, rollIndex, editDraft, updateDraftRoll, updateDraftDefect, replaceDraftDefectPhoto }: Pick<ReportEditorState, 'editDraft' | 'updateDraftRoll' | 'updateDraftDefect' | 'replaceDraftDefectPhoto'> & { roll: Inspection['rolls'][number]; rollIndex: number }) {
  return (
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
          <span className="text-[10px] font-bold text-gray-500">
            {editDraft.quantitySummary?.uom === 'Kgs' ? 'Weight (kg)' : 'Length (m)'}
          </span>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={editDraft.quantitySummary?.uom === 'Kgs' ? roll.weightKg || '' : roll.lengthYards}
            onChange={(event) => updateDraftRoll(
              roll.id,
              editDraft.quantitySummary?.uom === 'Kgs'
                ? { weightKg: event.target.value ? Number(event.target.value) : undefined }
                : { lengthYards: Number(event.target.value) }
            )}
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
          <span className="text-[10px] font-bold text-gray-500">
            {editDraft.quantitySummary?.uom === 'Kgs' ? 'Length (m)' : 'Weight (kg)'}
          </span>
          <input
            required={editDraft.quantitySummary?.uom === 'Meters' || editDraft.quantitySummary?.uom === 'Kgs'}
            type="number"
            min="0"
            step="0.01"
            value={editDraft.quantitySummary?.uom === 'Kgs' ? roll.lengthYards : roll.weightKg || ''}
            onChange={(event) => updateDraftRoll(
              roll.id,
              editDraft.quantitySummary?.uom === 'Kgs'
                ? { lengthYards: Number(event.target.value) }
                : { weightKg: event.target.value ? Number(event.target.value) : undefined }
            )}
            readOnly={editDraft.quantitySummary?.uom === 'Meters' || editDraft.quantitySummary?.uom === 'Kgs'}
            aria-readonly={editDraft.quantitySummary?.uom === 'Meters' || editDraft.quantitySummary?.uom === 'Kgs'}
            className={`w-full rounded-xl border px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${editDraft.quantitySummary?.uom === 'Meters' || editDraft.quantitySummary?.uom === 'Kgs'
              ? 'border-blue-100 bg-blue-50 text-blue-900 cursor-not-allowed'
              : 'border-gray-200 bg-gray-50'
              }`}
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
  );
}
