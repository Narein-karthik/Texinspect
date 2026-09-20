

function firstThreeClean(value?: string) {
  const cleaned = (value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return cleaned.slice(0, 3).padEnd(3, 'X');
}

function formatDateRef(dateValue?: string) {
  const date = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(date.getTime())) {
    return formatDateRef(new Date().toISOString());
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}${month}${year}`;
}

export function generateCertificateRef(
  customerName?: string,
  supplierName?: string,
  inspectionDate?: string
) {
  return `${firstThreeClean(customerName)}${firstThreeClean(supplierName)}${formatDateRef(inspectionDate)}`;
}

export function getCertificateRef(inspection: {
  certificateRef?: string;
  customerName?: string;
  supplierName?: string;
  inspectionDate?: string;
}) {
  return inspection.certificateRef ||
    generateCertificateRef(
      inspection.customerName,
      inspection.supplierName,
      inspection.inspectionDate
    );
}
