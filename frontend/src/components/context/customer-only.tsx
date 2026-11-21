import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./use-auth";


function CustomerOnly() {
  const { user } = useAuth();

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default CustomerOnly;