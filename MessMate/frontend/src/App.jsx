import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/DashboardRouter';
import Menu from './pages/Menu';
import MealCheck from './pages/MealCheck';
import LeaveRequest from './pages/LeaveRequest';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import FoodWaste from './pages/FoodWaste';
import AdminDashboard from './pages/AdminDashboard';
import MenuManagement from './pages/MenuManagement';
import MealAttendance from './pages/MealAttendance';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';
import AdminStaff from './pages/AdminStaff';
import AdminSettings from './pages/AdminSettings';
import StudentVerification from './pages/StudentVerification';
import { HelpPage, PrivacyPage, TermsPage } from './pages/StaticPages';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />

            <Route element={<PublicRoute />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="menu" element={<Menu />} />
              <Route path="profile" element={<Profile />} />
              <Route path="feedback" element={<Feedback />} />
            </Route>

            <Route element={<ProtectedRoute roles={['student']} />}>
              <Route path="meal-check" element={<MealCheck />} />
            </Route>

            <Route element={<ProtectedRoute roles={['student', 'staff', 'admin']} />}>
              <Route path="leave" element={<LeaveRequest />} />
            </Route>

            <Route element={<ProtectedRoute roles={['staff', 'admin']} />}>
              <Route path="staff/menu" element={<MenuManagement />} />
              <Route path="staff/attendance" element={<MealAttendance />} />
              <Route path="food-waste" element={<FoodWaste />} />
              <Route path="reports" element={<Reports />} />
              <Route path="admin/verification" element={<StudentVerification />} />
            </Route>

            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/staff" element={<AdminStaff />} />
              <Route path="admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
