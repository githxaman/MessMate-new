import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';
import MenuCard from '../components/MenuCard';

const Menu = () => {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const viewParam = searchParams.get('view') === 'weekly' ? 'week' : 'today';

  const [view, setView] = useState(viewParam);
  const [menus, setMenus] = useState([]);
  const [mealFilter, setMealFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setView(searchParams.get('view') === 'weekly' ? 'week' : 'today');
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params =
          view === 'today'
            ? { date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
            : { week: 'true' };
        const { data } = await menuAPI.getAll(params);
        setMenus(data.menus || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Could not load the menu. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view, reloadKey]);

  const handleTabChange = (newView) => {
    setView(newView);
    setSearchParams(newView === 'week' ? { view: 'weekly' } : {});
  };

  const groupedByDate = menus.reduce((acc, menu) => {
    const key = new Date(menu.date).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(menu);
    return acc;
  }, {});
  const visibleMenus = menus.filter((menu) => mealFilter === 'all' || menu.mealType === mealFilter);

  return (
    <div className="menu-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📋 Hostel Mess Menu</h1>
          <p className="dashboard-subtitle">
            Personalized for <strong>{profile?.foodPreference === 'vegetarian' ? '🥗 Vegetarian' : '🍗 Non-Vegetarian'}</strong> preference
          </p>
        </div>

        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-btn ${view === 'today' ? 'active' : ''}`}
            onClick={() => handleTabChange('today')}
          >
            🍛 Today's Menu
          </button>
          <button
            type="button"
            className={`tab-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => handleTabChange('week')}
          >
            📅 Weekly Schedule
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading menu items...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error menu-error" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => setReloadKey((key) => key + 1)}>
            Try again
          </button>
        </div>
      ) : menus.length === 0 ? (
        <div className="table-card empty-state">
          <span aria-hidden="true">🍲</span>
          <h2>No menu published yet</h2>
          <p>Check back soon — the mess team will add the meals here.</p>
          {view === 'today' && (
            <button type="button" className="btn btn-outline" onClick={() => handleTabChange('week')}>
              Browse this week
            </button>
          )}
        </div>
      ) : view === 'week' ? (
        <>
          <div className="menu-filter-bar" aria-label="Filter meals">
            {['all', 'breakfast', 'lunch', 'dinner'].map((meal) => (
              <button
                type="button"
                key={meal}
                className={`menu-filter-chip ${mealFilter === meal ? 'active' : ''}`}
                onClick={() => setMealFilter(meal)}
              >
                {meal === 'all' ? '🍽️ All meals' : `${meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'} ${meal[0].toUpperCase()}${meal.slice(1)}`}
              </button>
            ))}
          </div>
          {Object.entries(groupedByDate).map(([date, dayMenus]) => {
            const filteredDayMenus = dayMenus.filter((menu) => mealFilter === 'all' || menu.mealType === mealFilter);
            if (!filteredDayMenus.length) return null;
            return (
          <div key={date} className="week-day-group">
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1rem', color: '#ea580c' }}>
              🗓️ {date}
            </h2>
            <div className="menu-grid">
              {filteredDayMenus.map((menu) => (
                <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
              ))}
            </div>
          </div>
            );
          })}
        </>
      ) : (
        <>
          <div className="menu-filter-bar" aria-label="Filter meals">
            {['all', 'breakfast', 'lunch', 'dinner'].map((meal) => (
              <button
                type="button"
                key={meal}
                className={`menu-filter-chip ${mealFilter === meal ? 'active' : ''}`}
                onClick={() => setMealFilter(meal)}
              >
                {meal === 'all' ? '🍽️ All meals' : `${meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'} ${meal[0].toUpperCase()}${meal.slice(1)}`}
              </button>
            ))}
          </div>
          <div className="menu-grid">
          {visibleMenus.map((menu) => (
            <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
          ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Menu;
