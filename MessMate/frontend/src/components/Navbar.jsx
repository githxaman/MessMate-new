import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/', label: '🏠 Home', end: true },
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/menu', label: "🍛 Today's Menu" },
  { to: '/menu?view=weekly', label: '📅 Weekly Menu' },
  { to: '/meal-check', label: '🍽️ Meal Check' },
  { to: '/leave', label: '📝 Leave Request' },
  { to: '/feedback', label: '⭐ Feedback' },
  { to: '/profile', label: '👤 Profile' },
];

const staffLinks = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/staff/menu', label: '📋 Menu' },
  { to: '/staff/attendance', label: '👥 Meal Attendance' },
  { to: '/reports?tab=demand', label: '📉 Food Demand' },
  { to: '/leave', label: '📝 Leave Requests' },
  { to: '/food-waste', label: '♻️ Food Waste' },
  { to: '/feedback', label: '⭐ Feedback' },
  { to: '/reports', label: '📈 Reports' },
  { to: '/admin/verification', label: '🛡️ Student Verification' },
];

const adminLinks = [
  { to: '/admin/dashboard', label: '📊 Dashboard' },
  { to: '/staff/menu', label: '📋 Menu' },
  { to: '/staff/attendance', label: '👥 Meal Attendance' },
  { to: '/reports?tab=demand', label: '📉 Food Demand' },
  { to: '/leave', label: '📝 Leave Requests' },
  { to: '/food-waste', label: '♻️ Food Waste' },
  { to: '/feedback', label: '⭐ Feedback' },
  { to: '/reports', label: '📈 Reports' },
  { to: '/admin/verification', label: '🛡️ Student Verification' },
];

const Navbar = () => {
  const { isAuthenticated, role } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  const links =
    role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  return (
    <nav className="navbar">
      <button
        type="button"
        className="nav-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Toggle Navigation Menu"
      >
        ☰
      </button>

      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;
