import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { foodWasteAPI, leaveAPI, mealAPI, userAPI } from '../services/api';

const todayDate = () => {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
};

const mealLabels = {
  breakfast: { label: 'Breakfast', icon: '🌅' },
  lunch: { label: 'Lunch', icon: '☀️' },
  dinner: { label: 'Dinner', icon: '🌙' },
};

const managementLinks = [
  { to: '/admin/users', icon: '🎓', title: 'Students', description: 'Review accounts and access' },
  { to: '/admin/staff', icon: '👥', title: 'Staff & admins', description: 'Manage team roles' },
  { to: '/admin/verification', icon: '🛡️', title: 'Student verification', description: 'Review roster matches' },
  { to: '/staff/menu', icon: '📋', title: 'Menu management', description: 'Publish daily menus' },
  { to: '/staff/attendance', icon: '🍽️', title: 'Meal attendance', description: 'View check-ins' },
  { to: '/leave', icon: '📝', title: 'Leave requests', description: 'Approve or decline requests' },
  { to: '/food-waste', icon: '♻️', title: 'Food waste', description: 'Record meal leftovers' },
  { to: '/reports', icon: '📈', title: 'Reports & analytics', description: 'Track dining performance' },
  { to: '/admin/settings', icon: '⚙️', title: 'System settings', description: 'Review configuration' },
];

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || 'Unable to load the admin dashboard.';

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    registeredStudents: 0,
    vegetarian: 0,
    nonVegetarian: 0,
    staff: 0,
    admins: 0,
    inactive: 0,
  });
  const [demand, setDemand] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, demandRes, leaveRes, analyticsRes, verificationRes] = await Promise.all([
        userAPI.getAll(),
        mealAPI.getDemand({ date: todayDate() }),
        leaveAPI.getAll({ status: 'pending' }),
        foodWasteAPI.getAnalytics(),
        userAPI.getAll({ role: 'student', isVerified: false }),
      ]);

      const users = usersRes.data.users || [];
      const registeredStudents = users.filter((user) => user.role === 'student');
      const activeStudents = users.filter(
        (user) => user.role === 'student' && user.isActive !== false
      );
      setStats({
        students: activeStudents.length,
        registeredStudents: registeredStudents.length,
        vegetarian: registeredStudents.filter((user) => user.foodPreference === 'vegetarian').length,
        nonVegetarian: registeredStudents.filter((user) => user.foodPreference === 'non-vegetarian').length,
        staff: users.filter((user) => user.role === 'staff' && user.isActive !== false).length,
        admins: users.filter((user) => user.role === 'admin' && user.isActive !== false).length,
        inactive: users.filter((user) => user.isActive === false).length,
      });
      setDemand(demandRes.data.demand || []);
      setPendingLeaves((leaveRes.data.leaves || []).length);
      setAnalytics(analyticsRes.data);
      setPendingVerification((verificationRes.data.users || []).length);
    } catch (loadError) {
      console.error('Failed to load admin dashboard:', loadError);
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const expectedTotal = demand.reduce((total, meal) => total + (meal.expectedStudents || 0), 0);
  const recommendedTotal = demand.reduce((total, meal) => total + (meal.recommendedPreparation || 0), 0);
  const vegetarianPercent = stats.registeredStudents
    ? (stats.vegetarian / stats.registeredStudents) * 100
    : 0;

  return (
    <div className="admin-dashboard container">
      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">MESSMATE ADMINISTRATION</span>
          <h1>Good day{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''} 👋</h1>
          <p>Here’s your dining operations overview for {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}.</p>
        </div>
        <button className="btn btn-outline admin-refresh" type="button" onClick={loadDashboard} disabled={loading}>
          <span aria-hidden="true">↻</span> {loading ? 'Refreshing…' : 'Refresh data'}
        </button>
      </section>

      {error && (
        <div className="admin-error" role="alert">
          <div>
            <strong>Dashboard data couldn’t be loaded</strong>
            <p>{error}</p>
          </div>
          <button className="btn btn-sm btn-outline" type="button" onClick={loadDashboard} disabled={loading}>
            Try again
          </button>
        </div>
      )}

      <section className="admin-stat-grid" aria-label="System summary">
        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-green">🎓</span>
          <div>
            <p>Registered students</p>
            <strong>{loading || error ? '—' : stats.registeredStudents}</strong>
          </div>
          <Link to="/admin/users" aria-label="Manage students">↗</Link>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-blue">👥</span>
          <div><p>Mess team</p><strong>{loading || error ? '—' : stats.staff + stats.admins}</strong></div>
          <Link to="/admin/staff" aria-label="Manage staff and admins">↗</Link>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-orange">📝</span>
          <div><p>Pending leave requests</p><strong>{loading || error ? '—' : pendingLeaves}</strong></div>
          <Link to="/leave" aria-label="Review leave requests">↗</Link>
        </article>
        <article className="admin-stat-card">
          <span className="admin-stat-icon admin-stat-eco">♻️</span>
          <div><p>Food wasted today</p><strong>{loading || error ? '—' : analytics?.today?.foodWasted ?? 0}</strong></div>
          <Link to="/reports" aria-label="View waste reports">↗</Link>
        </article>
      </section>

      <div className="admin-dashboard-columns">
        <section className="admin-panel admin-demand-panel">
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">TODAY’S KITCHEN</span>
              <h2>Meal demand</h2>
            </div>
            <Link to="/reports?tab=demand" className="admin-text-link">View reports <span aria-hidden="true">→</span></Link>
          </div>

          {demand.length > 0 ? (
            <div className="admin-meal-list">
              {demand.map((meal) => {
                const mealInfo = mealLabels[meal.mealType] || { label: meal.mealType, icon: '🍽️' };
                const expected = meal.expectedStudents || 0;
                const total = meal.totalRegistered || expected;
                const percent = total ? Math.min(100, (expected / total) * 100) : 0;
                return (
                  <article className="admin-meal-row" key={meal.mealType}>
                    <div className="admin-meal-title">
                      <span>{mealInfo.icon}</span>
                      <div><h3>{mealInfo.label}</h3><p>{meal.onApprovedLeave || 0} students on approved leave</p></div>
                    </div>
                    <div className="admin-meal-count">
                      <strong>{meal.confirmedEating ?? expected}</strong><span>confirmed to eat</span>
                    </div>
                    <div className="admin-meal-count admin-recommended">
                      <strong>{meal.recommendedPreparation ?? expected}</strong><span>prep target</span>
                    </div>
                    <div className="admin-demand-bar" aria-label={`${Math.round(percent)}% of registered students expected`}>
                      <span style={{ width: `${percent}%` }} />
                    </div>
                    <p className="admin-meal-mix">
                      <span>🥗 {meal.vegetarian || 0} veg confirmed</span>
                      <span>🍗 {meal.nonVegetarian || 0} non-veg confirmed</span>
                      <span>✕ {meal.notTaking || 0} not eating</span>
                      <span>… {meal.notResponded ?? Math.max(0, total - (meal.onApprovedLeave || 0) - (meal.confirmedEating ?? expected) - (meal.notTaking || 0))} no response</span>
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty-state">
              {loading ? 'Loading meal demand…' : error ? 'Meal demand is unavailable.' : 'No meal demand data is available yet.'}
            </div>
          )}
          <div className="admin-demand-summary">
            <span>Meal servings expected <strong>{loading || error ? '—' : expectedTotal}</strong></span>
            <span>Total prep target <strong>{loading || error ? '—' : recommendedTotal}</strong></span>
          </div>
        </section>

        <section className="admin-panel admin-attention-panel">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">NEEDS ATTENTION</span><h2>Review queue</h2></div>
          </div>
          <Link to="/admin/verification" className="admin-queue-item">
            <span className="admin-queue-icon admin-stat-blue">🛡️</span>
            <span><strong>Student verification</strong><small>Unverified student accounts</small></span>
            <b>{loading || error ? '—' : pendingVerification}</b>
            <span className="admin-queue-arrow" aria-hidden="true">→</span>
          </Link>
          <Link to="/leave" className="admin-queue-item">
            <span className="admin-queue-icon admin-stat-orange">📝</span>
            <span><strong>Leave requests</strong><small>Waiting for a decision</small></span>
            <b>{loading || error ? '—' : pendingLeaves}</b>
            <span className="admin-queue-arrow" aria-hidden="true">→</span>
          </Link>
          <div className="admin-preference-summary">
            <div className="admin-preference-heading">
              <span className="admin-eyebrow">REGISTERED STUDENTS</span>
              <strong>{loading || error ? '—' : stats.registeredStudents}</strong>
            </div>
            <div className="admin-preference-bar" aria-label={`${Math.round(vegetarianPercent)}% vegetarian students`}>
              <span style={{ width: `${vegetarianPercent}%` }} />
            </div>
            <div className="admin-preference-counts">
              <span>🥗 Vegetarian <strong>{loading || error ? '—' : stats.vegetarian}</strong></span>
              <span>🍗 Non-vegetarian <strong>{loading || error ? '—' : stats.nonVegetarian}</strong></span>
            </div>
            <Link to="/admin/users" className="admin-text-link">View student accounts →</Link>
          </div>
          <div className="admin-waste-note">
            <span aria-hidden="true">🌱</span>
            <p><strong>{error ? '—' : analytics?.today?.wastePercentage ?? '—'}% waste today</strong><br />Track daily records to keep kitchen preparation on target.</p>
          </div>
        </section>
      </div>

      <section className="admin-management-section">
        <div className="admin-section-heading">
          <div><span className="admin-eyebrow">CONTROL CENTER</span><h2>Manage MessMate</h2></div>
          <Link to="/admin/settings" className="admin-text-link">System settings <span aria-hidden="true">→</span></Link>
        </div>
        <div className="admin-management-grid">
          {managementLinks.map((link) => (
            <Link className="admin-management-card" to={link.to} key={link.to}>
              <span className="admin-management-icon">{link.icon}</span>
              <span><strong>{link.title}</strong><small>{link.description}</small></span>
              <span className="admin-management-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="admin-bottom-summary" aria-label="More system metrics">
        <div><span>📊</span><p>Weekly food waste<strong>{error ? '—' : analytics?.weekly?.totalWaste ?? '—'}</strong></p></div>
        <div><span>💰</span><p>Estimated savings today<strong>{error ? '—' : `₹${analytics?.estimatedSavings ?? '—'}`}</strong></p></div>
        <div><span>🏷️</span><p>Inactive accounts<strong>{loading || error ? '—' : stats.inactive}</strong></p></div>
      </section>
    </div>
  );
};

export default AdminDashboard;
