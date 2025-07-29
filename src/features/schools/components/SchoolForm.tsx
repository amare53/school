import React, { useState, useEffect } from 'react';
import { Building, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useUI } from '../../../shared/hooks';
import { useSchools } from '../../../shared/hooks';
import { schoolSchema, type SchoolFormData } from '../../../shared/validations';
import type { School } from '../../../shared/types';

interface SchoolFormProps {
  school?: School | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SchoolForm: React.FC<SchoolFormProps> = ({ school, onSuccess, onCancel }) => {
  const { addSchool, updateSchool } = useSchools();
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    phone: '',
    email: '',
    subscriptionPlan: 'basic',
    currency: 'CDF',
  });
  const [errors, setErrors] = useState<Partial<SchoolFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données de l'école si en mode édition
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        subscriptionPlan: school.subscriptionPlan,
        currency: school.currency,
      });
    }
  }, [school]);

  const handleChange = (field: keyof SchoolFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof SchoolFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      schoolSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<SchoolFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof SchoolFormData;
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
      if (school) {
        // Mise à jour
        updateSchool(school.id, formData);
      } else {
        // Création
        addSchool(formData);
      }
      
      const action = school ? 'modifiée' : 'créée';
      showNotification(`École ${action} avec succès`, 'success');
      
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

  const subscriptionOptions = [
    { value: 'basic', label: 'Basic - Fonctionnalités de base' },
    { value: 'standard', label: 'Standard - Fonctionnalités avancées' },
    { value: 'premium', label: 'Premium - Toutes les fonctionnalités' },
  ];

  const currencyOptions = [
    { value: 'CDF', label: 'Franc Congolais (CDF)' },
    { value: 'USD', label: 'Dollar Américain (USD)' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Building className="h-5 w-5 mr-2" />
          Informations de l'École
        </h3>

        <Input
          label="Nom de l'école *"
          placeholder="Ex: École Primaire Les Palmiers"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          leftIcon={<Building className="h-4 w-4" />}
          disabled={isLoading}
        />

        <Input
          label="Email de contact"
          type="email"
          placeholder="contact@ecole.com"
          value={formData.email}
          onChange={handleChange('email')}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
          disabled={isLoading}
        />

        <Input
          label="Téléphone"
          placeholder="+221 33 123 45 67"
          value={formData.phone}
          onChange={handleChange('phone')}
          error={errors.phone}
          leftIcon={<Phone className="h-4 w-4" />}
          disabled={isLoading}
        />

        <Input
          label="Adresse complète"
          placeholder="123 Avenue de la Paix, Dakar"
          value={formData.address}
          onChange={handleChange('address')}
          error={errors.address}
          leftIcon={<MapPin className="h-4 w-4" />}
          disabled={isLoading}
        />
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Configuration
        </h3>

        <Select
          label="Plan d'abonnement *"
          options={subscriptionOptions}
          value={formData.subscriptionPlan}
          onChange={handleSelectChange('subscriptionPlan')}
          error={errors.subscriptionPlan}
          disabled={isLoading}
        />

        <Select
          label="Devise *"
          options={currencyOptions}
          value={formData.currency}
          onChange={handleSelectChange('currency')}
          error={errors.currency}
          disabled={isLoading || !!school}
          helperText={school ? "La devise ne peut pas être modifiée après création" : "Choisissez la devise pour toutes les transactions"}
        />
      </div>

      {/* Informations sur les plans */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Détails des Plans</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div><strong>Basic:</strong> Gestion des élèves, facturation simple</div>
          <div><strong>Standard:</strong> + Rapports avancés, gestion des dépenses</div>
          <div><strong>Premium:</strong> + Analytics, API, support prioritaire</div>
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
          {school ? 'Modifier' : 'Créer'} l'École
        </Button>
      </div>
    </form>
  );
};

export { SchoolForm };