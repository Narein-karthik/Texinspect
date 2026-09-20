import React from 'react';
import { printReport } from './printReport';

export function useReportPrint() {
  const [isPrinting, setIsPrinting] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setIsPrinting(true);

    try {
      await printReport(reportRef.current);
    } finally {
      window.setTimeout(() => setIsPrinting(false), 800);
    }
  };

  return { isPrinting, reportRef, handleDownloadPdf };
}
