const StaticPage = ({ title, children }) => (
  <div className="static-page container">
    <div className="page-header">
      <h1>{title}</h1>
    </div>
    <div className="form-card">{children}</div>
  </div>
);

export const HelpPage = () => (
  <StaticPage title="Help & Support">
    <p>Need help with MessMate? Contact us at support@messmate.app or call +91 98765 43210.</p>
    <h3>Common Questions</h3>
    <ul>
      <li><strong>How do I check in for a meal?</strong> Go to Meal Check and tap Check In.</li>
      <li><strong>How does leave affect meals?</strong> Approved leave excludes you from expected meal counts.</li>
      <li><strong>Can I change my food preference?</strong> Yes, from your Profile page.</li>
    </ul>
  </StaticPage>
);

export const PrivacyPage = () => (
  <StaticPage title="Privacy Policy">
    <p>MessMate respects your privacy. We store your name, email, food preference, and meal activity to provide our services. Passwords are managed securely by Firebase Authentication and are never stored in our database.</p>
  </StaticPage>
);

export const TermsPage = () => (
  <StaticPage title="Terms & Conditions">
    <p>By using MessMate, you agree to provide accurate information and use the system responsibly. Meal check-ins should reflect your actual dining plans to help reduce food wastage.</p>
  </StaticPage>
);
