import type { FabricConstruction, Inspection } from '../types';

export const constructionFieldsByType: Record<string, Array<{ name: keyof FabricConstruction; label: string; type?: string }>> = {
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

export const initialQuantityFields: Array<{
  name: keyof NonNullable<Inspection['quantitySummary']>;
  label: string;
}> = [
    { name: 'orderedQty', label: 'Ordered Qty' },
    { name: 'producedQty', label: 'Produced Qty' },
    { name: 'offeredQty', label: 'Presented Qty' },
    { name: 'producedRolls', label: 'Produced Rolls' },
    { name: 'offeredRolls', label: 'Presented Rolls' },
  ];

export const quantityUomOptions: Array<NonNullable<NonNullable<Inspection['quantitySummary']>['uom']>> = [
  'Meters',
  'Kgs',
  'Pcs',
  'Others',
];

