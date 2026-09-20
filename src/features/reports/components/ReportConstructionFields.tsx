import { constructionFieldsByType } from '../../../constants/fabric';
import { cn } from '../../../utils/classNames';
import { getDefaultFabricConstruction } from '../../../utils/fabricConstruction';
import type { ReportEditorState } from '../useReportEditor';

export function ReportConstructionFields({ editDraft, setEditDraft }: Pick<ReportEditorState, 'editDraft' | 'setEditDraft'>) {
  return (
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
  );
}
