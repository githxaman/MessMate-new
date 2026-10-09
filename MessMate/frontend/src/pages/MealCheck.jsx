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
  const [savingMeal, setSavingMeal] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadToday = async () => {
    try {
      const { data } = await mealAPI.getToday();
      setMeals(data.meals || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load meal status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadToday();
  }, []);

  const handleMealSelection = async (mealType, statusChoice) => {
    setSavingMeal(mealType);
    setMessage('');
    setError('');
    try {
      await mealAPI.checkIn({ mealType, status: statusChoice });
      setMeals((current) => current.map((meal) =>
        meal.mealType === mealType ? { ...meal, checked: true, status: statusChoice } : meal
      ));
      const label = statusChoice === 'taking' ? "YES, I'll Eat" : "NO, I Won't Eat";
      setMessage(`Successfully updated ${mealType} status to "${label}"`);
      await loadToday();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update meal status');
    } finally {
      setSavingMeal('');
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

      <div className="meal-check-intro">
        <span aria-hidden="true">🥗</span>
        <div>
          <span className="student-section-kicker">HELP THE MESS PLAN SMARTER</span>
          <h2>What are you eating today?</h2>
          <p>Confirm each meal so the kitchen can prepare the right amount and waste less.</p>
        </div>
        <div className="meal-check-progress">
          <strong>{meals.filter((meal) => meal.status).length}/3</strong>
          <span>answered</span>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && error && (
        <button type="button" className="btn btn-outline meal-retry" onClick={loadToday}>
          ↻ Reload meal status
        </button>
      )}

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
              <div key={type} className={`meal-check-card ${currentStatus === 'taking' ? 'meal-choice-taking' : currentStatus === 'not-taking' ? 'meal-choice-skipping' : ''}`}>
                <div className="meal-check-header">
                  <span className="meal-check-icon" aria-hidden="true">{mealIcons[type] || '🍽️'}</span>
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
                    disabled={savingMeal === type}
                    onClick={() => handleMealSelection(type, 'taking')}
                    aria-pressed={currentStatus === 'taking'}
                  >
                    {savingMeal === type ? 'Saving…' : '✓ I’ll eat'}
                  </button>

                  <button
                    type="button"
                    className={`btn ${currentStatus === 'not-taking' ? 'btn-meal-no' : 'btn-outline'}`}
                    disabled={savingMeal === type}
                    onClick={() => handleMealSelection(type, 'not-taking')}
                    aria-pressed={currentStatus === 'not-taking'}
                  >
                    {savingMeal === type ? 'Saving…' : '✕ I’ll skip'}
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
