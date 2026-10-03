import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckEmailPage from './pages/CheckEmailPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCreateAccountPage from './pages/AdminCreateAccountPage';

import StudentLayout from './components/StudentLayout';
import AdminLayout from './components/AdminLayout';
import { USE_BACKEND } from './constants/appConfig';
import StudentOverview from './pages/StudentOverview';
import StudentBookings from './pages/StudentBookings';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentHistory from './pages/StudentHistory';
import StudentHealthQuest from './pages/StudentHealthQuest';
import StudentSickNotes from './pages/StudentSickNotes';
import AdminProfile from './pages/AdminProfile';
import AdminAppointments from './pages/AdminAppointments';
import AdminHealthQuests from './pages/AdminHealthQuests';
import AdminSickNotes from './pages/AdminSickNotes';
import AdminHistory from './pages/AdminHistory';

import './App.css';

function getStoredUser() {
  const storedUser = localStorage.getItem('pulseupUser');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error('Could not read saved PulseUp user:', error);

    localStorage.removeItem('pulseupUser');

    return null;
  }
}

function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toUpperCase()
    .replace('ROLE_', '');
}

function getToken(user) {
  return user?.token || user?.accessToken || user?.jwt || '';
}

function getDashboardPath(role) {
  switch (normalizeRole(role)) {
    case 'STUDENT':
      return '/student/dashboard';

    case 'EMPLOYEE':
      return '/employee/dashboard';

    case 'STAFF':
      return '/staff/dashboard';

    case 'ADMIN':
      return '/admin/dashboard';

    default:
      return '/login';
  }
}

function PublicOnlyRoute({ children }) {
  const user = getStoredUser();

  const token = getToken(user);

  if (user && token) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children;
}

function ProtectedRoute({ allowedRoles, children }) {
  const user = getStoredUser();

  const token = getToken(user);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const userRole = normalizeRole(user.role);

  const acceptedRoles = allowedRoles.map((role) => normalizeRole(role));

  if (!acceptedRoles.includes(userRole)) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
}

function DashboardRedirect() {
  const user = getStoredUser();

  const token = getToken(user);

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function NotFoundPage() {
  return (
    <main className="pulse-not-found">
      <section className="pulse-not-found-card">
        <p>404</p>

        <h1>Page not found</h1>

        <span>The page you requested does not exist.</span>

        <a href="/">Return to home</a>
      </section>
    </main>
  );
}

function renderClientPages(prefix) {
  return (
    <>
      <Route index element={<Navigate to={`${prefix}/dashboard`} replace />} />

      {!USE_BACKEND && (
        <Route path="dashboard" element={<StudentOverview />} />
      )}

      <Route path="overview" element={<StudentOverview />} />

      <Route path="bookings" element={<StudentBookings />} />

      <Route path="profile" element={<StudentProfilePage />} />

      <Route path="history" element={<StudentHistory />} />

      {prefix === '/student' && (
        <Route path="health-quests" element={<StudentHealthQuest />} />
      )}

      <Route path="sick-notes" element={<StudentSickNotes />} />
    </>
  );
}

function renderClinicPages(prefix) {
  return (
    <>
      <Route index element={<Navigate to={`${prefix}/dashboard`} replace />} />

      {!USE_BACKEND && (
        <Route path="dashboard" element={<AdminAppointments />} />
      )}

      <Route path="profile" element={<AdminProfile />} />

      <Route path="bookings" element={<AdminAppointments />} />

      {prefix === '/admin' && (
        <Route path="health-quests" element={<AdminHealthQuests />} />
      )}

      {prefix === '/admin' && (
        <Route path="sick-notes" element={<AdminSickNotes />} />
      )}

      <Route path="history" element={<AdminHistory />} />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route path="/check-email" element={<CheckEmailPage />} />

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        {!USE_BACKEND && (
          <Route
            path="/register/staff"
            element={
              <PublicOnlyRoute>
                <RegisterPage key="employee" accountType="employee" />
              </PublicOnlyRoute>
            }
          />
        )}

        <Route path="/dashboard" element={<DashboardRedirect />} />

        {USE_BACKEND && (
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        )}

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['STUDENT']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          {renderClientPages('/student')}
        </Route>

        {!USE_BACKEND && (
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            {renderClientPages('/employee')}
          </Route>
        )}

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {renderClinicPages('/staff')}
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {renderClinicPages('/admin')}
        </Route>

        {USE_BACKEND && (
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STAFF']}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
        )}

        {USE_BACKEND && (
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        )}

        {USE_BACKEND && (
          <Route
            path="/admin/create-account"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminCreateAccountPage />
              </ProtectedRoute>
            }
          />
        )}

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
