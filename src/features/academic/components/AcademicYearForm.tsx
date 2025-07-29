import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth, useUI } from '../../../shared/hooks';
import { useAcademic } from '../../../shared/hooks';
import { academicYearSchema, type AcademicYearFormData } from '../../../shared/validations';
import type { AcademicYear } from '../../../shared/types';

interface AcademicYearFormProps {
  academicYear?: AcademicYear | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const AcademicYearForm: React.FC<AcademicYearFormProps> = ({ 
  academicYear, 
  onSuccess, 
  onCancel 
}) => {
  const { currentSchool } = useAuth();
  const { addAcademicYear, updateAcademicYear } = useAcademic();
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState<Partial<AcademicYearFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données de l'année si en mode édition
  useEffect(() => {
    if (academicYear) {
      setFormData({
        name: academicYear.name,
        startDate: academicYear.startDate,
        endDate: academicYear.endDate,
      });
    } else {
      // Générer automatiquement le nom pour une nouvelle année
      const currentYear = new Date().getFullYear();
      const nextYear = currentYear + 1;
      setFormData(prev => ({
        ...prev,
        name: `${currentYear}-${nextYear}`,
        startDate: `${currentYear}-09-01`,
        endDate: `${nextYear}-07-31`,
      }));
    }
  }, [academicYear]);

  const handleChange = (field: keyof AcademicYearFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      academicYearSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<AcademicYearFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof AcademicYearFormData;
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
      if (academicYear) {
        // Mise à jour
        updateAcademicYear(academicYear.id, formData);
      } else {
        // Création
        addAcademicYear({
          ...formData,
          schoolId: currentSchool?.id || '',
          status: 'active',
          isCurrent: false,
        });
      }
      
      const action = academicYear ? 'modifiée' : 'créée';
      showNotification(`Année académique ${action} avec succès`, 'success');
      
      onSuccess();
      
    } catch (error: any) {
      showNotification(
        error.message || 'Erreur lors de la sauvegarde',
        'error'
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
          <Calendar className="h-5 w-5 mr-2" />
          Informations de l'Année Académique
        </h3>

        <Input
          label="Nom de l'année *"
          placeholder="Ex: 2024-2025"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={isLoading}
          helperText="Format recommandé: YYYY-YYYY"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date de début *"
            type="date"
            value={formData.startDate}
            onChange={handleChange('startDate')}
            error={errors.startDate}
            disabled={isLoading}
          />

          <Input
            label="Date de fin *"
            type="date"
            value={formData.endDate}
            onChange={handleChange('endDate')}
            error={errors.endDate}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Informations importantes */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Points importants :</p>
            <ul className="space-y-1 text-xs">
              <li>• Une seule année peut être définie comme "année courante"</li>
              <li>• Les dates ne peuvent pas se chevaucher avec d'autres années</li>
              <li>• L'archivage se fait automatiquement à la fin de l'année</li>
              <li>• Les inscriptions sont liées aux années académiques</li>
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
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {academicYear ? 'Modifier' : 'Créer'} l'Année
        </Button>
      </div>
    </form>
  );
};

export { AcademicYearForm };