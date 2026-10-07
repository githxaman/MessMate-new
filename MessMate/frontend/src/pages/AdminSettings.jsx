const AdminSettings = () => (
  <div className="settings-page container">
    <div className="page-header">
      <h1>Settings</h1>
    </div>
    <div className="form-card">
      <h2>System Settings</h2>
      <p className="text-muted">
        Configure safety margin, notification preferences, and other system settings here.
        Safety margin for food preparation is currently set via the backend environment variable
        <code> SAFETY_MARGIN_PERCENT</code> (default: 5%).
      </p>
      <div className="info-box">
        <h3>Current Configuration</h3>
        <ul>
          <li>Safety Margin: 5% (via backend .env)</li>
          <li>Roles: student, staff, admin</li>
          <li>Meals: breakfast, lunch, dinner</li>
        </ul>
      </div>
    </div>
  </div>
);

export default AdminSettings;
