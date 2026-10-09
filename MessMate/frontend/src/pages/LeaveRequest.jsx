import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../services/api';

const todayDate = () => {
  const today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

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
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [reviewingId, setReviewingId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadLeaves = async () => {
    setLoadingLeaves(true);
    try {
      const { data } = await leaveAPI.getAll();
      setLeaves(data.leaves || []);
      setError('');
    } catch (loadError) {
      console.error('Failed to load leave requests:', loadError);
      setError(loadError.response?.data?.message || 'Could not load leave requests. Please try again.');
    } finally {
      setLoadingLeaves(false);
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
      await loadLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    setReviewingId(id);
    setError('');
    setMessage('');
    try {
      await leaveAPI.updateStatus(id, { status });
      setMessage(`Leave request ${status}`);
      await loadLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update leave');
    } finally {
      setReviewingId('');
    }
  };

  return (
    <div className="leave-page container main-content">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span className="student-section-kicker">PLAN YOUR TIME AWAY</span>
          <h1>📝 Leave Request</h1>
          <p className="dashboard-subtitle">
            Let the mess know when you’ll be away — approved leave helps us prepare just the right amount.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={loadLeaves} disabled={loadingLeaves}>
          ↻ {loadingLeaves ? 'Refreshing…' : 'Refresh requests'}
        </button>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {role === 'student' && (
        <form onSubmit={handleSubmit} className="table-card leave-form-card" style={{ marginBottom: '2rem' }}>
          <div className="leave-form-heading">
            <span aria-hidden="true">✈️</span>
            <div><h3>Apply for leave</h3><p>Choose the dates you’ll be away from the hostel.</p></div>
          </div>
          {form.fromDate && form.toDate && form.toDate < form.fromDate && (
            <div className="alert alert-error">End date must be the same as or later than the start date.</div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fromDate">From Date *</label>
              <input
                id="fromDate"
                type="date"
                min={todayDate()}
                value={form.fromDate}
                onChange={(e) => setForm({ ...form, fromDate: e.target.value, toDate: form.toDate < e.target.value ? '' : form.toDate })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="toDate">To Date *</label>
              <input
                id="toDate"
                type="date"
                min={form.fromDate || todayDate()}
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
              maxLength={500}
              aria-describedby="leave-reason-count"
            />
            <small id="leave-reason-count" className="form-hint">{form.reason.length}/500 characters</small>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (form.fromDate && form.toDate && form.toDate < form.fromDate)}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'Submitting Leave...' : 'Submit Leave Application'}
          </button>
        </form>
      )}

      <div className="table-card">
        <div className="table-header">
          <h3>{role === 'student' ? 'My Submitted Leaves' : 'Student Leave Requests'}</h3>
          <span className="leave-request-count">{leaves.length} {leaves.length === 1 ? 'request' : 'requests'}</span>
        </div>
        {loadingLeaves ? (
          <div className="student-empty-menu">Loading leave requests…</div>
        ) : leaves.length === 0 ? (
          <div className="student-empty-menu">
            <span aria-hidden="true">🗓️</span>
            <p>No leave requests yet.</p>
            {role === 'student' && <small>Your applications and their status will appear here.</small>}
          </div>
        ) : (
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
              {leaves.map((leave) => (
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
                              disabled={reviewingId === leave._id}
                              onClick={() => handleReview(leave._id, 'approved')}
                            >
                              {reviewingId === leave._id ? 'Updating…' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              disabled={reviewingId === leave._id}
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
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequest;
