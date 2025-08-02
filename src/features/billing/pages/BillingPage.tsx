import React from "react";
import { FileText } from "lucide-react";
import { useAuth } from "../../../shared/hooks";
import { FeeTypesList } from "../components/FeeTypesList";
import { USER_ROLES } from "@/shared/constants";

const BillingPage: React.FC = () => {
  const { user } = useAuth();
  // Vérifier les permissions
  if (!user || ![USER_ROLES.SCHOOL_MANAGER].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour gérer la facturation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Content */}
      <div className="mt-6">
        <FeeTypesList />
      </div>
    </div>
  );
};

export { BillingPage };
