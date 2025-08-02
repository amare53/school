import React, { useState } from "react";
import {
  Calculator,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent } from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Badge } from "../../../shared/components/ui/Badge";
import { useAuth, useUI } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import { cashRegisterService } from "../services/cashService";
import { formatCurrency } from "../../../shared/utils";
import {
  sessionClosingSchema,
  type SessionClosingFormData,
} from "../../../shared/validations/cash";

interface CloseSessionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CloseSessionForm: React.FC<CloseSessionFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { currentSchool } = useAuth();
  const { activeSession, sessionStats, clearSession } = useCash();
  const { showNotification } = useUI();

  const [formData, setFormData] = useState<SessionClosingFormData>({
    actualClosingBalance: sessionStats.expectedBalance,
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<SessionClosingFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  if (!activeSession) return null;

  const cashDifference =
    formData.actualClosingBalance - sessionStats.expectedBalance;
  const hasDifference = Math.abs(cashDifference) > 0.01;

  const handleChange =
    (field: keyof SessionClosingFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "actualClosingBalance"
          ? parseFloat(e.target.value) || 0
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Effacer l'erreur
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    try {
      sessionClosingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<SessionClosingFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof SessionClosingFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await cashRegisterService.closeSession(activeSession.id, formData);
      clearSession();

      showNotification(
        "Session de caisse fermée avec succès",
        "success",
        "Session Fermée",
        3000
      );

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de la fermeture de la session",
        "error",
        "",
        3000
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Résumé de la session */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Fermeture de Session - {activeSession.sessionNumber}
        </h3>

        {/* Statistiques de la session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Résumé des Encaissements
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fonds initial :</span>
                  <span className="font-medium">
                    {formatCurrency(
                      activeSession.startingCashAmount,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total paiements :</span>
                  <span className="font-medium text-green-600">
                    +
                    {formatCurrency(
                      sessionStats.totalPayments,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Entrées manuelles :</span>
                  <span className="font-medium text-blue-600">
                    +
                    {formatCurrency(
                      sessionStats.totalMovementsIn,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sorties manuelles :</span>
                  <span className="font-medium text-red-600">
                    -
                    {formatCurrency(
                      sessionStats.totalMovementsOut,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span>Solde attendu :</span>
                  <span className="text-green-600">
                    {formatCurrency(
                      sessionStats.expectedBalance,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Répartition par Mode
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Espèces :</span>
                  <span className="font-medium">
                    {formatCurrency(
                      sessionStats.paymentsByMode.cash,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mobile Money :</span>
                  <span className="font-medium">
                    {formatCurrency(
                      sessionStats.paymentsByMode.mobile_money,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Virement :</span>
                  <span className="font-medium">
                    {formatCurrency(
                      sessionStats.paymentsByMode.bank_transfer,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chèque :</span>
                  <span className="font-medium">
                    {formatCurrency(
                      sessionStats.paymentsByMode.check,
                      currentSchool?.currency
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Saisie du montant réel */}
        <Input
          label="Montant réellement en caisse *"
          type="number"
          min="0"
          step="100"
          value={formData.actualClosingBalance.toString()}
          onChange={handleChange("actualClosingBalance")}
          error={errors.actualClosingBalance}
          leftIcon={<DollarSign className="h-4 w-4" />}
          helperText="Comptez physiquement l'argent présent en caisse"
          disabled={isLoading}
        />

        {/* Affichage de l'écart */}
        {hasDifference && (
          <Card
            className={`border-2 ${
              cashDifference > 0
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                {cashDifference > 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
                <div>
                  <h4
                    className={`font-medium ${
                      cashDifference > 0 ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {cashDifference > 0
                      ? "Excédent de caisse"
                      : "Manque en caisse"}
                  </h4>
                  <p
                    className={`text-2xl font-bold ${
                      cashDifference > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {cashDifference > 0 ? "+" : ""}
                    {formatCurrency(cashDifference, currentSchool?.currency)}
                  </p>
                  <p
                    className={`text-sm ${
                      cashDifference > 0 ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {cashDifference > 0
                      ? "Il y a plus d'argent que prévu en caisse"
                      : "Il manque de l'argent en caisse"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes de fermeture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes de fermeture {hasDifference ? "*" : "(optionnel)"}
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder={
              hasDifference
                ? "Expliquez la raison de l'écart de caisse..."
                : "Notes sur la fermeture de session..."
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {hasDifference && (
            <p className="mt-1 text-sm text-orange-600">
              Une explication est recommandée en cas d'écart de caisse
            </p>
          )}
        </div>
      </div>

      {/* Avertissement pour les écarts importants */}
      {Math.abs(cashDifference) > 10000 && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Écart important détecté !</p>
              <p>
                L'écart de caisse est supérieur à 10.000{" "}
                {currentSchool?.currency}. Veuillez vérifier vos calculs et
                expliquer la raison dans les notes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          variant={hasDifference ? "danger" : "primary"}
        >
          {hasDifference ? "Fermer avec Écart" : "Fermer la Session"}
        </Button>
      </div>
    </form>
  );
};

export { CloseSessionForm };
