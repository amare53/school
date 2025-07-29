import React, { useState } from 'react';
import { UserCheck, Calendar, BookOpen, Users, AlertCircle, Info } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate } from '../../../shared/utils';
import type { Student } from '../../../shared/types';

interface EnrollmentFormProps {
  student: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ 
  student, 
  onSuccess, 
  onCancel 
}) => {
  const { currentSchool } = useAuth();
  const { 
    getAcademicYearsBySchool,
    getClassesBySchool,
    addEnrollment 
  } = useFakeDataStore();
  
  const [formData, setFormData] = useState({
    classId: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const academicYears = getAcademicYearsBySchool(schoolId);
  const currentAcademicYear = academicYears.find(y => y.isCurrent);
  const classes = getClassesBySchool(schoolId);

  // Filtrer les classes pour l'année courante uniquement
  const availableClasses = currentAcademicYear 
    ? classes.filter(c => c.academicYearId === currentAcademicYear.id)
    : [];

  const handleChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!currentAcademicYear) {
      newErrors.academicYear = 'Aucune année académique courante définie';
    }
    if (!formData.classId) {
      newErrors.classId = 'La classe est requise';
    }
    if (!formData.enrollmentDate) {
      newErrors.enrollmentDate = 'La date d\'inscription est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Créer l'inscription
      addEnrollment({
        studentId: student.id,
        classId: formData.classId,
        academicYearId: currentAcademicYear?.id || '',
        enrollmentDate: formData.enrollmentDate,
        status: 'active',
        notes: formData.notes,
        schoolId: currentSchool?.id || '',
      });
      
      showNotification('Élève inscrit avec succès', 'success');
      onSuccess();
      
    } catch (error: any) {
      showNotification(
        error.message || 'Erreur lors de l\'inscription',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const classOptions = availableClasses.map(classItem => ({
    value: classItem.id,
    label: `${classItem.name} - ${classItem.section?.name}`,
  }));

  const selectedClass = availableClasses.find(c => c.id === formData.classId);

  // Vérifier si une année courante existe
  if (!currentAcademicYear) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900 mb-2">Aucune année académique courante</h3>
            <p className="text-red-800 text-sm mb-4">
              Vous devez définir une année académique comme "courante" avant de pouvoir inscrire des élèves.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/academic-years')}
            >
              Gérer les années académiques
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de l'élève */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center">
          <UserCheck className="h-5 w-5 mr-2" />
          Élève à inscrire
        </h3>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-blue-900">
              {student.firstName} {student.lastName}
            </p>
            <p className="text-sm text-blue-700">N° {student.studentNumber}</p>
          </div>
        </div>
      </div>

      {/* Information sur l'année courante */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Inscription pour l'année courante :</p>
            <p>{currentAcademicYear.name}</p>
            <p className="text-xs text-blue-600 mt-1">
              Du {formatDate(currentAcademicYear.startDate)} au {formatDate(currentAcademicYear.endDate)}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire d'inscription */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Détails de l'Inscription
        </h3>

        <Select
          label="Classe *"
          options={classOptions}
          value={formData.classId}
          onChange={handleChange('classId')}
          error={errors.classId}
          placeholder="Sélectionner une classe"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'inscription *
            </label>
            <input
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) => handleChange('enrollmentDate')(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {errors.enrollmentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.enrollmentDate}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes')(e.target.value)}
            placeholder="Notes sur l'inscription..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu de l'inscription */}
      {selectedClass && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">Aperçu de l'inscription :</h4>
          <div className="space-y-2 text-sm text-green-800">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Année : {currentAcademicYear.name}</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Section : {selectedClass.section?.name}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              <span>Classe : {selectedClass.name}</span>
            </div>
            <div className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" />
              <span>Date d'inscription : {formatDate(formData.enrollmentDate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement sur la capacité */}
      {selectedClass && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Informations sur la classe :</p>
              <p>Capacité : {selectedClass.capacity} élèves</p>
              <p>Inscrits actuellement : {Math.floor(Math.random() * (selectedClass.capacity || 30))} élèves</p>
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
          Inscrire l'Élève
        </Button>
      </div>
    </form>
  );
};

export { EnrollmentForm };