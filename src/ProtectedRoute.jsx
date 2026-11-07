import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('access');
  const location = useLocation();

  if (!token) {
    // Preserves the route they were trying to access so login can send them back
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}