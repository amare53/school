import React, { useState, useEffect } from 'react';
import { Users, Hash, Calendar, BookOpen } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { classSchema, type ClassFormData } from '../../../shared/validations';
import type { Class, AcademicYear, Section } from '../../../shared/types';

interface ClassFormProps {
  classItem?: Class | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ classItem, onSuccess, onCancel }) => {
  const { currentSchool } = useAuth();
  const { addClass, updateClass, getAcademicYearsBySchool, getSectionsBySchool } = useFakeDataStore();
  const [formData, setFormData] = useState<ClassFormData>({
    academicYearId: '',
    sectionId: '',
    name: '',
    capacity: 30,
  });
  const [errors, setErrors] = useState<Partial<ClassFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const academicYears = getAcademicYearsBySchool(schoolId);
  const sections = getSectionsBySchool(schoolId);

  // Initialiser le formulaire avec les données de la classe si en mode édition
  useEffect(() => {
    if (classItem) {
      setFormData({
        academicYearId: classItem.academicYearId,
        sectionId: classItem.sectionId,
        name: classItem.name,
        capacity: classItem.capacity || 30,
      });
    }
  }, [classItem]);

  const handleChange = (field: keyof ClassFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'capacity' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof ClassFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-générer le nom de la classe
    if (field === 'academicYearId' || field === 'sectionId') {
      const academicYear = academicYears.find(y => y.id === (field === 'academicYearId' ? value : formData.academicYearId));
      const section = sections.find(s => s.id === (field === 'sectionId' ? value : formData.sectionId));
      
      if (academicYear && section) {
        const yearCode = academicYear.name.split('-')[0]; // Ex: "2024" de "2024-2025"
        const className = `${section.code}-${yearCode}`;
        setFormData(prev => ({ ...prev, name: className }));
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      classSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<ClassFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof ClassFormData;
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
      if (classItem) {
        // Mise à jour
        updateClass(classItem.id, formData);
      } else {
        // Création
        addClass({
          ...formData,
          schoolId: currentSchool?.id || '',
        });
      }
      
      const action = classItem ? 'modifiée' : 'créée';
      showNotification(`Classe ${action} avec succès`, 'success');
      
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

  const academicYearOptions = academicYears.map(year => ({
    value: year.id,
    label: `${year.name} ${year.isCurrent ? '(Courante)' : ''}`,
  }));

  const sectionOptions = sections.map(section => ({
    value: section.id,
    label: `${section.name} (${section.code})`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Informations de la Classe
        </h3>

        <Select
          label="Année académique *"
          options={academicYearOptions}
          value={formData.academicYearId}
          onChange={handleSelectChange('academicYearId')}
          error={errors.academicYearId}
          placeholder="Sélectionner une année"
          disabled={isLoading}
        />

        <Select
          label="Section *"
          options={sectionOptions}
          value={formData.sectionId}
          onChange={handleSelectChange('sectionId')}
          error={errors.sectionId}
          placeholder="Sélectionner une section"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de la classe *"
            placeholder="Ex: CP-A-2024"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            leftIcon={<Hash className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Nom généré automatiquement, modifiable"
          />

          <Input
            label="Capacité *"
            type="number"
            min="1"
            max="50"
            value={formData.capacity?.toString() || ''}
            onChange={handleChange('capacity')}
            error={errors.capacity}
            leftIcon={<Users className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Nombre maximum d'élèves"
          />
        </div>
      </div>

      {/* Aperçu */}
      {formData.academicYearId && formData.sectionId && (
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h4 className="font-medium text-indigo-900 mb-2">Aperçu de la classe :</h4>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-indigo-900">{formData.name}</div>
              <div className="text-sm text-indigo-700">
                {sections.find(s => s.id === formData.sectionId)?.name} - 
                {academicYears.find(y => y.id === formData.academicYearId)?.name}
              </div>
              <div className="text-sm text-indigo-600">
                Capacité: {formData.capacity} élèves
              </div>
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
        >
          {classItem ? 'Modifier' : 'Créer'} la Classe
        </Button>
      </div>
    </form>
  );
};

export { ClassForm };