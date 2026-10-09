import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { feedbackAPI } from '../services/api';

const Feedback = () => {
  const { role } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [form, setForm] = useState({
    rating: 5,
    foodQuality: 5,
    taste: 5,
    quantity: 5,
    cleanliness: 5,
    service: 5,
    comment: '',
    mealType: 'general',
  });
  const [loading, setLoading] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const { data } = await feedbackAPI.getAll();
      setFeedbackList(data.feedback || []);
    } catch (err) {
      console.error('Failed to load feedback:', err);
      setError(err.response?.data?.message || 'Could not load feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await feedbackAPI.create(form);
      setMessage('Thank you for your feedback!');
      setForm({ ...form, comment: '' });
      await loadFeedback();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const RatingInput = ({ label, name, value }) => (
    <div className="rating-input">
      <label>{label}</label>
      <div className="star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`star-btn ${value >= n ? 'active' : ''}`}
            aria-label={`${n} out of 5 for ${label}`}
            aria-pressed={value === n}
            onClick={() => setForm({ ...form, [name]: n })}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="feedback-page container">
      <div className="page-header student-page-heading">
        <div>
          <span className="student-section-kicker">HELP US SERVE YOU BETTER</span>
          <h1>⭐ Dining Feedback</h1>
          <p className="text-muted">Your feedback helps shape better meals for everyone.</p>
        </div>
        <Link to="/dashboard" className="btn btn-outline">← Dashboard</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error" role="alert">{error}</div>}

      {role === 'student' && (
        <form onSubmit={handleSubmit} className="form-card">
          <h2>How was your meal?</h2>
          <p className="text-muted">Rate each part of your dining experience.</p>
          <RatingInput label="Overall Rating" name="rating" value={form.rating} />
          <RatingInput label="Food Quality" name="foodQuality" value={form.foodQuality} />
          <RatingInput label="Taste" name="taste" value={form.taste} />
          <RatingInput label="Quantity" name="quantity" value={form.quantity} />
          <RatingInput label="Cleanliness" name="cleanliness" value={form.cleanliness} />
          <RatingInput label="Service" name="service" value={form.service} />

          <div className="form-group">
            <label htmlFor="mealType">Meal</label>
            <select
              id="mealType"
              value={form.mealType}
              onChange={(e) => setForm({ ...form, mealType: e.target.value })}
            >
              <option value="general">General</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Comment (optional)</label>
            <textarea
              id="comment"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending feedback…' : 'Send feedback'}
          </button>
        </form>
      )}

      <div className="table-card">
        <h2>{role === 'student' ? 'My Feedback' : 'Recent Feedback'}</h2>
        <div className="feedback-list">
          {loadingFeedback && <p className="text-muted">Loading feedback…</p>}
          {feedbackList.map((fb) => (
            <div key={fb._id} className="feedback-item">
              <div className="feedback-header">
                <strong>{fb.userId?.name || 'Anonymous'}</strong>
                <span className="rating-display">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
              </div>
              <p>{fb.comment || 'No comment'}</p>
              <small className="text-muted">
                {new Date(fb.createdAt).toLocaleString()} · {fb.mealType}
              </small>
            </div>
          ))}
          {!loadingFeedback && feedbackList.length === 0 && !error && <p className="text-muted">Your feedback history will appear here.</p>}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
