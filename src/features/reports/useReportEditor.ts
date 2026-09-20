import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Inspection } from '../../types';
import { compressEvidenceImage } from '../../utils/evidenceImage';
import { calculateRollLengthMeters, calculateRollWeightKg } from '../../utils/inspectionCalculations';
import { buildReportEdits } from './reportEdits';

export function useReportEditor(inspection: Inspection | undefined, canEditReport: boolean) {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const updateInspection = useStore(state => state.updateInspection);
  const [editDraft, setEditDraft] = React.useState<Inspection | null>(null);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const autoOpenedEditorRef = React.useRef(false);
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
        roll.id === rollId
          ? (() => {
            const nextRoll = { ...roll, ...updates };
            const gsm = Number(draft.gsm || 0);
            const width = Number(nextRoll.widthInches || 0);
            const uom = draft.quantitySummary?.uom;

            if (uom === 'Kgs') {
              if ('weightKg' in updates || 'widthInches' in updates) {
                const calculatedLength = calculateRollLengthMeters(
                  gsm,
                  width,
                  Number(nextRoll.weightKg || 0)
                );
                if (calculatedLength !== undefined) {
                  nextRoll.lengthYards = calculatedLength;
                }
              }
              return nextRoll;
            }

            if (uom === 'Meters') {
              if ('lengthYards' in updates || 'widthInches' in updates) {
                const calculatedWeight = calculateRollWeightKg(
                  gsm,
                  width,
                  Number(nextRoll.lengthYards || 0)
                );
                if (calculatedWeight !== undefined) {
                  nextRoll.weightKg = calculatedWeight;
                }
              }
              return nextRoll;
            }

            if ('weightKg' in updates && updates.weightKg !== undefined) {
              const calculatedLength = calculateRollLengthMeters(
                gsm,
                width,
                Number(updates.weightKg)
              );
              if (calculatedLength !== undefined) {
                nextRoll.lengthYards = calculatedLength;
              }
            } else if ('lengthYards' in updates || 'widthInches' in updates) {
              const calculatedWeight = calculateRollWeightKg(
                gsm,
                width,
                Number(nextRoll.lengthYards || 0)
              );
              if (calculatedWeight !== undefined) {
                nextRoll.weightKg = calculatedWeight;
              }
            }

            return nextRoll;
          })()
          : roll
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

    compressEvidenceImage(file)
      .then((photoUrl) => {
        updateDraftDefect(rollId, defectId, {
          photoUrl,
        });
      })
      .catch((error) => {
        console.error('Unable to process defect evidence photo', error);
        alert('Unable to process this image. Please try again.');
      });
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

  const saveReportEdits = async () => {
    if (!id || !editDraft || !canEditReport) return;

    setIsSavingEdit(true);

    try {
      await Promise.resolve(updateInspection(id, buildReportEdits(editDraft, inspection)));

      setEditDraft(null);
    } finally {
      setIsSavingEdit(false);
    }
  };

  return {
    editDraft,
    setEditDraft,
    isSavingEdit,
    openReportEditor,
    updateDraftField,
    updateDraftRoll,
    updateDraftDefect,
    replaceDraftDefectPhoto,
    replaceRepresentativeFabricImage,
    updateDraftQuantity,
    saveReportEdits
  };
}

export type ReportEditorState = ReturnType<typeof useReportEditor>;
