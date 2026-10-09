import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, mealAPI, leaveAPI } from '../services/api';
import MenuCard from '../components/MenuCard';
import MealCard from '../components/MealCard';

const todayDate = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const prefLabel = {
  vegetarian: '🥗 Vegetarian',
  'non-vegetarian': '🍗 Non-Vegetarian',
};

const StudentDashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [meals, setMeals] = useState([]);
  const [upcomingLeave, setUpcomingLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [menuRes, mealRes, leaveRes] = await Promise.all([
        menuAPI.getAll({ date: todayDate() }),
        mealAPI.getToday(),
        leaveAPI.getUpcoming(),
      ]);
      setMenus(menuRes.data?.menus || []);
      setMeals(mealRes.data?.meals || []);
      setUpcomingLeave(leaveRes.data?.leave || null);
    } catch (loadError) {
      console.error('Failed to load student dashboard:', loadError);
      setError(loadError.response?.data?.message || 'Could not refresh your dining overview. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  // Verification Gate for Students
  if (profile?.role === 'student' && !profile?.isVerified) {
    return (
      <div className="container main-content">
        <div className="unverified-banner">
          <div className="unverified-icon">⚠️</div>
          <h2>Verification Required</h2>
          <p>Your college details could not be verified. Please contact the Mess Administrator.</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/profile" className="btn btn-outline">
              Review Submitted Details in Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Welcome, {profile?.name?.split(' ')[0] || 'Student'}! 👋</h1>
          <p className="dashboard-subtitle">
            Hostel: <strong>{profile?.hostel || 'Hostel A'}</strong> | Room: <strong>{profile?.roomNumber || 'N/A'}</strong> | Preference: <strong>{prefLabel[profile?.foodPreference] || '🥗 Vegetarian'}</strong>
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => loadDashboard(true)} disabled={refreshing}>
          <span aria-hidden="true">↻</span> {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error dashboard-alert" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => loadDashboard(true)} disabled={refreshing}>
            Try again
          </button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Stat / Action Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orange">🍽️</div>
            <div className="stat-info">
              <div className="stat-value">{meals.filter((meal) => meal.status).length}/3</div>
              <div className="stat-label">Meal Checks Completed</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-green">🥗</div>
            <div className="stat-info">
              <div className="stat-value">{profile?.foodPreference === 'vegetarian' ? 'Veg' : 'Non-Veg'}</div>
              <div className="stat-label">Dietary Preference</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-blue">📝</div>
            <div className="stat-info">
              <div className="stat-value">{upcomingLeave ? 'Active' : 'None'}</div>
              <div className="stat-label">Upcoming Leave</div>
            </div>
          </div>
        </div>

        <section className="dashboard-section">
          <h2>Today&apos;s Meal Checks</h2>
          <div className="meal-cards-row">
            {meals.map((m) => (
              <MealCard
                key={m.mealType}
                mealType={m.mealType}
                checked={m.checked}
                status={m.status}
                onCheck={() => navigate('/meal-check')}
              />
            ))}
            {!meals.length && <p className="text-muted">Your meal check schedule will appear here.</p>}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-heading-row">
            <div>
              <span className="student-section-kicker">YOUR DINING SHORTCUTS</span>
              <h2>Quick Actions</h2>
            </div>
            <span className="student-today-badge">📅 {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="quick-actions">
            <Link to="/meal-check" className="action-btn">✓ Check Today's Meal</Link>
            <Link to="/menu" className="action-btn">📋 View Today's Menu</Link>
            <Link to="/menu?view=weekly" className="action-btn">📅 View Weekly Menu</Link>
            <Link to="/leave" className="action-btn">📝 Apply Leave</Link>
            <Link to="/feedback" className="action-btn">⭐ Give Feedback</Link>
          </div>
        </section>

        {upcomingLeave ? (
          <section className="dashboard-section alert-info-box">
            <h3>📅 Upcoming Approved Leave</h3>
            <p>
              {new Date(upcomingLeave.fromDate).toLocaleDateString()} –{' '}
              {new Date(upcomingLeave.toDate).toLocaleDateString()} ({upcomingLeave.status})
            </p>
          </section>
        ) : (
          <section className="student-leave-prompt">
            <span aria-hidden="true">✈️</span>
            <div><strong>Going away?</strong><p>Apply for leave so the kitchen can plan the right portions.</p></div>
            <Link to="/leave" className="btn btn-outline btn-sm">Apply for leave</Link>
          </section>
        )}

        <section className="dashboard-section full-width">
          <div className="section-heading-row">
            <div>
              <span className="student-section-kicker">MADE FOR YOUR PREFERENCE</span>
              <h2>Today&apos;s Menu</h2>
            </div>
            <Link className="admin-text-link" to="/menu">Full menu →</Link>
          </div>
          {menus.length ? (
            <div className="menu-grid">
              {menus.map((menu) => (
                <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
              ))}
            </div>
          ) : (
            <div className="student-empty-menu">
              <span aria-hidden="true">🍲</span>
              <p>No menu published for today yet.</p>
              <Link to="/menu?view=weekly">Take a look at this week’s menu →</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
