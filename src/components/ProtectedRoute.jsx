import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <div className="text-center">
            <p className="text-base font-semibold text-slate-800">Verifying Authentication...</p>
            <p className="text-xs text-slate-500 mt-1">Checking secure session token</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
