import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    semester: '',
    hostel: '',
    roomNumber: '',
    phone: '',
    password: '',
    confirmPassword: '',
    foodPreference: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePrefChange = (value) => {
    setForm({ ...form, foodPreference: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!form.foodPreference) {
      setError('Please select your Food Preference (Vegetarian or Non-Vegetarian)');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(form.email, form.password, {
        name: form.name,
        email: form.email,
        studentId: form.studentId,
        department: form.department,
        semester: form.semester,
        hostel: form.hostel,
        roomNumber: form.roomNumber,
        phone: form.phone,
        foodPreference: form.foodPreference,
        role: 'student', // Public registration always creates Student account
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <h2>🎓 Student Registration</h2>
          <p className="auth-subtitle">
            Register your college details to access MessMate hostel dining services
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Personal & College Identifiers */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                placeholder="e.g. Alex Johnson"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">College Email *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex.johnson@college.edu"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="studentId">Student ID / Roll Number *</label>
              <input
                id="studentId"
                name="studentId"
                placeholder="e.g. STU1001"
                value={form.studentId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Department & Semester */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                id="department"
                name="department"
                placeholder="Computer Science, Mechanical..."
                value={form.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="semester">Semester / Year *</label>
              <select
                id="semester"
                name="semester"
                value={form.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
                <option value="4th Semester">4th Semester</option>
                <option value="5th Semester">5th Semester</option>
                <option value="6th Semester">6th Semester</option>
                <option value="7th Semester">7th Semester</option>
                <option value="8th Semester">8th Semester</option>
              </select>
            </div>
          </div>

          {/* Hostel & Room Number */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="hostel">Hostel Name / Block *</label>
              <input
                id="hostel"
                name="hostel"
                placeholder="Boys Hostel A, Girls Hostel B..."
                value={form.hostel}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="roomNumber">Room Number *</label>
              <input
                id="roomNumber"
                name="roomNumber"
                placeholder="A-204"
                value={form.roomNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Passwords */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Interactive Food Preference Cards */}
          <div className="form-group">
            <label className="preference-section-label">
              🍽️ Food Preference *
            </label>
            <div className="preference-cards">
              <div
                className={`pref-card ${
                  form.foodPreference === 'vegetarian' ? 'selected-veg' : ''
                }`}
                onClick={() => handlePrefChange('vegetarian')}
              >
                <input
                  type="radio"
                  name="foodPreference"
                  value="vegetarian"
                  checked={form.foodPreference === 'vegetarian'}
                  onChange={() => {}}
                />
                <span className="pref-icon">🥗</span>
                <span className="pref-title">Vegetarian</span>
                <span className="pref-sub">Pure Veg Meals & Delicacies</span>
              </div>

              <div
                className={`pref-card ${
                  form.foodPreference === 'non-vegetarian' ? 'selected-nonveg' : ''
                }`}
                onClick={() => handlePrefChange('non-vegetarian')}
              >
                <input
                  type="radio"
                  name="foodPreference"
                  value="non-vegetarian"
                  checked={form.foodPreference === 'non-vegetarian'}
                  onChange={() => {}}
                />
                <span className="pref-icon">🍗</span>
                <span className="pref-title">Non-Vegetarian</span>
                <span className="pref-sub">Includes Chicken, Fish & Eggs</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Verifying & Registering...' : 'Register Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
