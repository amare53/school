import React, { useState, useEffect } from 'react';
import { User, Calendar, Phone, Mail, MapPin, Hash, Users } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { studentSchema, type StudentFormData } from '../../../shared/validations';
import { generateStudentNumber } from '../../../shared/utils';
import type { Student } from '../../../shared/types';

interface StudentFormProps {
  student?: Student | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onSuccess, onCancel }) => {
  const { currentSchool } = useAuth();
  const { addStudent, updateStudent, getStudentsBySchool } = useFakeDataStore();
  const [formData, setFormData] = useState<StudentFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: undefined,
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    address: '',
  });
  const [errors, setErrors] = useState<Partial<StudentFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données de l'élève si en mode édition
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender,
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        parentEmail: student.parentEmail || '',
        address: student.address || '',
      });
    }
  }, [student]);

  const handleChange = (field: keyof StudentFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof StudentFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      studentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<StudentFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof StudentFormData;
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
      if (student) {
        // Mise à jour
        updateStudent(student.id, formData);
      } else {
        // Création - générer un numéro d'élève unique
        const schoolCode = currentSchool?.name.substring(0, 3).toUpperCase() || 'SCH';
        const currentYear = new Date().getFullYear();
        const existingStudents = getStudentsBySchool(currentSchool?.id || '');
        const studentNumber = generateStudentNumber(schoolCode, currentYear);
        
        addStudent({
          ...formData,
          schoolId: currentSchool?.id || '',
          studentNumber,
          status: 'active',
        });
      }
      
      const action = student ? 'modifié' : 'créé';
      showNotification(`Élève ${action} avec succès`, 'success');
      
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

  const genderOptions = [
    { value: 'male', label: 'Masculin' },
    { value: 'female', label: 'Féminin' },
  ];

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
            placeholder="Prénom de l'élève"
            value={formData.firstName}
            onChange={handleChange('firstName')}
            error={errors.firstName}
            disabled={isLoading}
          />

          <Input
            label="Nom *"
            placeholder="Nom de famille"
            value={formData.lastName}
            onChange={handleChange('lastName')}
            error={errors.lastName}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date de naissance"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange('dateOfBirth')}
            error={errors.dateOfBirth}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />

          <Select
            label="Genre"
            options={genderOptions}
            value={formData.gender || ''}
            onChange={handleSelectChange('gender')}
            error={errors.gender}
            placeholder="Sélectionner le genre"
            disabled={isLoading}
          />
        </div>

        <Input
          label="Adresse"
          placeholder="Adresse complète de l'élève"
          value={formData.address}
          onChange={handleChange('address')}
          error={errors.address}
          leftIcon={<MapPin className="h-4 w-4" />}
          disabled={isLoading}
        />
      </div>

      {/* Informations du parent/tuteur */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Informations du Parent/Tuteur
        </h3>

        <Input
          label="Nom du parent/tuteur"
          placeholder="Nom complet du parent ou tuteur"
          value={formData.parentName}
          onChange={handleChange('parentName')}
          error={errors.parentName}
          leftIcon={<User className="h-4 w-4" />}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Téléphone du parent"
            placeholder="+243 XX XXX XXXX"
            value={formData.parentPhone}
            onChange={handleChange('parentPhone')}
            error={errors.parentPhone}
            leftIcon={<Phone className="h-4 w-4" />}
            disabled={isLoading}
          />

          <Input
            label="Email du parent"
            type="email"
            placeholder="parent@email.com"
            value={formData.parentEmail}
            onChange={handleChange('parentEmail')}
            error={errors.parentEmail}
            leftIcon={<Mail className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu du numéro d'élève pour les nouveaux élèves */}
      {!student && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Numéro d'élève :</h4>
          <div className="flex items-center space-x-2">
            <Hash className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-mono">
              {generateStudentNumber(
                currentSchool?.name.substring(0, 3).toUpperCase() || 'SCH',
                new Date().getFullYear()
              )}
            </span>
            <span className="text-blue-600 text-sm">(généré automatiquement)</span>
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
          {student ? 'Modifier' : 'Créer'} l'Élève
        </Button>
      </div>
    </form>
  );
};

export { StudentForm };