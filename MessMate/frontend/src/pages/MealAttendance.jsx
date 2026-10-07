import { useEffect, useState } from 'react';
import { mealAPI } from '../services/api';

const MealAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await mealAPI.getAttendance({ date });
        setAttendance(data.attendance || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [date]);

  return (
    <div className="attendance-page container">
      <div className="page-header">
        <h1>Meal Attendance</h1>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="date-picker" />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Meal</th>
                  <th>Preference</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a) => (
                  <tr key={a._id}>
                    <td>{a.userId?.name || '—'}</td>
                    <td>{a.mealType}</td>
                    <td>{a.foodPreference}</td>
                    <td>{a.status}</td>
                    <td>{new Date(a.checkedInAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted">No attendance records</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealAttendance;
