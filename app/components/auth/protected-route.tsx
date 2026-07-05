import { Navigate, useLocation } from "react-router";

import { getSession } from "~/utils/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const session = getSession();

  if (!session) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ returnTo: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
}
