import {
  ImagePlus
} from 'lucide-react';
import type { ReportEditorState } from '../useReportEditor';

export function ReportImageField({ editDraft, replaceRepresentativeFabricImage }: Pick<ReportEditorState, 'editDraft' | 'replaceRepresentativeFabricImage'>) {
  return (
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
  );
}
