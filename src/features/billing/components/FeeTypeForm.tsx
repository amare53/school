import React, { useState, useEffect } from "react";
import { DollarSign, FileText, Clock, AlertCircle } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { useAuth, useUI } from "../../../shared/hooks";
import {
  feeTypeSchema,
  type FeeTypeFormData,
} from "../../../shared/validations";
import type { FeeType } from "../../../shared/types";

interface FeeTypeFormProps {
  feeType?: FeeType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const FeeTypeForm: React.FC<FeeTypeFormProps> = ({
  feeType,
  onSuccess,
  onCancel,
}) => {
  const { currentSchool } = useAuth();
  const [formData, setFormData] = useState<FeeTypeFormData>({
    name: "",
    description: "",
    amount: 0,
    isMandatory: true,
    billingFrequency: "once",
  });
  const [errors, setErrors] = useState<Partial<FeeTypeFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données du type de frais si en mode édition
  useEffect(() => {
    if (feeType) {
      setFormData({
        name: feeType.name,
        description: feeType.description || "",
        amount: feeType.amount,
        isMandatory: feeType.isMandatory,
        billingFrequency: feeType.billingFrequency,
      });
    }
  }, [feeType]);

  const handleChange =
    (field: keyof FeeTypeFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "amount" ? parseFloat(e.target.value) || 0 : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Effacer l'erreur quand l'utilisateur tape
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange =
    (field: keyof FeeTypeFormData) => (value: string) => {
      const processedValue = field === "isMandatory" ? value === "true" : value;
      setFormData((prev) => ({ ...prev, [field]: processedValue }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    try {
      feeTypeSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<FeeTypeFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof FeeTypeFormData;
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
      if (feeType) {
        // TODO: Appel API pour mise à jour
        // await feeTypesApi.update(feeType.id, formData);
        showNotification("Mise à jour non implémentée", "warning");
        return;
      } else {
        // TODO: Appel API pour création
        // await feeTypesApi.create(formData);
        showNotification("Création non implémentée", "warning");
        return;
      }

      const action = feeType ? "modifié" : "créé";
      showNotification(`Type de frais ${action} avec succès`, "success");

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de la sauvegarde",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const frequencyOptions = [
    { value: "once", label: "Une fois (ponctuel)" },
    { value: "monthly", label: "Mensuel" },
    { value: "quarterly", label: "Trimestriel" },
    { value: "annually", label: "Annuel" },
  ];

  const mandatoryOptions = [
    { value: "true", label: "Obligatoire" },
    { value: "false", label: "Optionnel" },
  ];

  // Suggestions de types de frais courants
  const feeTypeSuggestions = [
    {
      name: "Frais d'inscription",
      amount: 25000,
      frequency: "once",
      mandatory: true,
    },
    {
      name: "Frais de scolarité",
      amount: 15000,
      frequency: "monthly",
      mandatory: true,
    },
    {
      name: "Frais de cantine",
      amount: 8000,
      frequency: "monthly",
      mandatory: false,
    },
    {
      name: "Frais de transport",
      amount: 5000,
      frequency: "monthly",
      mandatory: false,
    },
    {
      name: "Frais d'examen",
      amount: 10000,
      frequency: "once",
      mandatory: true,
    },
    {
      name: "Frais de bibliothèque",
      amount: 3000,
      frequency: "annually",
      mandatory: false,
    },
  ];

  const handleSuggestionClick = (
    suggestion: (typeof feeTypeSuggestions)[0]
  ) => {
    setFormData((prev) => ({
      ...prev,
      name: suggestion.name,
      amount: suggestion.amount,
      billingFrequency: suggestion.frequency as any,
      isMandatory: suggestion.mandatory,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Informations du Type de Frais
        </h3>

        <Input
          label="Nom du type de frais *"
          placeholder="Ex: Frais de scolarité"
          value={formData.name}
          onChange={handleChange("name")}
          error={errors.name}
          disabled={isLoading}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange("description")}
            placeholder="Description détaillée du type de frais..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Montant (XOF) *"
            type="number"
            min="0"
            step="100"
            value={formData.amount.toString()}
            onChange={handleChange("amount")}
            error={errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
            disabled={isLoading}
          />

          <Select
            label="Fréquence de facturation *"
            options={frequencyOptions}
            value={formData.billingFrequency}
            onChange={handleSelectChange("billingFrequency")}
            error={errors.billingFrequency}
            disabled={isLoading}
          />
        </div>

        <Select
          label="Type de frais *"
          options={mandatoryOptions}
          value={formData.isMandatory.toString()}
          onChange={handleSelectChange("isMandatory")}
          error={errors.isMandatory}
          disabled={isLoading}
        />
      </div>

      {/* Suggestions */}
      {!feeType && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Suggestions de types de frais :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {feeTypeSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium text-gray-900">
                  {suggestion.name}
                </div>
                <div className="text-gray-600 text-xs">
                  {suggestion.amount.toLocaleString()} XOF -{" "}
                  {
                    frequencyOptions.find(
                      (f) => f.value === suggestion.frequency
                    )?.label
                  }
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aperçu */}
      {formData.name && formData.amount > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Aperçu du type de frais :
          </h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-blue-900">{formData.name}</div>
              <div className="text-sm text-blue-700">
                {formData.amount.toLocaleString()} XOF -{" "}
                {
                  frequencyOptions.find(
                    (f) => f.value === formData.billingFrequency
                  )?.label
                }
              </div>
              <div className="text-xs text-blue-600">
                {formData.isMandatory ? "Obligatoire" : "Optionnel"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations importantes */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Points importants :</p>
            <ul className="space-y-1 text-xs">
              <li>
                • Les frais obligatoires seront automatiquement appliqués à tous
                les élèves
              </li>
              <li>
                • Les frais récurrents génèrent des factures automatiques selon
                la fréquence
              </li>
              <li>
                • Vous pourrez créer des règles spécifiques par section ou
                classe
              </li>
              <li>
                • Les montants peuvent être surchargés dans les règles de
                facturation
              </li>
            </ul>
          </div>
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
          {feeType ? "Modifier" : "Créer"} le Type de Frais
        </Button>
      </div>
    </form>
  );
};

export { FeeTypeForm };
