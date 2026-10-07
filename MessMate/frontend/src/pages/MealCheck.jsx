import { useEffect, useState } from 'react';
import { mealAPI } from '../services/api';

const mealIcons = {
  breakfast: '☕',
  lunch: '🍛',
  dinner: '🍲',
};

const MealCheck = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadToday = async () => {
    try {
      const { data } = await mealAPI.getToday();
      setMeals(data.meals || []);
    } catch (err) {
      setError('Failed to load meal status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const handleMealSelection = async (mealType, statusChoice) => {
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      await mealAPI.checkIn({ mealType, status: statusChoice });
      const label = statusChoice === 'taking' ? "YES, I'll Eat" : "NO, I Won't Eat";
      setMessage(`Successfully updated ${mealType} status to "${label}"`);
      await loadToday();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meal status');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="meal-check-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🍽️ Daily Meal Check</h1>
          <p className="dashboard-subtitle">
            Help mess staff prepare the right quantity and eliminate food waste!
          </p>
        </div>
      </div>

      <div className="table-card" style={{ textAlign: 'center', padding: '2rem 1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>
          Will you take today's meal?
        </h2>
        <p className="text-muted">Select your attendance for Breakfast, Lunch, and Dinner below.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading meal schedule...</p>
        </div>
      ) : (
        <div className="meal-check-cards">
          {['breakfast', 'lunch', 'dinner'].map((type) => {
            const record = meals.find((m) => m.mealType === type);
            const currentStatus = record?.status;

            return (
              <div key={type} className="meal-check-card">
                <div className="meal-check-header">
                  <span className="meal-check-icon">{mealIcons[type] || '🍽️'}</span>
                  <div className="meal-check-title">{type}</div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  {currentStatus === 'taking' ? (
                    <span className="meal-status-pill status-yes">
                      ✓ Confirmed: You'll Eat
                    </span>
                  ) : currentStatus === 'not-taking' ? (
                    <span className="meal-status-pill status-no">
                      ✗ Marked: Won't Eat
                    </span>
                  ) : (
                    <span className="meal-status-pill status-unanswered">
                      ? Not Checked Yet
                    </span>
                  )}
                </div>

                <div className="meal-check-actions">
                  <button
                    type="button"
                    className={`btn ${currentStatus === 'taking' ? 'btn-meal-yes' : 'btn-outline'}`}
                    disabled={submitting}
                    onClick={() => handleMealSelection(type, 'taking')}
                  >
                    YES, I'll Eat
                  </button>

                  <button
                    type="button"
                    className={`btn ${currentStatus === 'not-taking' ? 'btn-meal-no' : 'btn-outline'}`}
                    disabled={submitting}
                    onClick={() => handleMealSelection(type, 'not-taking')}
                  >
                    NO, I Won't Eat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="info-box" style={{ marginTop: '2.5rem' }}>
        <p>
          💡 <strong>Why meal check matters:</strong> Checking in helps the mess management calculate accurate headcount, saving up to 25% of unconsumed food daily!
        </p>
      </div>
    </div>
  );
};

export default MealCheck;
