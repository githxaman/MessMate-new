import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';

const statusBadge = {
  pending: 'pending',
  approved: 'success',
  rejected: 'badge-rejected',
};

const LeaveRequest = () => {
  const { role } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadLeaves = async () => {
    try {
      const { data } = await leaveAPI.getAll();
      setLeaves(data.leaves || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await leaveAPI.create(form);
      setMessage('Leave request submitted successfully!');
      setForm({ fromDate: '', toDate: '', reason: '' });
      loadLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status });
      setMessage(`Leave request ${status}`);
      loadLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave');
    }
  };

  return (
    <div className="leave-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📝 Leave Request Management</h1>
          <p className="dashboard-subtitle">
            Approved leaves automatically deduct student headcount from daily meal preparation targets!
          </p>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {role === 'student' && (
        <form onSubmit={handleSubmit} className="table-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            ✈️ Apply for Leave
          </h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                id="fromDate"
                type="date"
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                id="toDate"
                type="date"
                value={form.toDate}
                onChange={(e) => setForm({ ...form, toDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="reason">Reason for Absence *</label>
            <textarea
              id="reason"
              placeholder="Provide reason for leave..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              required
              rows={3}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Submitting Leave...' : 'Submit Leave Application'}
          </button>
        </form>
      )}

      <div className="table-card">
        <div className="table-header">
          <h3>{role === 'student' ? 'My Submitted Leaves' : 'Student Leave Requests'}</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                {role !== 'student' && <th>Student Name</th>}
                {role !== 'student' && <th>Student ID</th>}
                <th>From Date</th>
                <th>To Date</th>
                <th>Reason</th>
                <th>Status</th>
                {role !== 'student' && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={role === 'student' ? 4 : 7} className="empty-state">
                    No leave requests found.
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave._id}>
                    {role !== 'student' && <td><strong>{leave.userId?.name || 'Student'}</strong></td>}
                    {role !== 'student' && <td><code>{leave.userId?.studentId || 'N/A'}</code></td>}
                    <td>{new Date(leave.fromDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.toDate).toLocaleDateString()}</td>
                    <td>{leave.reason}</td>
                    <td>
                      <span className={`status-badge ${statusBadge[leave.status] || 'pending'}`}>
                        {leave.status}
                      </span>
                    </td>
                    {role !== 'student' && (
                      <td>
                        {leave.status === 'pending' ? (
                          <div className="action-group">
                            <button
                              type="button"
                              className="btn btn-sm btn-eco"
                              onClick={() => handleReview(leave._id, 'approved')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleReview(leave._id, 'rejected')}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequest;
