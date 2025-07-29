import React, { useState, useEffect } from 'react';
import { Layers, Hash, ArrowUp } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { levelSchema, type LevelFormData } from '../../../shared/validations';
import type { Level } from '../../../shared/types';

interface LevelFormProps {
  level?: Level | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const LevelForm: React.FC<LevelFormProps> = ({ level, onSuccess, onCancel }) => {
  const { currentSchool } = useAuth();
  const { addLevel, updateLevel, getLevelsBySchool } = useFakeDataStore();
  const [formData, setFormData] = useState<LevelFormData>({
    name: '',
    code: '',
    orderIndex: 1,
  });
  const [errors, setErrors] = useState<Partial<LevelFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données du niveau si en mode édition
  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name,
        code: level.code,
        orderIndex: level.orderIndex,
      });
    } else {
      // Pour un nouveau niveau, définir l'ordre suivant disponible
      const schoolId = currentSchool?.id || '';
      const existingLevels = getLevelsBySchool(schoolId);
      const nextOrder = existingLevels.length > 0 
        ? Math.max(...existingLevels.map(l => l.orderIndex)) + 1 
        : 1;
        
      setFormData(prev => ({
        ...prev,
        orderIndex: nextOrder,
      }));
    }
  }, [level, currentSchool, getLevelsBySchool]);

  const handleChange = (field: keyof LevelFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'orderIndex' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      levelSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<LevelFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof LevelFormData;
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
      if (level) {
        // Mise à jour
        updateLevel(level.id, formData);
      } else {
        // Création
        addLevel({
          ...formData,
          schoolId: currentSchool?.id || '',
        });
      }
      
      const action = level ? 'modifié' : 'créé';
      showNotification(`Niveau ${action} avec succès`, 'success');
      
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

  // Suggestions de niveaux courants
  const levelSuggestions = [
    { name: 'Cours d\'Initiation (CI)', code: 'CI' },
    { name: 'Cours Préparatoire (CP)', code: 'CP' },
    { name: 'Cours Élémentaire 1ère année (CE1)', code: 'CE1' },
    { name: 'Cours Élémentaire 2ème année (CE2)', code: 'CE2' },
    { name: 'Cours Moyen 1ère année (CM1)', code: 'CM1' },
    { name: 'Cours Moyen 2ème année (CM2)', code: 'CM2' },
    { name: '6ème', code: '6EME' },
    { name: '5ème', code: '5EME' },
    { name: '4ème', code: '4EME' },
    { name: '3ème', code: '3EME' },
  ];

  const handleSuggestionClick = (suggestion: { name: string; code: string }) => {
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      code: suggestion.code,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Layers className="h-5 w-5 mr-2" />
          Informations du Niveau
        </h3>

        <Input
          label="Nom du niveau *"
          placeholder="Ex: Cours Préparatoire (CP)"
          value={formData.name}
          onChange={handleChange('name')}
          error={errors.name}
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Code du niveau *"
            placeholder="Ex: CP"
            value={formData.code}
            onChange={handleChange('code')}
            error={errors.code}
            leftIcon={<Hash className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Code court pour identifier le niveau"
          />

          <Input
            label="Ordre *"
            type="number"
            min="1"
            value={formData.orderIndex.toString()}
            onChange={handleChange('orderIndex')}
            error={errors.orderIndex}
            leftIcon={<ArrowUp className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Position dans la hiérarchie"
          />
        </div>
      </div>

      {/* Suggestions */}
      {!level && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">Suggestions de niveaux :</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {levelSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                disabled={isLoading}
              >
                <div className="font-medium text-gray-900">{suggestion.code}</div>
                <div className="text-gray-600 truncate">{suggestion.name}</div>
              </button>
            ))}
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
          {level ? 'Modifier' : 'Créer'} le Niveau
        </Button>
      </div>
    </form>
  );
};

export { LevelForm };