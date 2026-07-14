import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SitesPage from './pages/SitesPage';
import BookingPage from './pages/BookingPage';
import AdminDashboard from './pages/AdminDashboard';
import { useSocket } from './hooks/useSocket';

export default function App() {
  useSocket();
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<SitesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="book/:siteId" element={<BookingPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
