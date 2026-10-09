const MealCard = ({ mealType, checked, status, onCheck, loading }) => {
  const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

  return (
    <div className={`meal-card ${status === 'taking' ? 'checked' : ''} ${status === 'not-taking' ? 'meal-card-skipped' : ''}`}>
      <div className="meal-card-header">
        <span className="meal-icon" aria-hidden="true">{icons[mealType]}</span>
        <h3>{labels[mealType]}</h3>
      </div>
      <div className="meal-status">
        {status === 'taking' ? (
          <span className="status-badge success">✓ Taking Meal</span>
        ) : status === 'not-taking' ? (
          <span className="status-badge status-no">↗ Not taking</span>
        ) : (
          <span className="status-badge pending">○ Not checked</span>
        )}
      </div>
      {onCheck && (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => onCheck(mealType)}
          disabled={loading}
        >
          {checked ? 'Change response' : 'Choose meal'}
        </button>
      )}
    </div>
  );
};

export default MealCard;
