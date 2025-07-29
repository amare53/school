import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../shared/hooks";
import { Layout } from "../../../shared/components/layout/Layout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallbackPath = "/login",
}) => {
  const { isAuthenticated, user, canAccess, hasPermission } = useAuth();
  const location = useLocation();

  // Vérifier l'authentification
  if (!isAuthenticated || !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }
  // Vérifier les rôles requis
  if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Accès refusé
            </h2>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Retour
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Vérifier les permissions requises
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );

    if (!hasRequiredPermissions) {
      return (
        <Layout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 0h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Permissions insuffisantes
              </h2>
              <p className="text-gray-600 mb-4">
                Vous n'avez pas les permissions nécessaires pour effectuer cette
                action.
              </p>
              <button
                onClick={() => window.history.back()}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Retour
              </button>
            </div>
          </div>
        </Layout>
      );
    }
  }

  return <Layout>{children}</Layout>;
};

export { ProtectedRoute };
