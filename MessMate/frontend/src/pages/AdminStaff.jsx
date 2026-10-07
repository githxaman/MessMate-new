import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

const AdminStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
    try {
      const { data } = await userAPI.getAll();
      setStaff((data.users || []).filter((u) => u.role === 'staff' || u.role === 'admin'));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const changeRole = async (id, role) => {
    await userAPI.updateRole(id, { role });
    loadStaff();
  };

  return (
    <div className="admin-staff-page container">
      <div className="page-header">
        <h1>Manage Staff</h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      {u.role !== 'admin' && (
                        <div className="action-group">
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => changeRole(u.id, 'staff')}>Staff</button>
                          <button type="button" className="btn btn-sm btn-primary" onClick={() => changeRole(u.id, 'admin')}>Admin</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
