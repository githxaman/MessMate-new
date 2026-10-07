import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI, mealAPI, leaveAPI } from '../services/api';
import MenuCard from '../components/MenuCard';
import MealCard from '../components/MealCard';

const prefLabel = {
  vegetarian: '🥗 Vegetarian',
  'non-vegetarian': '🍗 Non-Vegetarian',
};

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [menus, setMenus] = useState([]);
  const [meals, setMeals] = useState([]);
  const [upcomingLeave, setUpcomingLeave] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [menuRes, mealRes, leaveRes] = await Promise.all([
          menuAPI.getAll({ date: today }).catch(() => ({ data: { menus: [] } })),
          mealAPI.getToday().catch(() => ({ data: { meals: [] } })),
          leaveAPI.getUpcoming().catch(() => ({ data: { leave: null } })),
        ]);
        setMenus(menuRes.data?.menus || []);
        setMeals(mealRes.data?.meals || []);
        setUpcomingLeave(leaveRes.data?.leave || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
      </div>

      <div className="dashboard-grid">
        {/* Stat / Action Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orange">🍽️</div>
            <div className="stat-info">
              <div className="stat-value">{meals.filter(m => m.status === 'taking').length}/3</div>
              <div className="stat-label">Meals Selected Today</div>
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
              <MealCard key={m.mealType} mealType={m.mealType} checked={m.checked} status={m.status} />
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/meal-check" className="action-btn">✓ Check Today's Meal</Link>
            <Link to="/menu" className="action-btn">📋 View Today's Menu</Link>
            <Link to="/menu?view=weekly" className="action-btn">📅 View Weekly Menu</Link>
            <Link to="/leave" className="action-btn">📝 Apply Leave</Link>
            <Link to="/feedback" className="action-btn">⭐ Give Feedback</Link>
          </div>
        </section>

        {upcomingLeave && (
          <section className="dashboard-section alert-info-box">
            <h3>📅 Upcoming Approved Leave</h3>
            <p>
              {new Date(upcomingLeave.fromDate).toLocaleDateString()} –{' '}
              {new Date(upcomingLeave.toDate).toLocaleDateString()} ({upcomingLeave.status})
            </p>
          </section>
        )}

        <section className="dashboard-section full-width">
          <h2>Today&apos;s Menu</h2>
          {menus.length ? (
            <div className="menu-grid">
              {menus.map((menu) => (
                <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
              ))}
            </div>
          ) : (
            <p className="text-muted">No menu published for today yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
