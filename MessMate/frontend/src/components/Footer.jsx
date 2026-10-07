import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>🍽️ MessMate</h3>
            <p>
              Empowering hostel dining with smart attendance, real-time demand calculation, and food waste analytics.
            </p>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Today's Menu</Link></li>
              <li><Link to="/meal-check">Meal Check</Link></li>
              <li><Link to="/leave">Leave Application</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Support & Help</h4>
            <ul className="footer-links">
              <li><Link to="/help">Help & FAQ</Link></li>
              <li><Link to="/feedback">Give Feedback</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact Mess Admin</h4>
            <ul className="footer-links">
              <li>📧 messadmin@college.edu</li>
              <li>📞 +91 (800) 123-4567</li>
              <li>🏠 Hostel Admin Block, Room 102</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 MessMate – Smart Hostel Dining Management System. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
