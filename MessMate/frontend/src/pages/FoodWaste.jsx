import { useEffect, useState } from 'react';
import { foodWasteAPI, mealAPI } from '../services/api';

const FoodWaste = () => {
  const [demand, setDemand] = useState([]);
  const [records, setRecords] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mealType: 'lunch',
    foodPrepared: '',
    studentsServed: '',
    remainingFood: '',
    foodWasted: '',
    expectedStudents: '',
    vegServed: '',
    nonVegServed: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const [demandRes, recordsRes, analyticsRes] = await Promise.all([
        mealAPI.getDemand({ date: today }).catch(() => ({ data: { demand: [] } })),
        foodWasteAPI.getAll({ date: today }).catch(() => ({ data: { records: [] } })),
        foodWasteAPI.getAnalytics().catch(() => ({ data: null })),
      ]);
      setDemand(demandRes.data?.demand || []);
      setRecords(recordsRes.data?.records || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await foodWasteAPI.create({
        ...form,
        foodPrepared: Number(form.foodPrepared),
        studentsServed: Number(form.studentsServed),
        remainingFood: Number(form.remainingFood) || 0,
        foodWasted: Number(form.foodWasted) || 0,
        expectedStudents: Number(form.expectedStudents) || 0,
        vegServed: Number(form.vegServed) || 0,
        nonVegServed: Number(form.nonVegServed) || 0,
      });
      setMessage('Food waste record saved successfully!');
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="food-waste-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>♻️ Smart Food Demand & Waste Management</h1>
          <p className="dashboard-subtitle">
            Know the Demand → Prepare Smart → Waste Less
          </p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}

      {/* Analytics Highlights */}
      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orange">🗑️</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.today?.foodWasted || 0}</div>
              <div className="stat-label">Today's Waste</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">🍽️</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.today?.mealsServed || 0}</div>
              <div className="stat-label">Students Served Today</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">📊</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.today?.wastePercentage || 0}%</div>
              <div className="stat-label">Waste Percentage</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-purple">📅</div>
            <div className="stat-info">
              <div className="stat-value">{analytics.weekly?.totalWaste || 0}</div>
              <div className="stat-label">Weekly Waste Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Demand & Smart Quantity Recommendation Section */}
      <section className="table-card" style={{ marginBottom: '2rem' }}>
        <div className="table-header">
          <h3>📉 Smart Food Demand Calculation (Today)</h3>
        </div>

        <div className="demand-grid">
          {demand.map((d) => (
            <div key={d.mealType} className="demand-card" style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '1.25rem', borderRadius: '12px' }}>
              <h3 style={{ textTransform: 'capitalize', color: '#ea580c', marginBottom: '0.75rem' }}>
                {d.mealType === 'breakfast' ? '☕ Breakfast' : d.mealType === 'lunch' ? '🍛 Lunch' : '🍲 Dinner'}
              </h3>
              <p style={{ margin: '0.25rem 0' }}>
                👥 <strong>Total Students:</strong> {d.totalRegistered || 200}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                ✈️ <strong>Approved Leave:</strong> {d.onApprovedLeave || 0}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                🍽️ <strong>Expected Students:</strong> <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{d.expectedStudents}</strong>
              </p>

              <hr style={{ margin: '0.5rem 0', borderColor: '#fed7aa' }} />

              <p style={{ margin: '0.25rem 0' }}>
                🥗 <strong>Vegetarian Expected:</strong> {d.vegetarian}
              </p>
              <p style={{ margin: '0.25rem 0' }}>
                🍗 <strong>Non-Vegetarian Expected:</strong> {d.nonVegetarian}
              </p>

              <div style={{ marginTop: '0.75rem', padding: '0.625rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #f97316' }}>
                <strong style={{ color: '#ea580c', display: 'block' }}>💡 Recommended Food Preparation:</strong>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ea580c' }}>
                  {d.recommendedPreparation} Portions
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>
                  (Includes {d.safetyMarginPercent}% safety margin)
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Record Food Waste Form */}
      <form onSubmit={handleSubmit} className="table-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
          📝 Record Food Waste Log
        </h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="wasteDate">Date *</label>
            <input
              id="wasteDate"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="wasteMeal">Meal Type *</label>
            <select
              id="wasteMeal"
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="foodPrepared">Food Prepared (Portions/Kg) *</label>
            <input
              id="foodPrepared"
              type="number"
              placeholder="e.g. 180"
              value={form.foodPrepared}
              onChange={(e) => setForm({ ...form, foodPrepared: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="studentsServed">Students Served *</label>
            <input
              id="studentsServed"
              type="number"
              placeholder="e.g. 165"
              value={form.studentsServed}
              onChange={(e) => setForm({ ...form, studentsServed: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="remainingFood">Remaining Surplus Food</label>
            <input
              id="remainingFood"
              type="number"
              placeholder="e.g. 15"
              value={form.remainingFood}
              onChange={(e) => setForm({ ...form, remainingFood: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label htmlFor="foodWasted">Food Wasted (Portions/Kg)</label>
            <input
              id="foodWasted"
              type="number"
              placeholder="e.g. 5"
              value={form.foodWasted}
              onChange={(e) => setForm({ ...form, foodWasted: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-eco" disabled={loading} style={{ marginTop: '1rem' }}>
          {loading ? 'Saving Record...' : 'Save Waste Record'}
        </button>
      </form>

      {/* Waste Records Table */}
      <div className="table-card">
        <div className="table-header">
          <h3>Today's Food Waste Records Log</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Meal Type</th>
                <th>Food Prepared</th>
                <th>Students Served</th>
                <th>Remaining Food</th>
                <th>Food Wasted</th>
                <th>Waste %</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No waste records logged for today yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const pct = r.foodPrepared ? ((r.foodWasted / r.foodPrepared) * 100).toFixed(1) : 0;
                  return (
                    <tr key={r._id}>
                      <td style={{ textTransform: 'capitalize', fontWeight: '700' }}>{r.mealType}</td>
                      <td>{r.foodPrepared}</td>
                      <td>{r.studentsServed}</td>
                      <td>{r.remainingFood}</td>
                      <td>
                        <strong style={{ color: r.foodWasted > 10 ? '#dc2626' : '#059669' }}>
                          {r.foodWasted}
                        </strong>
                      </td>
                      <td>
                        <span className={`status-badge ${pct > 10 ? 'badge-rejected' : 'success'}`}>
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FoodWaste;
