import { Routes, Route } from 'react-router-dom';
import {
  Layout,
  ProtectedRoute,
  AdminRoute,
  LoginPage,
  RegisterPage,
  SitesPage,
  BookingPage,
  AdminDashboard,
  MyBookingsPage
} from './index';
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
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}
