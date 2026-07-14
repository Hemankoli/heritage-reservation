import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';

export default function ProtectedRoute() {
  const user = useAppSelector((s) => s.auth.user);
  return user && user.role !== 'admin' ? <Outlet /> : <Navigate to="/login" replace />;
}
