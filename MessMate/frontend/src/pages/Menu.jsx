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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setView(searchParams.get('view') === 'weekly' ? 'week' : 'today');
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params =
          view === 'today'
            ? { date: new Date().toISOString().split('T')[0] }
            : { week: 'true' };
        const { data } = await menuAPI.getAll(params);
        setMenus(data.menus || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [view]);

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
      ) : menus.length === 0 ? (
        <div className="table-card empty-state">
          <p>No menu has been published for this period yet.</p>
        </div>
      ) : view === 'week' ? (
        Object.entries(groupedByDate).map(([date, dayMenus]) => (
          <div key={date} className="week-day-group">
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', marginBottom: '1rem', color: '#ea580c' }}>
              🗓️ {date}
            </h2>
            <div className="menu-grid">
              {dayMenus.map((menu) => (
                <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="menu-grid">
          {menus.map((menu) => (
            <MenuCard key={menu._id} menu={menu} foodPreference={profile?.foodPreference} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
