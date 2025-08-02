import React, { useState } from "react";
import { Calculator, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { useAuth, useUI } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import { cashRegisterService } from "../services/cashService";
import {
  cashRegisterSessionSchema,
  type CashRegisterSessionFormData,
} from "../../../shared/validations/cash";
import { formatCurrency } from "@/shared/utils";

interface OpenSessionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const OpenSessionForm: React.FC<OpenSessionFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { currentSchool, user } = useAuth();
  const { setActiveSession } = useCash();
  const { showNotification } = useUI();

  const [formData, setFormData] = useState<CashRegisterSessionFormData>({
    startingCashAmount: 50000, // Valeur par défaut
    notes: "",
  });
  const [errors, setErrors] = useState<Partial<CashRegisterSessionFormData>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (field: keyof CashRegisterSessionFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "startingCashAmount"
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
      cashRegisterSessionSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<CashRegisterSessionFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof CashRegisterSessionFormData;
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
      const session = await cashRegisterService.openSession(formData);
      setActiveSession(session);

      showNotification(
        "Session de caisse ouverte avec succès",
        "success",
        "Session Ouverte",
        5000
      );

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de l'ouverture de la session",
        "error",
        "",
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Ouverture de Session de Caisse
        </h3>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Informations importantes :</p>
              <ul className="space-y-1 text-xs">
                <li>
                  • Une seule session peut être ouverte par caissier et par jour
                </li>
                <li>
                  • Le fonds de caisse initial doit correspondre à l'argent
                  physiquement présent
                </li>
                <li>
                  • Tous les paiements de la journée seront liés à cette session
                </li>
                <li>• Vous pourrez fermer la session en fin de journée</li>
              </ul>
            </div>
          </div>
        </div>

        <Input
          label="Fonds de caisse initial *"
          type="number"
          min="0"
          step="100"
          value={formData.startingCashAmount.toString()}
          onChange={handleChange("startingCashAmount")}
          error={errors.startingCashAmount}
          leftIcon={<DollarSign className="h-4 w-4" />}
          helperText={`Montant en ${
            currentSchool?.currency || "CDF"
          } présent physiquement en caisse`}
          disabled={isLoading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder="Notes sur l'ouverture de session..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
        </div>
      </div>

      {/* Aperçu */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-medium text-green-900 mb-2">
          Aperçu de la session :
        </h4>
        <div className="space-y-1 text-sm text-green-800">
          <p>
            • Fonds initial :{" "}
            {formatCurrency(
              formData.startingCashAmount,
              currentSchool?.currency
            )}
          </p>
          <p>• Date d'ouverture : {new Date().toLocaleDateString("fr-FR")}</p>
          <p>
            • Caissier : {user?.firstName} {user?.lastName}
          </p>
          <p>• École : {currentSchool?.name}</p>
        </div>
      </div>

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
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          Ouvrir la Session
        </Button>
      </div>
    </form>
  );
};

export { OpenSessionForm };
