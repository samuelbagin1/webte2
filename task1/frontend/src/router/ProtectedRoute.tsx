import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// wrapper that redirects unauthenticated users to /login
// shows loading skeleton while checking session

export function ProtectedRoute() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}