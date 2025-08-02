import React from "react";
import {
  Calculator,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent } from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Button } from "../../../shared/components/ui/Button";
import { useAuth } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import { formatCurrency, formatDate } from "../../../shared/utils";

interface SessionHeaderProps {
  onOpenSession: () => void;
  onCloseSession: () => void;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  onOpenSession,
  onCloseSession,
}) => {
  const { user, currentSchool } = useAuth();
  const { activeSession, sessionStats, hasActiveSession, isSessionOpen } =
    useCash();

  if (!hasActiveSession) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-orange-900">
                  Aucune session de caisse active
                </h3>
                <p className="text-orange-700">
                  Vous devez ouvrir une session pour commencer à enregistrer des
                  paiements
                </p>
              </div>
            </div>
            <Button
              onClick={onOpenSession}
              leftIcon={<Calculator className="h-4 w-4" />}
            >
              Ouvrir une Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-2 ${
        isSessionOpen ? "border-green-200 bg-green-50" : "border-gray-200"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          {/* Informations de session */}
          <div className="flex items-center space-x-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calculator className="h-6 w-6 text-green-600" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Caissier
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Session
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {activeSession?.sessionNumber}
                </p>
                <p className="text-sm text-gray-500">
                  Ouverte le{" "}
                  {formatDate(activeSession?.sessionDate || "", "dd/MM/yyyy")}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Fonds Initial
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(
                    activeSession?.startingCashAmount || 0,
                    currentSchool?.currency
                  )}
                </p>
              </div>

              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Calculator className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">
                    Solde Attendu
                  </span>
                </div>
                <p className="font-semibold text-green-600">
                  {formatCurrency(
                    sessionStats.expectedBalance,
                    currentSchool?.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Actions et statut */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <Badge
                variant={isSessionOpen ? "success" : "default"}
                className="mb-2"
              >
                {isSessionOpen ? "Session Ouverte" : "Session Fermée"}
              </Badge>
              <div className="text-sm text-gray-600">
                {sessionStats.paymentsCount} paiement(s) •{" "}
                {sessionStats.movementsCount} mouvement(s)
              </div>
            </div>

            {isSessionOpen && (
              <Button
                onClick={onCloseSession}
                variant="outline"
                leftIcon={<Clock className="h-4 w-4" />}
              >
                Fermer la Session
              </Button>
            )}
          </div>
        </div>

        {/* Résumé rapide des encaissements */}
        {isSessionOpen && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Espèces</p>
                <p className="font-bold text-green-600">
                  {formatCurrency(
                    sessionStats.paymentsByMode?.cash || 0,
                    currentSchool?.currency
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Mobile Money</p>
                <p className="font-bold text-blue-600">
                  {formatCurrency(
                    sessionStats.paymentsByMode?.mobile_money || 0,
                    currentSchool?.currency
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Virement</p>
                <p className="font-bold text-purple-600">
                  {formatCurrency(
                    sessionStats.paymentsByMode?.bank_transfer || 0,
                    currentSchool?.currency
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Chèque</p>
                <p className="font-bold text-orange-600">
                  {formatCurrency(
                    sessionStats.paymentsByMode?.check || 0,
                    currentSchool?.currency
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SessionHeader };
