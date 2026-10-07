import { useEffect, useState } from 'react';
import { analyticsAPI, foodWasteAPI } from '../services/api';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [analyticsRes, recordsRes] = await Promise.all([
          analyticsAPI.get(),
          foodWasteAPI.getAll({ period: 'month' }),
        ]);
        setAnalytics(analyticsRes.data);
        setRecords(recordsRes.data.records || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="container page-loading">Loading reports...</div>;

  return (
    <div className="reports-page container">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Today&apos;s Waste</p>
          <p className="stat-value">{analytics?.today?.foodWasted || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Food Prepared Today</p>
          <p className="stat-value">{analytics?.today?.foodPrepared || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Meals Served Today</p>
          <p className="stat-value">{analytics?.today?.mealsServed || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Waste Percentage</p>
          <p className="stat-value">{analytics?.today?.wastePercentage || 0}%</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Weekly Total Waste</p>
          <p className="stat-value">{analytics?.weekly?.totalWaste || 0}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Most Wasted Meal</p>
          <p className="stat-value stat-value-sm">{analytics?.monthly?.mostWastedMeal || 'N/A'}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Avg Daily Waste (7d)</p>
          <p className="stat-value">{analytics?.weekly?.avgDailyWaste || 0}</p>
        </div>
        <div className="stat-card highlight">
          <p className="stat-label">Est. Savings Today</p>
          <p className="stat-value">{analytics?.estimatedSavings || 0}</p>
        </div>
      </div>

      <div className="table-card">
        <h2>Monthly Waste Records</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Meal</th>
                <th>Prepared</th>
                <th>Served</th>
                <th>Wasted</th>
                <th>Waste %</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.mealType}</td>
                  <td>{r.foodPrepared}</td>
                  <td>{r.studentsServed}</td>
                  <td>{r.foodWasted}</td>
                  <td>
                    {r.foodPrepared
                      ? `${((r.foodWasted / r.foodPrepared) * 100).toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
