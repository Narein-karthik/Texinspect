import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Inspection } from '../../types';

export function useReportsList() {
  const navigate = useNavigate();

  const inspections = useStore((state) => state.inspections);
  const currentUser = useStore((state) => state.currentUser);
  const deleteInspection = useStore((state) => state.deleteInspection);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInspector, setSelectedInspector] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportToDelete, setReportToDelete] = useState<Inspection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const inspectors = useMemo(
    () => Array.from(new Set(inspections.map((inspection) => inspection.inspectorName).filter(Boolean))).sort(),
    [inspections]
  );

  const customers = useMemo(
    () => Array.from(new Set(inspections.map((inspection) => inspection.customerName).filter(Boolean))).sort(),
    [inspections]
  );

  const filteredInspections = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inspections.filter((inspection) => {
      const inspectionDate = inspection.inspectionDate.slice(0, 10);
      const searchableValues = [
        inspection.customerName,
        inspection.inspectorName,
        inspection.styleRef,
        inspection.orderNumber,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!normalizedSearch || searchableValues.includes(normalizedSearch)) &&
        (!selectedInspector || inspection.inspectorName === selectedInspector) &&
        (!selectedCustomer || inspection.customerName === selectedCustomer) &&
        (!startDate || inspectionDate >= startDate) &&
        (!endDate || inspectionDate <= endDate)
      );
    });
  }, [endDate, inspections, searchTerm, selectedCustomer, selectedInspector, startDate]);

  const hasActiveFilters = Boolean(searchTerm || selectedInspector || selectedCustomer || startDate || endDate);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInspector('');
    setSelectedCustomer('');
    setStartDate('');
    setEndDate('');
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;

    setIsDeleting(true);

    try {
      await deleteInspection(reportToDelete.id);
      setReportToDelete(null);
    } catch (error) {
      console.error('Unable to delete report', error);
      alert(error instanceof Error ? error.message : 'Unable to delete this report. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    navigate,
    inspections,
    currentUser,
    searchTerm,
    setSearchTerm,
    selectedInspector,
    setSelectedInspector,
    selectedCustomer,
    setSelectedCustomer,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    reportToDelete,
    setReportToDelete,
    isDeleting,
    inspectors,
    customers,
    filteredInspections,
    hasActiveFilters,
    clearFilters,
    confirmDelete
  };
}
