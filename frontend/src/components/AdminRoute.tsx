import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';

export default function AdminRoute() {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
