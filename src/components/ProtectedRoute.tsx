import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React from 'react';

type Props = {
   children: React.ReactNode;
  role?: 'customer' | 'agent' | 'admin';
};

const ProtectedRoute = ({ children, role }: Props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
