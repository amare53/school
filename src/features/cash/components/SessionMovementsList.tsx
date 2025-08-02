import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Clock } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { useAuth } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import { formatCurrency, formatDate } from "../../../shared/utils";
import type { CashMovement } from "../../../shared/types/cash";

const SessionMovementsList: React.FC = () => {
  const { currentSchool } = useAuth();
  const { sessionMovements, movementsLoading, sessionStats } = useCash();

  const getMovementTypeBadge = (type: string) => {
    const variants = {
      in: "success",
      out: "danger",
    } as const;

    const labels = {
      in: "Entrée",
      out: "Sortie",
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || "default"}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const columns: Column<CashMovement>[] = [
    {
      key: "movementNumber",
      title: "N° Mouvement",
      render: (_, movement) => (
        <div className="flex items-center space-x-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              movement.typeMovement === "in" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {movement.typeMovement === "in" ? (
              <ArrowUp className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {movement.movementNumber}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(movement.createdAt, "HH:mm")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "typeMovement",
      title: "Type",
      render: (type) => getMovementTypeBadge(type),
    },
    {
      key: "amount",
      title: "Montant",
      render: (amount, movement) => (
        <div
          className={`font-medium ${
            movement.typeMovement === "in" ? "text-green-600" : "text-red-600"
          }`}
        >
          {movement.typeMovement === "in" ? "+" : "-"}
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Heure",
      render: (date) => (
        <div className="text-sm text-gray-600">
          {formatDate(date, "HH:mm:ss")}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ArrowUpDown className="h-5 w-5 mr-2" />
            Mouvements Manuels ({sessionMovements.length})
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Impact net</div>
            <div
              className={`text-lg font-bold ${
                sessionStats.totalMovementsIn -
                  sessionStats.totalMovementsOut >=
                0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {sessionStats.totalMovementsIn - sessionStats.totalMovementsOut >=
              0
                ? "+"
                : ""}
              {formatCurrency(
                sessionStats.totalMovementsIn - sessionStats.totalMovementsOut,
                currentSchool?.currency
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessionMovements.length > 0 ? (
          <>
            <Table
              data={sessionMovements}
              columns={columns}
              loading={movementsLoading}
              emptyMessage="Aucun mouvement enregistré"
            />

            {/* Résumé des mouvements */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm font-medium text-green-900">
                      Entrées
                    </span>
                  </div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(
                      sessionStats.totalMovementsIn,
                      currentSchool?.currency
                    )}
                  </div>
                </div>

                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                    <span className="text-sm font-medium text-red-900">
                      Sorties
                    </span>
                  </div>
                  <div className="font-bold text-red-600">
                    {formatCurrency(
                      sessionStats.totalMovementsOut,
                      currentSchool?.currency
                    )}
                  </div>
                </div>

                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <ArrowUpDown className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-sm font-medium text-blue-900">
                      Net
                    </span>
                  </div>
                  <div
                    className={`font-bold ${
                      sessionStats.totalMovementsIn -
                        sessionStats.totalMovementsOut >=
                      0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {sessionStats.totalMovementsIn -
                      sessionStats.totalMovementsOut >=
                    0
                      ? "+"
                      : ""}
                    {formatCurrency(
                      sessionStats.totalMovementsIn -
                        sessionStats.totalMovementsOut,
                      currentSchool?.currency
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ArrowUpDown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun mouvement manuel</p>
            <p className="text-sm">Les mouvements de caisse apparaîtront ici</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SessionMovementsList };
