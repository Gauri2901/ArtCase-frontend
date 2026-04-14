import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/useAuth';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="h-screen flex items-center justify-center font-serif">Arriving shortly...</div>;
  }

  // 1. Not logged in? Go to Login, but remember where we were.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Admin route but user is not admin? Go Home.
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. Authorized? Render the child route.
  return <Outlet />;
};

export default ProtectedRoute;