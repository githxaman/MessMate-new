import { useEffect, useState } from 'react';
import { mealAPI, foodWasteAPI, leaveAPI, feedbackAPI } from '../services/api';

const StaffDashboard = () => {
  const [demand, setDemand] = useState([]);
  const [wasteRecords, setWasteRecords] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const [demandRes, wasteRes, leaveRes, feedbackRes] = await Promise.all([
          mealAPI.getDemand({ date: today }),
          foodWasteAPI.getAll({ date: today }),
          leaveAPI.getAll({ status: 'pending' }),
          feedbackAPI.getAll(),
        ]);
        setDemand(demandRes.data.demand || []);
        setWasteRecords(wasteRes.data.records || []);
        setPendingLeaves(leaveRes.data.leaves?.length || 0);
        setRecentFeedback((feedbackRes.data.feedback || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container page-loading">Loading...</div>;

  const getServed = (mealType) =>
    wasteRecords.find((r) => r.mealType === mealType)?.studentsServed ?? '—';

  return (
    <div className="dashboard-page container">
      <div className="page-header">
        <h1>Staff Dashboard</h1>
        <p>Today&apos;s meal overview and operations</p>
      </div>

      <section className="dashboard-section">
        <h2>Today&apos;s Meal Overview</h2>
        <div className="overview-grid">
          {demand.map((d) => (
            <div key={d.mealType} className="overview-card">
              <h3>{d.mealType}</h3>
              <p>Expected: <strong>{d.expectedStudents}</strong></p>
              <p>Served: <strong>{getServed(d.mealType)}</strong></p>
              <p>🥗 Veg: {d.vegetarian} · 🍗 Non-Veg: {d.nonVegetarian}</p>
              <p className="text-muted">Recommended: {d.recommendedPreparation}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Pending Leaves</p>
          <p className="stat-value">{pendingLeaves}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">On Leave Today</p>
          <p className="stat-value">{demand[0]?.onApprovedLeave || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Total Registered</p>
          <p className="stat-value">{demand[0]?.totalRegistered || 0}</p>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Recent Feedback</h2>
        <div className="feedback-list">
          {recentFeedback.map((fb) => (
            <div key={fb._id} className="feedback-item">
              <strong>{fb.userId?.name}</strong> — {'★'.repeat(fb.rating)}
              <p>{fb.comment || 'No comment'}</p>
            </div>
          ))}
          {recentFeedback.length === 0 && <p className="text-muted">No recent feedback</p>}
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;
