import React from "react";
import { CreditCard, User, DollarSign, Clock } from "lucide-react";
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
import type { Payment } from "../../../shared/types/cash";

const SessionPaymentsList: React.FC = () => {
  const { currentSchool } = useAuth();
  const { sessionPayments, paymentsLoading } = useCash();

  const getPaymentModeBadge = (mode: string) => {
    const variants = {
      cash: "success",
      mobile_money: "info",
      bank_transfer: "warning",
      check: "default",
    } as const;

    const labels = {
      cash: "Espèces",
      mobile_money: "Mobile Money",
      bank_transfer: "Virement",
      check: "Chèque",
    };

    return (
      <Badge variant={variants[mode as keyof typeof variants] || "default"}>
        {labels[mode as keyof typeof labels] || mode}
      </Badge>
    );
  };

  const columns: Column<Payment>[] = [
    {
      key: "paymentNumber",
      title: "N° Paiement",
      render: (_, payment) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {payment.paymentNumber}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(payment.createdAt, "HH:mm")}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "student",
      title: "Élève",
      render: (_, payment) => (
        <div>
          <div className="font-medium text-gray-900">
            {payment.student?.firstName} {payment.student?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            N° {payment.student?.studentNumber}
          </div>
        </div>
      ),
    },
    {
      key: "feeType",
      title: "Type de Frais",
      render: (_, payment) => (
        <div className="text-sm text-gray-900">
          {payment.feeType?.name || "Type inconnu"}
        </div>
      ),
    },
    {
      key: "amount",
      title: "Montant",
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "paymentMethod",
      title: "Mode",
      render: (mode) => getPaymentModeBadge(mode),
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

  // Calculer les totaux par mode de paiement
  const totalsByMode = sessionPayments.reduce((acc, payment) => {
    acc[payment.paymentMode] = (acc[payment.paymentMode] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Paiements de la Session ({sessionPayments.length})
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total encaissé</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(
                sessionPayments.reduce((sum, p) => sum + p.amount, 0),
                currentSchool?.currency
              )}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessionPayments.length > 0 ? (
          <>
            <Table
              data={sessionPayments}
              columns={columns}
              loading={paymentsLoading}
              emptyMessage="Aucun paiement enregistré"
            />
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucun paiement enregistré</p>
            <p className="text-sm">
              Les paiements apparaîtront ici au fur et à mesure
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { SessionPaymentsList };
