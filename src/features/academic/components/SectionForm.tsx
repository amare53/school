import React, { useState, useEffect } from "react";
import { BookOpen, Hash } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { useAuth, useUI } from "../../../shared/hooks";
import type { Section } from "../../../shared/types";

interface SectionFormProps {
  section?: Section | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SectionForm: React.FC<SectionFormProps> = ({
  section,
  onSuccess,
  onCancel,
}) => {
  const { currentSchool } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données de la section si en mode édition
  useEffect(() => {
    if (section) {
      setFormData({
        name: section.name,
        code: section.code,
      });
    }
  }, [section]);

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

    // Auto-générer le code quand la section est sélectionnée
    if (field === "name") {
      const code = value.toUpperCase().substring(0, 3);
      setFormData((prev) => ({ ...prev, code }));
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Le nom de la section est requis";
    }
    if (!formData.code) {
      newErrors.code = "Le code de la section est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (section) {
        // TODO: Appel API pour mise à jour
        // await sectionsApi.update(section.id, formData);
        showNotification("Mise à jour non implémentée", "warning");
        return;
      } else {
        // TODO: Appel API pour création
        // await sectionsApi.create(formData);
        showNotification("Création non implémentée", "warning");
        return;
      }

      const action = section ? "modifiée" : "créée";
      showNotification(`Section ${action} avec succès`, "success");

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Informations de la Section
        </h3>

        <Input
          label="Nom de la section *"
          placeholder="Ex: MAT, PRI, SEC"
          value={formData.name}
          onChange={handleChange("name")}
          error={errors.name}
          leftIcon={<Hash className="h-4 w-4" />}
          disabled={isLoading}
        />

        <Input
          label="Code de la section *"
          placeholder="Ex: MAT, PRI, SEC"
          value={formData.code}
          onChange={handleChange("code")}
          error={errors.code}
          leftIcon={<Hash className="h-4 w-4" />}
          disabled={isLoading}
        />
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
          {section ? "Modifier" : "Créer"} la Section
        </Button>
      </div>
    </form>
  );
};

export { SectionForm };
