import React from "react";
import {
  DollarSign,
  Calendar,
  FileText,
  Upload,
  Edit,
  Download,
  Receipt,
  Tag,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { useAuth } from "../../../shared/hooks";
import { useFakeDataStore } from "../../../shared/stores/fakeData";
import { formatDate, formatCurrency } from "../../../shared/utils";
import type { Expense } from "../../../shared/types";
import { USER_ROLES } from "@/shared/constants";

interface ExpenseDetailsProps {
  expense: Expense;
  onEdit: () => void;
  onClose: () => void;
}

const ExpenseDetails: React.FC<ExpenseDetailsProps> = ({
  expense,
  onEdit,
  onClose,
}) => {
  const { currentSchool, user } = useAuth();
  const { getAccountingEntriesByExpense } = useFakeDataStore();

  // Récupérer les écritures comptables liées
  const accountingEntries = getAccountingEntriesByExpense(expense.id);

  const getCategoryBadge = (category: string) => {
    const variants = {
      salaries: "success",
      utilities: "info",
      supplies: "warning",
      maintenance: "default",
      other: "default",
    } as const;

    const labels = {
      salaries: "Salaires",
      utilities: "Services",
      supplies: "Fournitures",
      maintenance: "Maintenance",
      other: "Autres",
    };

    return (
      <Badge variant={variants[category as keyof typeof variants] || "default"}>
        {labels[category as keyof typeof labels] || category}
      </Badge>
    );
  };

  const getCategoryDescription = (category: string) => {
    const descriptions = {
      salaries: "Salaires et charges sociales du personnel",
      utilities: "Services publics (eau, électricité, internet)",
      supplies: "Fournitures scolaires et matériel pédagogique",
      maintenance: "Maintenance et réparations des équipements",
      other: "Autres dépenses diverses",
    };

    return (
      descriptions[category as keyof typeof descriptions] ||
      "Catégorie non définie"
    );
  };

  const handleDownloadReceipt = () => {
    if (expense.receiptUrl) {
      // Simulation du téléchargement
      window.open(expense.receiptUrl, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Dépense {expense.expenseNumber}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              {getCategoryBadge(expense.category)}
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {formatDate(expense.expenseDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          {expense.receiptUrl && (
            <Button
              variant="outline"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={handleDownloadReceipt}
            >
              Justificatif
            </Button>
          )}
          {USER_ROLES.CASHIER !== user?.role && (
            <Button onClick={onEdit} leftIcon={<Edit className="h-4 w-4" />}>
              Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de la dépense */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Détails de la Dépense
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Numéro
                </label>
                <p className="text-gray-900 font-mono">
                  {expense.expenseNumber}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Montant
                </label>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(expense.amount, currentSchool?.currency)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Date
                </label>
                <p className="text-gray-900">
                  {formatDate(expense.expenseDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Catégorie
                </label>
                <div className="mt-1">{getCategoryBadge(expense.category)}</div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Description
              </label>
              <p className="text-gray-900">{expense.description}</p>
            </div>

            {expense.supplier && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Fournisseur
                </label>
                <p className="text-gray-900">{expense.supplier}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations sur la catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              Catégorie et Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Type de dépense
              </label>
              <div className="mt-1">{getCategoryBadge(expense.category)}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Description de la catégorie
              </label>
              <p className="text-gray-700 text-sm">
                {getCategoryDescription(expense.category)}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Compte comptable
              </label>
              <p className="text-gray-900 font-mono">
                {expense.category === "salaries"
                  ? "6411 - Charges de personnel"
                  : expense.category === "utilities"
                  ? "6061 - Services extérieurs"
                  : expense.category === "supplies"
                  ? "6011 - Achats"
                  : expense.category === "maintenance"
                  ? "6151 - Entretien et réparations"
                  : "6281 - Autres charges"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Impact comptable
              </label>
              <div className="text-sm text-gray-700">
                <p>• Débit: Compte de charge</p>
                <p>• Crédit: Caisse (5111)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Justificatif */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Justificatif
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expense.receiptUrl ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">
                    Justificatif disponible
                  </p>
                  <p className="text-sm text-green-700">
                    Document uploadé et vérifié
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Télécharger
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun justificatif</p>
              <p className="text-sm">Pensez à ajouter le reçu ou la facture</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={onEdit}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Ajouter un justificatif
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Écritures comptables générées */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Écritures Comptables Générées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountingEntries.length > 0 ? (
            <div className="space-y-3">
              {accountingEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      Compte {entry.accountCode} - {formatDate(entry.entryDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    {entry.debitAmount > 0 && (
                      <p className="text-red-600 font-medium">
                        Débit:{" "}
                        {formatCurrency(
                          entry.debitAmount,
                          currentSchool?.currency
                        )}
                      </p>
                    )}
                    {entry.creditAmount > 0 && (
                      <p className="text-blue-600 font-medium">
                        Crédit:{" "}
                        {formatCurrency(
                          entry.creditAmount,
                          currentSchool?.currency
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune écriture comptable trouvée</p>
              <p className="text-sm">
                Les écritures sont générées automatiquement
              </p>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        {expense.receiptUrl && (
          <Button
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownloadReceipt}
          >
            Télécharger Justificatif
          </Button>
        )}
      </div>
    </div>
  );
};

export { ExpenseDetails };
