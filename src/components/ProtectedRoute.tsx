import { FC } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isRegistered: boolean;
  children: React.ReactNode;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({ isRegistered, children }) => {
  if (!isRegistered) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};
