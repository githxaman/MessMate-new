import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    { icon: '🛡️', title: 'Student Verification', desc: 'Secure verification against official college rosters to protect hostel mess access.' },
    { icon: '🥗', title: 'Veg & Non-Veg Preference', desc: 'Customized food options (Pure Veg & Non-Veg) tailored to your dietary choice.' },
    { icon: '📋', title: 'Interactive Menu', desc: 'Browse Today\'s Menu and Weekly Schedules with clear Veg, Non-Veg & Common badges.' },
    { icon: '🍽️', title: 'Daily Meal Check', desc: 'Quickly mark "YES, I\'ll Eat" or "NO, I Won\'t Eat" for Breakfast, Lunch & Dinner.' },
    { icon: '📝', title: 'Leave Application', desc: 'Submit leave requests; approved leave auto-adjusts daily food preparation targets.' },
    { icon: '♻️', title: 'Food Waste Analytics', desc: 'Real-time demand calculation and waste tracking to build a zero-waste campus mess.' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: '1rem' }}>
        <div className="hero">
          <div className="hero-content">
            <div className="hero-pill">
              <span>🍽️</span> Smart Hostel Dining Management System
            </div>
            <h1>Smart Dining. Less Waste. Better Management.</h1>
            <p>
              MessMate connects hostel students and mess staff with real-time meal check-ins, student verification, and intelligent demand analytics to eliminate food waste.
            </p>
            <div className="hero-actions">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to Dashboard 📊
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    🎓 Student Registration
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    🔑 Account Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container section">
        <div className="section-title-wrap">
          <h2 className="section-title">Everything You Need For Smart Dining</h2>
          <p className="section-subtitle">
            Designed for students, mess staff, and hostel administrators.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon-badge">{f.icon}</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.925rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Food Waste Reduction Banner */}
      <section className="container section">
        <div className="table-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '2px solid #a7f3d0' }}>
          <div className="waste-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
            <div>
              <span className="status-badge success" style={{ marginBottom: '1rem', display: 'inline-block' }}>
                ♻️ Eco-Friendly Dining
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#065f46', marginBottom: '1rem' }}>
                Know the Demand → Prepare Smart → Waste Less
              </h2>
              <p style={{ color: '#047857', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                By predicting meal attendance through student check-ins and approved leave applications, mess staff can prepare exact portions without under-catering or wasting excess food.
              </p>
              <ul style={{ listStyle: 'none', color: '#065f46', fontWeight: '600', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>✓ Live vegetarian & non-vegetarian headcount breakdown</li>
                <li>✓ Automated exclusion of students on approved leave</li>
                <li>✓ Recommended preparation quantity with 5% safety margin</li>
                <li>✓ Daily, weekly & monthly food waste tracking</li>
              </ul>
            </div>

            <div className="table-card" style={{ textAlignment: 'center', boxShadow: '0 12px 32px rgba(5, 150, 105, 0.15)' }}>
              <h3 style={{ color: '#059669', marginBottom: '1rem', fontSize: '1.1rem' }}>Expected Demand Calculation</h3>
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Active Students: 200</p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Approved Leaves Today: -25</p>
                <hr style={{ margin: '0.5rem 0' }} />
                <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#059669' }}>175 Expected Students</p>
              </div>
              <div style={{ display: 'flex', justify: 'space-around' }}>
                <div>
                  <span style={{ fontSize: '1.2rem' }}>🥗</span>
                  <div style={{ fontWeight: '700' }}>120 Veg</div>
                </div>
                <div>
                  <span style={{ fontSize: '1.2rem' }}>🍗</span>
                  <div style={{ fontWeight: '700' }}>55 Non-Veg</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
