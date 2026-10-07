const MealCard = ({ mealType, checked, status, onCheck, loading }) => {
  const labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };
  const icons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

  return (
    <div className={`meal-card ${checked ? 'checked' : ''}`}>
      <div className="meal-card-header">
        <span className="meal-icon">{icons[mealType]}</span>
        <h3>{labels[mealType]}</h3>
      </div>
      <div className="meal-status">
        {checked ? (
          <span className="status-badge success">✓ Taking Meal</span>
        ) : (
          <span className="status-badge pending">○ Not checked</span>
        )}
      </div>
      {onCheck && (
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => onCheck(mealType)}
          disabled={loading || (checked && status === 'taking')}
        >
          {checked ? 'Update' : 'Check In'}
        </button>
      )}
    </div>
  );
};

export default MealCard;
