import { useEffect, useState } from 'react';
import { userAPI, mealAPI, leaveAPI, foodWasteAPI } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, staff: 0, admins: 0 });
  const [demand, setDemand] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const [usersRes, demandRes, leaveRes, analyticsRes] = await Promise.all([
          userAPI.getAll(),
          mealAPI.getDemand({ date: today }),
          leaveAPI.getAll({ status: 'pending' }),
          foodWasteAPI.getAnalytics(),
        ]);
        const users = usersRes.data.users || [];
        setStats({
          students: users.filter((u) => u.role === 'student').length,
          staff: users.filter((u) => u.role === 'staff').length,
          admins: users.filter((u) => u.role === 'admin').length,
        });
        setDemand(demandRes.data.demand || []);
        setPendingLeaves(leaveRes.data.leaves?.length || 0);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container page-loading">Loading...</div>;

  return (
    <div className="dashboard-page container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Complete system overview and control</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Students</p>
          <p className="stat-value">{stats.students}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Staff</p>
          <p className="stat-value">{stats.staff}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Pending Leaves</p>
          <p className="stat-value">{pendingLeaves}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Today&apos;s Waste</p>
          <p className="stat-value">{analytics?.today?.foodWasted || 0}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Meal Demand Overview</h2>
        <div className="demand-grid">
          {demand.map((d) => (
            <div key={d.mealType} className="demand-card">
              <h3>{d.mealType}</h3>
              <p>Expected: {d.expectedStudents}</p>
              <p>🥗 {d.vegetarian} · 🍗 {d.nonVegetarian}</p>
              <p>Recommended: {d.recommendedPreparation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
