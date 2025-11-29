import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute = ({ adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  // 1. Not logged in? Go to Login.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin route but user is not admin? Go Home.
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. Authorized? Render the child route.
  return <Outlet />;
};

export default ProtectedRoute;