import { useAuth } from '../context/AuthContext';
import StudentDashboard from './Dashboard';
import StaffDashboard from './StaffDashboard';

const DashboardRouter = () => {
  const { role } = useAuth();
  if (role === 'staff') return <StaffDashboard />;
  return <StudentDashboard />;
};

export default DashboardRouter;
