import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';

const StudentVerification = () => {
  const [tab, setTab] = useState('registered'); // 'registered' | 'roster'
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [authorizedList, setAuthorizedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filters, setFilters] = useState({ search: '', department: '', semester: '', status: '', isRegistered: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [importing, setImporting] = useState(false);

  // New Authorized Student Form Modal/State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    name: '',
    collegeEmail: '',
    department: '',
    semester: '',
    hostel: '',
    roomNumber: '',
    status: 'Active',
  });

  const fetchData = async (page = pagination.page) => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, authRes] = await Promise.all([
        userAPI.getAll({ role: 'student' }).catch(() => ({ data: { users: [] } })),
        userAPI.getAuthorized({ ...filters, page, limit: 25 }).catch(() => ({ data: { students: [], pagination: {} } })),
      ]);
      setRegisteredUsers(usersRes.data?.users || []);
      setAuthorizedList(authRes.data?.students || []);
      setPagination(authRes.data?.pagination || { page, pages: 1, total: 0 });
    } catch (err) {
      setError('Failed to load student verification data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [filters.search, filters.department, filters.semester, filters.status, filters.isRegistered]);

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError('');
    try {
      const { data } = await userAPI.importAuthorized(file);
      const summary = data.summary;
      setSuccess(`Imported ${summary.successfullyImported} of ${summary.totalRows} rows. Duplicates: ${summary.duplicates}; Invalid: ${summary.invalidRecords}.`);
      fetchData(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Student CSV import failed.');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleToggleVerify = async (userId, currentVerified) => {
    try {
      await userAPI.toggleVerification(userId, { isVerified: !currentVerified });
      setSuccess(`Student verification status updated.`);
      fetchData();
    } catch (err) {
      setError('Failed to update student verification status.');
    }
  };

  const handleAddAuthorizedStudent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await userAPI.createAuthorized(newStudent);
      setSuccess('Authorized student added successfully.');
      setShowAddForm(false);
      setNewStudent({
        studentId: '',
        name: '',
        collegeEmail: '',
        department: '',
        semester: '',
        hostel: '',
        roomNumber: '',
        status: 'Active',
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add authorized student.');
    }
  };

  const handleDeleteAuthorized = async (id) => {
    if (!window.confirm('Delete this authorized student entry?')) return;
    try {
      await userAPI.deleteAuthorized(id);
      setSuccess('Authorized student entry removed.');
      fetchData();
    } catch (err) {
      setError('Failed to delete authorized entry.');
    }
  };

  // Stats
  const totalRegistered = registeredUsers.length;
  const verifiedCount = registeredUsers.filter((u) => u.isVerified).length;
  const pendingCount = registeredUsers.filter((u) => !u.isVerified).length;
  const activeCount = authorizedList.filter((a) => a.status === 'Active').length;

  return (
    <div className="container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🛡️ College Student Verification System</h1>
          <p className="dashboard-subtitle">
            Manage authorized college rosters and verify student registrations
          </p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Summary Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-orange">👥</div>
          <div className="stat-info">
            <div className="stat-value">{totalRegistered}</div>
            <div className="stat-label">Registered Accounts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{verifiedCount}</div>
            <div className="stat-label">Verified Students</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue">⚠️</div>
          <div className="stat-info">
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-purple">📜</div>
          <div className="stat-info">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Authorized Roster Count</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-buttons" style={{ marginBottom: '1.5rem' }}>
        <button
          className={`tab-btn ${tab === 'registered' ? 'active' : ''}`}
          onClick={() => setTab('registered')}
        >
          🎓 Registered Student Accounts ({totalRegistered})
        </button>
        <button
          className={`tab-btn ${tab === 'roster' ? 'active' : ''}`}
          onClick={() => setTab('roster')}
        >
          📋 Authorized Student Roster ({authorizedList.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading verification data...</p>
        </div>
      ) : tab === 'registered' ? (
        /* Tab 1: Registered Accounts */
        <div className="table-card">
          <div className="table-header">
            <h3>Registered Student Verification Status</h3>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>College Email</th>
                  <th>Dept / Semester</th>
                  <th>Hostel & Room</th>
                  <th>Preference</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registeredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="empty-state">
                      No registered students found.
                    </td>
                  </tr>
                ) : (
                  registeredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.name}</strong>
                      </td>
                      <td><code>{user.studentId || 'N/A'}</code></td>
                      <td>{user.email}</td>
                      <td>{user.department} {user.semester ? `(${user.semester})` : ''}</td>
                      <td>{user.hostel} {user.roomNumber ? `RM: ${user.roomNumber}` : ''}</td>
                      <td>
                        {user.foodPreference === 'vegetarian' ? '🥗 Veg' : '🍗 Non-Veg'}
                      </td>
                      <td>
                        {user.isVerified ? (
                          <span className="status-badge success">Verified</span>
                        ) : (
                          <span className="status-badge pending">Pending Verification</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm ${user.isVerified ? 'btn-outline' : 'btn-eco'}`}
                          onClick={() => handleToggleVerify(user.id, user.isVerified)}
                        >
                          {user.isVerified ? 'Revoke Verification' : 'Verify Student'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Authorized Student Roster */
        <div className="table-card">
          <div className="table-header">
            <h3>Authorized College Student Roster</h3>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label className="btn btn-primary btn-sm" style={{ cursor: importing ? 'wait' : 'pointer' }}>
                {importing ? 'Importing...' : 'Import Students CSV'}
                <input type="file" accept=".csv,text/csv" hidden onChange={handleImport} disabled={importing} />
              </label>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                {showAddForm ? 'Close Form' : '+ Add Authorized Student'}
              </button>
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: '1rem' }}>
            <input placeholder="Search ID, name, or email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            <input placeholder="Department" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} />
            <input placeholder="Semester" value={filters.semester} onChange={(e) => setFilters({ ...filters, semester: e.target.value })} />
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
            </select>
            <select value={filters.isRegistered} onChange={(e) => setFilters({ ...filters, isRegistered: e.target.value })}>
              <option value="">All registration states</option><option value="true">Registered</option><option value="false">Not registered</option>
            </select>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddAuthorizedStudent} className="auth-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '12px' }}>
              <h4>Add New Authorized Student to College Database</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Student ID / Roll Number *</label>
                  <input
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>College Email *</label>
                  <input
                    type="email"
                    value={newStudent.collegeEmail}
                    onChange={(e) => setNewStudent({ ...newStudent, collegeEmail: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <input
                    value={newStudent.department}
                    onChange={(e) => setNewStudent({ ...newStudent, department: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <input
                    value={newStudent.semester}
                    onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hostel Block *</label>
                  <input
                    value={newStudent.hostel}
                    onChange={(e) => setNewStudent({ ...newStudent, hostel: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Room Number *</label>
                <input value={newStudent.roomNumber} onChange={(e) => setNewStudent({ ...newStudent, roomNumber: e.target.value })} required />
              </div>

              <button type="submit" className="btn btn-eco">Save to Roster</button>
            </form>
          )}

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Full Name</th>
                  <th>College Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Hostel</th>
                  <th>Registered?</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {authorizedList.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      No entries in authorized student roster.
                    </td>
                  </tr>
                ) : (
                  authorizedList.map((st) => (
                    <tr key={st._id}>
                      <td><code>{st.studentId}</code></td>
                      <td><strong>{st.name}</strong></td>
                      <td>{st.collegeEmail}</td>
                      <td>{st.department || 'N/A'}</td>
                      <td>{st.semester || 'N/A'}</td>
                      <td>{st.hostel} {st.roomNumber ? `(${st.roomNumber})` : ''}</td>
                      <td>
                        {st.isRegistered ? (
                          <span className="status-badge success">Yes</span>
                        ) : (
                          <span className="badge-common">No</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${st.status === 'Active' ? 'success' : 'pending'}`}>
                          {st.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteAuthorized(st._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="table-header" style={{ marginTop: '1rem' }}>
            <span>{pagination.total || 0} students</span>
            <div>
              <button className="btn btn-sm btn-outline" disabled={pagination.page <= 1} onClick={() => fetchData(pagination.page - 1)}>Previous</button>{' '}
              <span>Page {pagination.page || 1} of {pagination.pages || 1}</span>{' '}
              <button className="btn btn-sm btn-outline" disabled={pagination.page >= pagination.pages} onClick={() => fetchData(pagination.page + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVerification;
