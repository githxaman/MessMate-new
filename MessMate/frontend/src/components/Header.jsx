import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const Header = () => {
  const { isAuthenticated, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="logo-block">
          <div className="logo-badge">🍽️</div>
          <div>
            <h1 className="logo-title">MessMate</h1>
            <p className="logo-tagline">Smart Dining. Less Waste. Better Management.</p>
          </div>
        </Link>

        <Navbar />

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="icon-btn"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => alert('No new notifications')}
              >
                🔔
              </button>

              <Link to="/profile" className="profile-chip">
                <span className="avatar">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
                <span className="profile-name">{profile?.name || 'User'}</span>
              </Link>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
