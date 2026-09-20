import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Defect, DefectType, Roll } from '../../types';
import { calculateRollLengthMeters, calculateRollWeightKg, getPassFailStatus } from '../../utils/inspectionCalculations';
import { calculateInspectionRollStats } from './inspectionCalculations';

export function useInspectionWorkflow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const updateInspection = useStore((state) => state.updateInspection);
  const photoEvidenceEnabled = useStore((state) => state.photoEvidenceEnabled);
  const setPhotoEvidenceEnabled = useStore((state) => state.setPhotoEvidenceEnabled);

  const inspection = inspections.find((i) => i.id === id);

  const [activeRollId, setActiveRollId] = useState<string | null>(null);
  const [showAddRoll, setShowAddRoll] = useState(false);
  const [showAddDefect, setShowAddDefect] = useState<{ rollId: string } | null>(null);

  const [defectComment, setDefectComment] = useState('');
  const [defectPhoto, setDefectPhoto] = useState<string | null>(null);
  const [addRollDraft, setAddRollDraft] = useState({
    lengthYards: '',
    widthInches: '',
    weightKg: '',
  });

  const updateAddRollMeasure = (
    field: 'lengthYards' | 'widthInches' | 'weightKg',
    value: string
  ) => {
    setAddRollDraft((draft) => {
      const next = { ...draft, [field]: value };
      const gsm = Number(inspection?.gsm || 0);
      const width = Number(next.widthInches);
      const length = Number(next.lengthYards);
      const weight = Number(next.weightKg);
      const uom = inspection?.quantitySummary?.uom;

      if (uom === 'Kgs') {
        if (field === 'weightKg' || (field === 'widthInches' && next.weightKg)) {
          const calculatedLength = calculateRollLengthMeters(gsm, width, weight);
          next.lengthYards = calculatedLength ? String(calculatedLength) : '';
        }
        return next;
      }

      if (uom === 'Meters') {
        if (field === 'lengthYards' || (field === 'widthInches' && next.lengthYards)) {
          const calculatedWeight = calculateRollWeightKg(gsm, width, length);
          next.weightKg = calculatedWeight ? String(calculatedWeight) : '';
        }
        return next;
      }

      if (field === 'weightKg') {
        const calculatedLength = calculateRollLengthMeters(gsm, width, weight);
        next.lengthYards = calculatedLength ? String(calculatedLength) : '';
      } else if (field === 'lengthYards' || (field === 'widthInches' && next.lengthYards)) {
        const calculatedWeight = calculateRollWeightKg(gsm, width, length);
        next.weightKg = calculatedWeight ? String(calculatedWeight) : '';
      } else if (field === 'widthInches' && next.weightKg) {
        const calculatedLength = calculateRollLengthMeters(gsm, width, weight);
        next.lengthYards = calculatedLength ? String(calculatedLength) : '';
      }

      return next;
    });
  };

  useEffect(() => {
    if (inspection && inspection.rolls.length > 0 && !activeRollId) {
      setActiveRollId(inspection.rolls[0].id);
    }
  }, [inspection, activeRollId]);


  const activeRoll = inspection?.rolls.find((r) => r.id === activeRollId);
  const isWeightPrimary = inspection?.quantitySummary?.uom === 'Kgs';
  const usesAutomaticRollMeasure =
    inspection?.quantitySummary?.uom === 'Meters' || isWeightPrimary;

  const handleUpdate = (updates: Partial<typeof inspection>) => {
    if (id) updateInspection(id, updates);
  };

  const handlePhotoEvidenceToggle = (enabled: boolean) => {
    setPhotoEvidenceEnabled(enabled);

    if (!enabled) {
      setDefectPhoto(null);
    }
  };

  const handleManualVerdict = (isPass: boolean) => {
    handleUpdate({ isPass, verdictOverride: true });
  };

  const completeInspection = () => {
    handleUpdate({ status: 'COMPLETED' });
    navigate(`/reports/${inspection.id}?edit=final`);
  };

  const addRoll = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const lengthYards = Number(addRollDraft.lengthYards);
    const widthInches = Number(addRollDraft.widthInches);
    const weightKg = Number(addRollDraft.weightKg);
    const uom = inspection?.quantitySummary?.uom;

    if (
      (uom === 'Meters' || uom === 'Kgs') &&
      (!lengthYards || !widthInches || !weightKg)
    ) {
      alert('Enter a valid quantity and width. GSM is also required to calculate the matching value.');
      return;
    }

    const newRoll: Roll = {
      id: crypto.randomUUID(),
      rollNumber: fd.get('rollNumber') as string,
      lengthYards,
      widthInches,
      weightKg,
      shade: fd.get('shade') as string,
      defects: [],
      status: 'PENDING',
      startTime: new Date().toISOString(),
    };

    const updatedRolls = [...inspection.rolls, newRoll];
    const { totalPoints, pointsPer100 } = calculateInspectionRollStats(updatedRolls);

    handleUpdate({
      rolls: updatedRolls,
      totalPoints,
      pointsPer100Yds: pointsPer100,
      isPass: inspection.verdictOverride
        ? inspection.isPass
        : getPassFailStatus(pointsPer100) === 'PASS',
    });

    setActiveRollId(newRoll.id);
    setShowAddRoll(false);
    setAddRollDraft({ lengthYards: '', widthInches: '', weightKg: '' });
  };

  const addDefect = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!showAddDefect) return;

    if (photoEvidenceEnabled && !defectPhoto) {
      alert('Please attach defect evidence photo');
      return;
    }

    const fd = new FormData(e.currentTarget);

    const newDefect: Defect = {
      id: crypto.randomUUID(),
      meterLocation: Number(fd.get('meterLocation')),
      type: fd.get('type') as DefectType,
      severity: Number(fd.get('severity')) as 1 | 2 | 3 | 4,
      comment: defectComment || '',
      photoUrl: photoEvidenceEnabled ? defectPhoto || '' : '',
      timestamp: new Date().toISOString(),
    };

    const updatedRolls = inspection.rolls.map((r) => {
      if (r.id === showAddDefect.rollId) {
        return {
          ...r,
          defects: [...r.defects, newDefect],
        };
      }

      return r;
    });

    const { totalPoints, pointsPer100 } = calculateInspectionRollStats(updatedRolls);

    handleUpdate({
      rolls: updatedRolls,
      totalPoints,
      pointsPer100Yds: pointsPer100,
      isPass: inspection.verdictOverride
        ? inspection.isPass
        : getPassFailStatus(pointsPer100) === 'PASS',
    });

    setDefectComment('');
    setDefectPhoto(null);
    setShowAddDefect(null);
  };

  return {
    inspection,
    navigate,
    activeRollId,
    setActiveRollId,
    showAddRoll,
    setShowAddRoll,
    showAddDefect,
    setShowAddDefect,
    defectComment,
    setDefectComment,
    defectPhoto,
    setDefectPhoto,
    addRollDraft,
    updateAddRollMeasure,
    activeRoll,
    isWeightPrimary,
    usesAutomaticRollMeasure,
    photoEvidenceEnabled,
    handlePhotoEvidenceToggle,
    handleManualVerdict,
    completeInspection,
    addRoll,
    addDefect
  };
}

export type InspectionWorkflow = ReturnType<typeof useInspectionWorkflow>;
