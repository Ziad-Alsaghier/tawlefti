import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FullPageLoader from '@/components/FullPageLoader';

interface ProtectedRouteProps {
  allowedRoles: ('admin' | 'roaster' | 'user')[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // لسه بنتحقق من الجلسة
  if (loading) {
    return <FullPageLoader />;
  }

  // مفيش مستخدم بعد التحقق
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // فيه مستخدم لكن البروفايل لسه ما اتحملش
  if (!profile) {
    return <FullPageLoader />;
  }

  // البروفايل موجود لكن الدور مش مسموح بيه
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // كل شيء تمام
  return <Outlet />;
};

export default ProtectedRoute;
