import { AdminDashboard } from '../features/dashboard/AdminDashboard';
import { InspectorDashboard } from '../features/dashboard/InspectorDashboard';
import { useStore } from '../store';

export function Dashboard() {
  const inspections = useStore(state => state.inspections);
  const currentUser = useStore(state => state.currentUser);
  return currentUser?.role === 'ADMIN'
    ? <AdminDashboard inspections={inspections} />
    : <InspectorDashboard inspections={inspections} />;
}
