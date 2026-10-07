const categoryBadge = {
  vegetarian: { label: '🥗 Veg', className: 'badge-veg' },
  'non-vegetarian': { label: '🍗 Non-Veg', className: 'badge-nonveg' },
  common: { label: '🍽️ Common', className: 'badge-common' },
};

const MenuCard = ({ menu, foodPreference }) => {
  const dateStr = new Date(menu.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  // Filter items according to student preference
  // Veg students see Common + Vegetarian items
  // Non-Veg students see Common + Non-Vegetarian items
  const itemsToDisplay = menu.items.filter((item) => {
    if (!item.category || item.category === 'common') return true;
    if (foodPreference === 'vegetarian') return item.category === 'vegetarian';
    if (foodPreference === 'non-vegetarian') return item.category === 'non-vegetarian';
    return true;
  });

  const vegItems = itemsToDisplay.filter((i) => i.category === 'vegetarian');
  const nonVegItems = itemsToDisplay.filter((i) => i.category === 'non-vegetarian');
  const commonItems = itemsToDisplay.filter((i) => !i.category || i.category === 'common');

  return (
    <div className="menu-card">
      <div className="menu-card-header">
        <h3>{menu.mealType}</h3>
        <span className="menu-date">{dateStr}</span>
      </div>

      <div className="menu-items-list">
        {/* Common Items */}
        {commonItems.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>
              🍽️ COMMON ITEMS
            </div>
            {commonItems.map((item, i) => (
              <div key={i} className="menu-item-row">
                <span className="menu-item-name">{item.name}</span>
                <span className="badge-common">🍽️ Common</span>
              </div>
            ))}
          </div>
        )}

        {/* Vegetarian Items */}
        {vegItems.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#16a34a', marginBottom: '0.25rem' }}>
              🥗 VEGETARIAN ITEMS
            </div>
            {vegItems.map((item, i) => (
              <div key={i} className="menu-item-row">
                <span className="menu-item-name">{item.name}</span>
                <span className="badge-veg">🥗 Veg</span>
              </div>
            ))}
          </div>
        )}

        {/* Non-Vegetarian Items */}
        {nonVegItems.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#dc2626', marginBottom: '0.25rem' }}>
              🍗 NON-VEGETARIAN ITEMS
            </div>
            {nonVegItems.map((item, i) => (
              <div key={i} className="menu-item-row">
                <span className="menu-item-name">{item.name}</span>
                <span className="badge-nonveg">🍗 Non-Veg</span>
              </div>
            ))}
          </div>
        )}

        {itemsToDisplay.length === 0 && (
          <p className="text-muted" style={{ padding: '0.5rem 0' }}>
            No items listed for this meal.
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
