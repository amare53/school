import React, { useState, useEffect } from "react";
import {
  CreditCard,
  DollarSign,
  Calendar,
  Hash,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import {
  useApiPlatformCollection,
  useAuth,
  useUI,
} from "../../../shared/hooks";
import { formatCurrency, generatePaymentNumber } from "../../../shared/utils";
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from "../../../shared/constants";
import type { Payment } from "../../../shared/types";
import {
  academicYearsApi,
  feeTypesApi,
  paymentsApi,
  studentsApi,
} from "@/shared/services/api";

interface PaymentFormProps {
  payment?: Payment | null;
  preselectedStudentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  preselectedStudentId,
  onSuccess,
  onCancel,
}) => {
  const { currentSchool, user } = useAuth();

  const [formData, setFormData] = useState({
    student: preselectedStudentId || "",
    feeType: "",
    amount: 0,
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "cash" as const,
    reference: "",
    notes: "",
    school: user?.schoolId,
    createdBy: user?.id,
    monthsCount: 1, // Pour les frais mensuels
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<any>(null);

  const { showNotification } = useUI();

  const { data: students, loading } = useApiPlatformCollection(
    (params) => studentsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 20000,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "payment__form_users_list",
      immediate: true,
    }
  );

  const { data: academicYears } = useApiPlatformCollection(
    (params) => academicYearsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 12,
      current: true,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  const { data: student } = useApiPlatformCollection(
    (params) => studentsApi.getItem(params),
    preselectedStudentId,
    {
      cacheKey: "payment__form_users_list",
      immediate: true,
      one: true,
    }
  );

  const { data: feeTypes, loading: feeTypeLoading } = useApiPlatformCollection(
    (params) => feeTypesApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 20000,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "payment__form_fees_list",
      immediate: true,
    }
  );

  const currentAcademicYear = academicYears?.find((a) => a?.current === "true");

  const studentOptions: any[] = students.map((s) => ({
    value: s.id,
    label: s.firstName + " " + s.lastName,
  }));

  const feeTypeOptions: any[] = feeTypes.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  // Initialiser le formulaire avec les données du paiement si en mode édition
  useEffect(() => {
    if (payment) {
      setFormData({
        student: payment.student,
        feeType: payment.feeType || "",
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference || "",
        notes: payment.notes || "",
        monthsCount: 1,
      });
    }
  }, [payment]);

  // Auto-remplir le montant et calculer les mois en souffrance
  useEffect(() => {
    if (formData.feeType && !payment) {
      const feeType = feeTypes.find((f) => f.id === formData.feeType);
      setSelectedFeeType(feeType);

      if (feeType) {
        if (feeType.billingFrequency === "monthly" && formData.student) {
          // Calculer les mois en souffrance pour les frais mensuels
          setFormData((prev) => ({
            ...prev,
            amount: feeType.amount,
            monthsCount: 1,
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            amount: feeType.amount,
            monthsCount: 1,
          }));
        }
      }
    }
  }, [formData.feeType, formData.student, feeTypes, payment]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "amount" || field === "monthsCount"
          ? parseFloat(e.target.value) || 0
          : e.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Recalculer le montant si on change le nombre de mois
      if (field === "monthsCount" && selectedFeeType) {
        setFormData((prev) => ({
          ...prev,
          amount: selectedFeeType.amount * (parseFloat(e.target.value) || 1),
        }));
      }

      // Effacer l'erreur
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.student) {
      newErrors.student = "L'élève est requis";
    }
    if (!formData.feeType) {
      newErrors.feeType = "Le type de frais est requis";
    }
    if (formData.amount <= 0) {
      newErrors.amount = "Le montant doit être supérieur à 0";
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = "La date de paiement est requise";
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "La méthode de paiement est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (payment) {
        // TODO: Appel API pour mise à jour
        // await paymentsApi.update(payment.id, formData);
        // showNotification("Mise à jour non implémentée", "warning");
        return;
      } else {
        // TODO: Appel API pour création
        const data = { ...formData };
        data.student = `/api/students/${data.student}`;
        data.feeType = `/api/fee_types/${data.feeType}`;
        data.school = `/api/schools/${data.school}`;
        data.createdBy = `/api/users/${data.createdBy}`;
        data.academicYear = currentAcademicYear["@id"];
        if (selectedFeeType?.billingFrequency === "monthly") {
          data.monthPayment = monthFees(false);
        }

        const response = await paymentsApi.create(data);
      }

      const action = payment ? "modifié" : "enregistré";
      showNotification(`Paiement ${action} avec succès`, "success", "", 5000);

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de la sauvegarde",
        "error",
        "",
        5000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const paymentMethodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  const selectedStudent = null;

  const monthFees = (string: boolean = true) => {
    const fees =
      student?.payments.filter((p) => p?.feeType.id === selectedFeeType.id) ||
      [];

    let month = new Date(currentAcademicYear["startDate"] || "");
    if (fees.length > 0) {
      const sorted = fees.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      month.setMonth(sorted[0].monthPayment + 1);
    }

    if (string) {
      return month.toLocaleString("fr-FR", { month: "long" });
    }

    return month.getMonth();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Informations du Paiement
        </h3>

        <Select
          label="Élève *"
          options={studentOptions}
          value={formData.student}
          onChange={handleSelectChange("student")}
          error={errors.student}
          placeholder="Sélectionner un élève"
          disabled={isLoading || !!preselectedStudentId}
        />

        <Select
          label="Type de frais *"
          options={feeTypeOptions}
          value={formData.feeType}
          onChange={handleSelectChange("feeType")}
          error={errors.feeType}
          placeholder="Sélectionner un type de frais"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Montant du paiement *"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount.toString()}
            onChange={handleChange("amount")}
            error={errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
            disabled={true}
            helperText={`Devise: ${currentSchool?.currency || "CDF"}`}
          />

          <Input
            label="Date de paiement *"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange("paymentDate")}
            error={errors.paymentDate}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>

        {/* Nombre de mois pour les frais mensuels */}
        {selectedFeeType?.billingFrequency === "monthly" && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Frais Mensuel</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-end">
                <div className="text-sm text-blue-800">
                  <p>Mois: {monthFees()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Méthode de paiement *"
            options={paymentMethodOptions}
            value={formData.paymentMethod}
            onChange={handleSelectChange("paymentMethod")}
            error={errors.paymentMethod}
            disabled={isLoading}
          />

          <Input
            label="Référence"
            placeholder="Numéro de chèque, référence virement..."
            value={formData.reference}
            onChange={handleChange("reference")}
            error={errors.reference}
            leftIcon={<Hash className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Optionnel selon la méthode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange("notes")}
            placeholder="Notes sur le paiement..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu du paiement */}
      {selectedStudent && selectedFeeType && formData.amount > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Aperçu du paiement :
          </h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>
                Élève : {selectedStudent.firstName} {selectedStudent.lastName}
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>
                Frais : {selectedFeeType.name}
                {selectedFeeType.billingFrequency === "monthly" &&
                  ` (${formData.monthsCount} mois)`}
              </span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>
                Montant :{" "}
                {formatCurrency(formData.amount, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Date :{" "}
                {new Date(formData.paymentDate).toLocaleDateString("fr-FR")}
              </span>
            </div>
            {selectedFeeType.billingFrequency === "monthly" &&
              formData.monthsCount > 1 && (
                <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                  <p className="font-medium">Paiement rétroactif :</p>
                  <p>
                    Ce paiement couvrira {formData.monthsCount} mois en
                    commençant par le mois le plus ancien en souffrance.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Informations sur les écritures comptables */}
      {!payment && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">
                Écritures comptables automatiques :
              </p>
              <ul className="space-y-1 text-xs">
                <li>
                  • <strong>Débit Caisse (5111)</strong> :{" "}
                  {formatCurrency(formData.amount, currentSchool?.currency)}
                </li>
                <li>
                  • <strong>Crédit Produits Scolaires (7011)</strong> :{" "}
                  {formatCurrency(formData.amount, currentSchool?.currency)}
                </li>
                <li>• Les écritures seront générées automatiquement</li>
              </ul>
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
          disabled={
            isLoading ||
            formData.amount <= 0 ||
            !formData.student ||
            !formData.feeType
          }
        >
          {payment ? "Modifier" : "Enregistrer"} le Paiement
        </Button>
      </div>
    </form>
  );
};

export { PaymentForm };
