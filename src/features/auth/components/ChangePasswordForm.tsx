import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useUI } from '../../../shared/hooks';
import { AuthService } from '../services/authService';
import { changePasswordSchema, type ChangePasswordFormData } from '../../../shared/validations';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<ChangePasswordFormData>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  const handleChange = (field: keyof ChangePasswordFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    try {
      changePasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<ChangePasswordFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof ChangePasswordFormData;
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
      await AuthService.changePassword(formData.currentPassword, formData.newPassword);
      
      showNotification('Mot de passe modifié avec succès', 'success');
      
      // Réinitialiser le formulaire
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      onSuccess?.();
      
    } catch (error: any) {
      showNotification(
        error.message || 'Erreur lors du changement de mot de passe',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mot de passe actuel */}
      <Input
        type={showPasswords.current ? 'text' : 'password'}
        label="Mot de passe actuel"
        placeholder="Votre mot de passe actuel"
        value={formData.currentPassword}
        onChange={handleChange('currentPassword')}
        error={errors.currentPassword}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPasswords.current ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        disabled={isLoading}
      />

      {/* Nouveau mot de passe */}
      <Input
        type={showPasswords.new ? 'text' : 'password'}
        label="Nouveau mot de passe"
        placeholder="Votre nouveau mot de passe"
        value={formData.newPassword}
        onChange={handleChange('newPassword')}
        error={errors.newPassword}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPasswords.new ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        disabled={isLoading}
        helperText="Le mot de passe doit contenir au moins 6 caractères avec une majuscule, une minuscule et un chiffre"
      />

      {/* Confirmation du nouveau mot de passe */}
      <Input
        type={showPasswords.confirm ? 'text' : 'password'}
        label="Confirmer le nouveau mot de passe"
        placeholder="Confirmez votre nouveau mot de passe"
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={errors.confirmPassword}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        disabled={isLoading}
      />

      {/* Conseils de sécurité */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Conseils pour un mot de passe sécurisé :</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Au moins 8 caractères</li>
          <li>• Mélange de majuscules et minuscules</li>
          <li>• Au moins un chiffre</li>
          <li>• Évitez les mots du dictionnaire</li>
          <li>• N'utilisez pas d'informations personnelles</li>
        </ul>
      </div>

      {/* Boutons */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isLoading}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
};

export { ChangePasswordForm };