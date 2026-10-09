import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const prefLabel = {
  vegetarian: '🥗 Vegetarian',
  'non-vegetarian': '🍗 Non-Vegetarian',
};

const Profile = () => {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    foodPreference: profile?.foodPreference || 'vegetarian',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        phone: profile.phone || '',
        foodPreference: profile.foodPreference || 'vegetarian',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
        foodPreference: form.foodPreference,
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page container">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-avatar">{profile?.name?.charAt(0)?.toUpperCase()}</div>
          <h2>{profile?.name}</h2>
          <p className="role-badge">{profile?.role}</p>
          <div className="profile-info">
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Student ID:</strong> {profile?.studentId || '—'}</p>
            <p><strong>Food Preference:</strong> {prefLabel[profile?.foodPreference]}</p>
            <p><strong>Hostel:</strong> {profile?.hostel || '—'}{profile?.roomNumber ? ` · Room ${profile.roomNumber}` : ''}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-card">
          <h2>Edit Profile</h2>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Food Preference</label>
            <div className="preference-cards">
              <label className={`pref-card ${form.foodPreference === 'vegetarian' ? 'selected-veg' : ''}`}>
                <input
                  type="radio"
                  name="foodPreference"
                  value="vegetarian"
                  checked={form.foodPreference === 'vegetarian'}
                  onChange={(e) => setForm({ ...form, foodPreference: e.target.value })}
                />
                <span className="pref-icon">🥗</span>
                <span className="pref-title">Vegetarian</span>
                <span className="pref-sub">🥗 Veg meals</span>
              </label>
              <label className={`pref-card ${form.foodPreference === 'non-vegetarian' ? 'selected-nonveg' : ''}`}>
                <input
                  type="radio"
                  name="foodPreference"
                  value="non-vegetarian"
                  checked={form.foodPreference === 'non-vegetarian'}
                  onChange={(e) => setForm({ ...form, foodPreference: e.target.value })}
                />
                <span className="pref-icon">🍗</span>
                <span className="pref-title">Non-Vegetarian</span>
                <span className="pref-sub">🍗 Includes non-veg meals</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || (
            form.name === (profile?.name || '') &&
            form.phone === (profile?.phone || '') &&
            form.foodPreference === (profile?.foodPreference || 'vegetarian')
          )}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
