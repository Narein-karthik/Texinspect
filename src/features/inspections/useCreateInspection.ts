import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { DetailedResultStatus, FabricConstruction, Inspection } from '../../types';
import { generateCertificateRef } from '../../utils/certificate';
import { getDefaultFabricConstruction } from '../../utils/fabricConstruction';

export function useCreateInspection() {
  const navigate = useNavigate();
  const addInspection = useStore((state) => state.addInspection);
  const currentUser = useStore((state) => state.currentUser);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<Partial<Inspection>>({
    customerName: '',
    supplierName: '',
    orderNumber: '',
    styleRef: '',
    fabricType: '',
    color: '',
    gsm: 0,
    composition: '',
    fabricConstruction: {},
    quantitySummary: { uom: 'Meters' },
    season: '',
    inspectorName: currentUser?.name || 'Inspector',
    inspectorId: currentUser?.id || '',
    inspectionDate: new Date().toISOString(),
    rolls: [],
    status: 'DRAFT',
    totalPoints: 0,
    pointsPer100Yds: 0,
    isPass: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'fabricType') {
        return {
          ...prev,
          fabricType: value,
          fabricConstruction: getDefaultFabricConstruction(value, prev.fabricConstruction),
        };
      }

      return { ...prev, [name]: name === 'gsm' ? Number(value) : value };
    });
  };

  const handleConstructionChange = (
    name: keyof FabricConstruction,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      fabricConstruction: {
        ...getDefaultFabricConstruction(prev.fabricType, prev.fabricConstruction),
        [name]: name === 'gsm' ? Number(value) : value,
      },
      gsm: name === 'gsm' ? Number(value) : prev.gsm,
    }));
  };

  const handleQuantityChange = (
    name: keyof NonNullable<Inspection['quantitySummary']>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        [name]: value ? Number(value) : undefined,
      },
    }));
  };

  const handleQuantityUomChange = (
    value: NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>
  ) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        uom: value,
        customUom: value === 'Others' ? prev.quantitySummary?.customUom : undefined,
      },
    }));
  };

  const handleCustomUomChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      quantitySummary: {
        ...prev.quantitySummary,
        uom: 'Others',
        customUom: value,
      },
    }));
  };

  const handleQualityCheckpointChange = (
    checkpoint: string,
    updates: { result?: DetailedResultStatus; remarks?: string }
  ) => {
    setFormData((prev) => ({
      ...prev,
      detailedResults: {
        ...prev.detailedResults,
        [checkpoint]: {
          result: prev.detailedResults?.[checkpoint]?.result || 'N/A',
          remarks: prev.detailedResults?.[checkpoint]?.remarks || '',
          ...updates,
        },
      },
    }));
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSave = () => {
    const id = crypto.randomUUID();
    const inspectionDate = formData.inspectionDate || new Date().toISOString();
    const newInspection = {
      ...formData,
      id,
      inspectionDate,
      certificateRef: generateCertificateRef(
        formData.customerName,
        formData.supplierName,
        inspectionDate
      ),
      fabricConstruction: getDefaultFabricConstruction(
        formData.fabricType,
        formData.fabricConstruction
      ),
    } as Inspection;
    addInspection(newInspection);
    navigate(`/inspection/${id}`);
  };

  const steps = [
    { id: 1, title: 'Order Info' },
    { id: 2, title: 'Fabric Details' },
    { id: 3, title: 'Initial Qty' },
    { id: 4, title: 'Summary' },
    { id: 5, title: 'Quality Checks' },
  ];

  return {
    navigate,
    step,
    formData,
    handleInputChange,
    handleConstructionChange,
    handleQuantityChange,
    handleQuantityUomChange,
    handleCustomUomChange,
    handleQualityCheckpointChange,
    handleNext,
    handleBack,
    handleSave,
    steps
  };
}

export type CreateInspectionForm = ReturnType<typeof useCreateInspection>;
