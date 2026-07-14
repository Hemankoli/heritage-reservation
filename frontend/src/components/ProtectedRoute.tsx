import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';

export default function ProtectedRoute() {
  const token = useAppSelector((s) => s.auth.token);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}
