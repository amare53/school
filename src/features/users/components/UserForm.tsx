import React, { useState, useEffect } from "react";
import { User, Mail, Phone, UserCog, Building } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { useAuth, useUI } from "../../../shared/hooks";
import { userSchema } from "../../../shared/validations";
import type { User as UserType } from "../../../shared/types";

interface UserFormProps {
  user?: UserType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "cashier" as "cashier" | "accountant",
    phone: "",
    schoolId: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // TODO: Remplacer par des appels API réels
  const schools: any[] = [];

  // Obtenir les écoles accessibles au school manager
  const getAccessibleSchools = () => {
    if (!currentUser || currentUser.role !== "school_manager") return [];

    const schoolIds =
      currentUser.assignedSchools ||
      (currentUser.schoolId ? [currentUser.schoolId] : []);
    return schools.filter((school) => schoolIds.includes(school.id));
  };

  const accessibleSchools = getAccessibleSchools();

  // Initialiser le formulaire avec les données de l'utilisateur si en mode édition
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as "cashier" | "accountant",
        phone: user.phone || "",
        schoolId: user.schoolId || "",
        password: "",
      });
    } else if (accessibleSchools.length === 1) {
      // Si une seule école accessible, la présélectionner
      setFormData((prev) => ({ ...prev, schoolId: accessibleSchools[0].id }));
    }
  }, [user, accessibleSchools]);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Effacer l'erreur quand l'utilisateur tape
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

    try {
      userSchema.parse(formData);
    } catch (error: any) {
      error.errors?.forEach((err: any) => {
        const field = err.path[0];
        newErrors[field] = err.message;
      });
    }

    if (!formData.schoolId) {
      newErrors.schoolId = "L'école est requise";
    }

    if (!user && !formData.password) {
      newErrors.password =
        "Le mot de passe est requis pour un nouvel utilisateur";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userData = {
        ...formData,
        status: "active" as const,
        ...(formData.password && { password: formData.password }),
      };

      if (user) {
        // TODO: Appel API pour mise à jour
        // await usersApi.update(user.id, userData);
        showNotification("Mise à jour non implémentée", "warning");
        return;
      } else {
        // TODO: Appel API pour création
        // await usersApi.create(userData);
        showNotification("Création non implémentée", "warning");
        return;
      }

      const action = user ? "modifié" : "créé";
      showNotification(`Utilisateur ${action} avec succès`, "success");

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

  const roleOptions = [
    { value: "cashier", label: "Caissier" },
    { value: "accountant", label: "Comptable" },
  ];

  const schoolOptions = accessibleSchools.map((school) => ({
    value: school.id,
    label: `${school.name} (${school.subscriptionPlan})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations personnelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2" />
          Informations Personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prénom *"
            placeholder="Prénom de l'utilisateur"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={errors.firstName}
            disabled={isLoading}
          />

          <Input
            label="Nom *"
            placeholder="Nom de famille"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={errors.lastName}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Email *"
          type="email"
          placeholder="email@exemple.com"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={isLoading}
        />

        <Input
          label="Téléphone"
          placeholder="+243 XX XXX XXXX"
          value={formData.phone}
          onChange={handleChange("phone")}
          error={errors.phone}
          leftIcon={<Phone className="h-4 w-4" />}
          disabled={isLoading}
        />

        {!user && (
          <Input
            label="Mot de passe *"
            type="password"
            placeholder="Mot de passe temporaire"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            disabled={isLoading}
            helperText="L'utilisateur pourra le changer lors de sa première connexion"
          />
        )}
      </div>

      {/* Rôle et assignation */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <UserCog className="h-5 w-5 mr-2" />
          Rôle et Assignation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Rôle *"
            options={roleOptions}
            value={formData.role}
            onChange={handleSelectChange("role")}
            error={errors.role}
            disabled={isLoading}
          />

          <Select
            label="École *"
            options={schoolOptions}
            value={formData.schoolId}
            onChange={handleSelectChange("schoolId")}
            error={errors.schoolId}
            placeholder="Sélectionner une école"
            disabled={isLoading || accessibleSchools.length === 1}
            helperText={
              accessibleSchools.length === 1
                ? "École présélectionnée automatiquement"
                : undefined
            }
          />
        </div>
      </div>

      {/* Aperçu */}
      {formData.firstName && formData.lastName && formData.schoolId && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Aperçu de l'utilisateur :
          </h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              Nom : {formData.firstName} {formData.lastName}
            </p>
            <p>
              Rôle : {roleOptions.find((r) => r.value === formData.role)?.label}
            </p>
            <p>
              École :{" "}
              {schoolOptions.find((s) => s.value === formData.schoolId)?.label}
            </p>
            <p>Email : {formData.email}</p>
          </div>
        </div>
      )}

      {/* Informations sur les permissions */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-900 mb-2">
          Permissions selon le rôle :
        </h4>
        <div className="text-sm text-yellow-800">
          {formData.role === "cashier" ? (
            <ul className="space-y-1 text-xs">
              <li>• Gestion des élèves (création, modification)</li>
              <li>• Gestion des factures et paiements</li>
              <li>• Enregistrement des dépenses</li>
              <li>• Consultation des rapports financiers</li>
            </ul>
          ) : (
            <ul className="space-y-1 text-xs">
              <li>• Consultation des données comptables</li>
              <li>• Génération des rapports comptables</li>
              <li>• Consultation des paiements et factures</li>
              <li>• Consultation des dépenses</li>
            </ul>
          )}
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
          {user ? "Modifier" : "Créer"} l'Utilisateur
        </Button>
      </div>
    </form>
  );
};

export { UserForm };
