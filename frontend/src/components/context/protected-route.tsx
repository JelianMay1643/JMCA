import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./use-auth";

function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="p-10 text-center">Loading...</p>;

  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;