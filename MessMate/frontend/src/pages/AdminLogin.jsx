import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../config/demoAccounts';

const AdminLogin = () => {
  const [email, setEmail] = useState('admin@messmate.local');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { profile } = await login(email, password);
      if (profile.role !== 'admin') {
        await logout();
        setError('This account does not have administrator access.');
        return;
      }
      navigate('/admin/dashboard');
    } catch (loginError) {
      const demoAccount = DEMO_ACCOUNTS[email.trim().toLowerCase()];
      setError(
        import.meta.env.DEV && demoAccount?.role === 'admin'
          ? 'Sign-in failed. For the local demo, use the demo credentials shown below.'
          : loginError.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card admin-login-card">
        <div className="admin-login-icon" aria-hidden="true">🛡️</div>
        <h2>Administrator Sign In</h2>
        <p className="auth-subtitle">Sign in to manage MessMate dining operations</p>

        {error && <div className="alert alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in as Admin'}
          </button>
        </form>

        {import.meta.env.DEV && (
          <aside className="admin-demo-credentials">
            <strong>Local demo credentials</strong>
            <span>Email: <code>admin@messmate.local</code></span>
            <span>Password: <code>{DEMO_PASSWORD}</code></span>
            <small>Demo sign-in is available only while running the development app.</small>
          </aside>
        )}

        <p className="auth-footer">
          Student or staff? <Link to="/login">Go to regular sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
