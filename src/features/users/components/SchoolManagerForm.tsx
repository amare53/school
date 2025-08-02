import React, { useState, useEffect } from "react";
import { UserCog, Mail, Phone, User, Building } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import {
  useApiPlatformCollection,
  useAuth,
  useUI,
} from "../../../shared/hooks";
import { userSchema } from "../../../shared/validations";
import type { User as UserType } from "../../../shared/types";
import { schoolsApi, usersApi } from "@/shared/services/api";
import { USER_ROLES } from "@/shared/constants";

interface SchoolManagerFormProps {
  manager?: UserType | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SchoolManagerForm: React.FC<SchoolManagerFormProps> = ({
  manager,
  onSuccess,
  onCancel,
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    assignedSchools: [] as string[],
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // TODO: Remplacer par des appels API réels
  const { data: schools } = useApiPlatformCollection(
    (params) => schoolsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 50,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  // Initialiser le formulaire avec les données du manager si en mode édition
  useEffect(() => {
    if (manager) {
      setFormData({
        email: manager.email,
        firstName: manager.firstName,
        lastName: manager.lastName,
        phone: manager.phone || "",
        assignedSchools:
          manager.assignedSchools ||
          (manager.schoolId ? [manager.schoolId] : []),
        password: "",
      });
    }
  }, [manager]);

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Effacer l'erreur quand l'utilisateur tape
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSchoolsChange = (schoolIds: string[]) => {
    setFormData((prev) => ({ ...prev, assignedSchools: schoolIds }));
    if (errors.assignedSchools) {
      setErrors((prev) => ({ ...prev, assignedSchools: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    try {
      userSchema.parse({
        ...formData,
        role: "school_manager",
      });
    } catch (error: any) {
      error.errors?.forEach((err: any) => {
        const field = err.path[0];
        newErrors[field] = err.message;
      });
    }

    if (formData.assignedSchools.length === 0) {
      newErrors.assignedSchools = "Au moins une école doit être assignée";
    }

    if (!manager && !formData.password) {
      newErrors.password = "Le mot de passe est requis pour un nouveau manager";
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
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: USER_ROLES.SCHOOL_MANAGER,
        managedSchools: formData.assignedSchools.map(
          (s) => "/api/schools/" + s
        ),
        status: "active" as const,
        ...(formData.password && { plainPassword: formData.password }),
      };

      if (manager) {
        // TODO: Appel API pour mise à jour
        // await usersApi.update(manager.id, userData);
        showNotification("Mise à jour non implémentée", "warning");
        return;
      } else {
        // TODO: Appel API pour création
        await usersApi.create(userData);
      }

      const action = manager ? "modifié" : "créé";
      showNotification(`School Manager ${action} avec succès`, "success");

      onSuccess();
    } catch (error: any) {
      showNotification(
        error.message || "Erreur lors de la sauvegarde",
        "error",
        "",
        3000
      );
    } finally {
      setIsLoading(false);
    }
  };

  const schoolOptions = schools.map((school) => ({
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
            placeholder="Prénom du manager"
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

        {!manager && (
          <Input
            label="Mot de passe *"
            type="password"
            placeholder="Mot de passe temporaire"
            value={formData.password}
            onChange={handleChange("password")}
            error={errors.password}
            disabled={isLoading}
            helperText="Le manager pourra le changer lors de sa première connexion"
          />
        )}
      </div>

      {/* Assignation d'écoles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Écoles Assignées
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner les écoles *
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {schools.map((school) => (
              <label
                key={school.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formData.assignedSchools.includes(school.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSchoolsChange([
                        ...formData.assignedSchools,
                        school.id,
                      ]);
                    } else {
                      handleSchoolsChange(
                        formData.assignedSchools.filter(
                          (id) => id !== school.id
                        )
                      );
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{school.name}</div>
                  <div className="text-sm text-gray-500">
                    {school.address} • Plan {school.subscriptionPlan}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.assignedSchools && (
            <p className="mt-1 text-sm text-red-600">
              {errors.assignedSchools}
            </p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Le manager pourra gérer toutes les écoles sélectionnées
          </p>
        </div>
      </div>

      {/* Aperçu */}
      {formData.assignedSchools.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            Aperçu de l'assignation :
          </h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              Manager : {formData.firstName} {formData.lastName}
            </p>
            <p>Écoles assignées : {formData.assignedSchools.length}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.assignedSchools.map((schoolId) => {
                const school = schools.find((s) => s.id === schoolId);
                return school ? (
                  <span
                    key={schoolId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {school.name}
                  </span>
                ) : null;
              })}
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
        <Button type="submit" loading={isLoading} disabled={isLoading}>
          {manager ? "Modifier" : "Créer"} le School Manager
        </Button>
      </div>
    </form>
  );
};

export { SchoolManagerForm };
