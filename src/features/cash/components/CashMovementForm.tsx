import React, { useState } from "react";
import { ArrowUpDown, DollarSign, FileText, AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { useAuth, useUI } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import { cashMovementService } from "../services/cashService";
import { formatCurrency } from "../../../shared/utils";
import {
  cashMovementSchema,
  type CashMovementFormData,
} from "../../../shared/validations/cash";

interface CashMovementFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CashMovementForm: React.FC<CashMovementFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { currentSchool, user } = useAuth();
  const { activeSession, addMovement } = useCash();
  const { showNotification } = useUI();

  const [formData, setFormData] = useState<CashMovementFormData>({
    typeMovement: "in",
    amount: "0",
    reason: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<CashMovementFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange =
    (field: keyof CashMovementFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Effacer l'erreur
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange =
    (field: keyof CashMovementFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    try {
      cashMovementSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<CashMovementFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof CashMovementFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!activeSession) {
      showNotification("Aucune session de caisse active", "error", "", 5000);
      return;
    }

    setIsLoading(true);

    try {
      const data = { ...formData };
      data.cashRegisterSession =
        "/api/cash_register_sessions/" + activeSession.id;
      data.school = "/api/schools/" + currentSchool?.id;
      data.createdBy = "/api/users/" + user?.id;
      const movement = await cashMovementService.recordMovement(data);
      addMovement(movement);

      showNotification(
        `Mouvement de caisse enregistré avec succès`,
        "success",
        "Mouvement Enregistré",
        5000
      );

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de l'enregistrement du mouvement",
        "error",
        "",
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: "in", label: "Entrée (+)" },
    { value: "out", label: "Sortie (-)" },
  ];

  // Suggestions de motifs selon le type
  const reasonSuggestions = {
    in: [
      "Ajout de fonds",
      "Remboursement",
      "Correction d'erreur",
      "Fonds supplémentaires",
    ],
    out: [
      "Dépôt à la banque",
      "Retrait exceptionnel",
      "Remboursement élève",
      "Correction d'erreur",
      "Achat urgent",
    ],
  };

  const currentSuggestions = reasonSuggestions[formData.typeMovement];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ArrowUpDown className="h-5 w-5 mr-2" />
          Mouvement de Caisse Manuel
        </h3>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Attention :</p>
              <p>
                Les mouvements manuels affectent directement le solde de caisse.
                Assurez-vous que le mouvement correspond à une opération réelle.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type de mouvement *"
            options={typeOptions}
            value={formData.typeMovement}
            onChange={handleSelectChange("typeMovement")}
            error={errors.typeMovement}
            disabled={isLoading}
          />

          <Input
            label="Montant *"
            type="number"
            min="0"
            step="100"
            value={formData.amount.toString()}
            onChange={handleChange("amount")}
            error={errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
            helperText={`Devise: ${currentSchool?.currency || "CDF"}`}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Motif *"
          placeholder="Raison du mouvement de caisse"
          value={formData.reason}
          onChange={handleChange("reason")}
          error={errors.reason}
          disabled={isLoading}
        />

        {/* Suggestions de motifs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motifs suggérés :
          </label>
          <div className="flex flex-wrap gap-2">
            {currentSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, reason: suggestion }))
                }
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description détaillée (optionnel)
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange("description")}
            placeholder="Description détaillée du mouvement..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu du mouvement */}
      {formData.amount > 0 && formData.reason && (
        <div
          className={`p-4 rounded-lg border ${
            formData.typeMovement === "in"
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <h4
            className={`font-medium mb-2 ${
              formData.typeMovement === "in" ? "text-green-900" : "text-red-900"
            }`}
          >
            Aperçu du mouvement :
          </h4>
          <div
            className={`space-y-1 text-sm ${
              formData.typeMovement === "in" ? "text-green-800" : "text-red-800"
            }`}
          >
            <p>
              • Type : {formData.typeMovement === "in" ? "Entrée" : "Sortie"} de
              caisse
            </p>
            <p>
              • Montant : {formData.typeMovement === "in" ? "+" : "-"}
              {formatCurrency(formData.amount, currentSchool?.currency)}
            </p>
            <p>• Motif : {formData.reason}</p>
            <p>• Session : {activeSession?.sessionNumber}</p>
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
          disabled={isLoading || !activeSession}
          variant={formData.typeMovement === "out" ? "danger" : "primary"}
        >
          Enregistrer le Mouvement
        </Button>
      </div>
    </form>
  );
};

export { CashMovementForm };
