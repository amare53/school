import React, { useState, useEffect } from 'react';
import { Settings, Target, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency } from '../../../shared/utils';
import type { BillingRule } from '../../../shared/types';

interface BillingRuleFormProps {
  rule?: BillingRule | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const BillingRuleForm: React.FC<BillingRuleFormProps> = ({ rule, onSuccess, onCancel }) => {
  const { currentSchool } = useAuth();
  const { 
    addBillingRule, 
    updateBillingRule, 
    getFeeTypesBySchool, 
    getSectionsBySchool,
    getClassesBySchool 
  } = useFakeDataStore();
  
  const [formData, setFormData] = useState({
    feeTypeId: '',
    targetType: 'school' as 'school' | 'section' | 'class',
    targetId: '',
    amountOverride: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const feeTypes = getFeeTypesBySchool(schoolId);
  const sections = getSectionsBySchool(schoolId);
  const classes = getClassesBySchool(schoolId);

  // Initialiser le formulaire avec les données de la règle si en mode édition
  useEffect(() => {
    if (rule) {
      setFormData({
        feeTypeId: rule.feeTypeId,
        targetType: rule.targetType,
        targetId: rule.targetId || '',
        amountOverride: rule.amountOverride?.toString() || '',
      });
    }
  }, [rule]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Réinitialiser targetId quand targetType change
    if (field === 'targetType') {
      setFormData(prev => ({ ...prev, targetId: '' }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.feeTypeId) {
      newErrors.feeTypeId = 'Le type de frais est requis';
    }
    if (formData.targetType !== 'school' && !formData.targetId) {
      newErrors.targetId = 'La cible est requise';
    }
    if (formData.amountOverride && parseFloat(formData.amountOverride) < 0) {
      newErrors.amountOverride = 'Le montant doit être positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const ruleData = {
        feeTypeId: formData.feeTypeId,
        targetType: formData.targetType,
        targetId: formData.targetType === 'school' ? null : formData.targetId,
        amountOverride: formData.amountOverride ? parseFloat(formData.amountOverride) : null,
        schoolId: currentSchool?.id || '',
      };

      if (rule) {
        // Mise à jour
        updateBillingRule(rule.id, ruleData);
      } else {
        // Création
        addBillingRule(ruleData);
      }
      
      const action = rule ? 'modifiée' : 'créée';
      showNotification(`Règle de facturation ${action} avec succès`, 'success');
      
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

  const feeTypeOptions = feeTypes.map(feeType => ({
    value: feeType.id,
    label: `${feeType.name} (${formatCurrency(feeType.amount)})`,
  }));

  const targetTypeOptions = [
    { value: 'school', label: 'École entière' },
    { value: 'section', label: 'Section spécifique' },
    { value: 'class', label: 'Classe spécifique' },
  ];

  const getTargetOptions = () => {
    switch (formData.targetType) {
      case 'section':
        return sections.map(section => ({
          value: section.id,
          label: section.name,
        }));
      case 'class':
        return classes.map(classItem => ({
          value: classItem.id,
          label: `${classItem.name} - ${classItem.section?.name}`,
        }));
      default:
        return [];
    }
  };

  const selectedFeeType = feeTypes.find(f => f.id === formData.feeTypeId);
  const baseAmount = selectedFeeType?.amount || 0;
  const overrideAmount = formData.amountOverride ? parseFloat(formData.amountOverride) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Configuration de la Règle
        </h3>

        <Select
          label="Type de frais *"
          options={feeTypeOptions}
          value={formData.feeTypeId}
          onChange={handleSelectChange('feeTypeId')}
          error={errors.feeTypeId}
          placeholder="Sélectionner un type de frais"
          disabled={isLoading}
        />

        <Select
          label="Appliquer à *"
          options={targetTypeOptions}
          value={formData.targetType}
          onChange={handleSelectChange('targetType')}
          error={errors.targetType}
          disabled={isLoading}
        />

        {formData.targetType !== 'school' && (
          <Select
            label={`${formData.targetType === 'section' ? 'Section' : 'Classe'} *`}
            options={getTargetOptions()}
            value={formData.targetId}
            onChange={handleSelectChange('targetId')}
            error={errors.targetId}
            placeholder={`Sélectionner une ${formData.targetType === 'section' ? 'section' : 'classe'}`}
            disabled={isLoading}
          />
        )}

        <Input
          label="Montant personnalisé (XOF)"
          type="number"
          min="0"
          step="100"
          value={formData.amountOverride}
          onChange={handleChange('amountOverride')}
          error={errors.amountOverride}
          leftIcon={<DollarSign className="h-4 w-4" />}
          disabled={isLoading}
          helperText="Laisser vide pour utiliser le montant de base"
        />
      </div>

      {/* Aperçu */}
      {selectedFeeType && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Aperçu de la règle :</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              <span>Type de frais : {selectedFeeType.name}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>Montant de base : {formatCurrency(baseAmount)}</span>
            </div>
            {overrideAmount && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                <span>Montant personnalisé : {formatCurrency(overrideAmount)}</span>
                <span className={`ml-2 text-xs ${overrideAmount > baseAmount ? 'text-green-600' : 'text-red-600'}`}>
                  ({overrideAmount > baseAmount ? '+' : ''}{formatCurrency(overrideAmount - baseAmount)})
                </span>
              </div>
            )}
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              <span>
                Cible : {
                  formData.targetType === 'school' ? 'École entière' :
                  formData.targetType === 'section' ? 
                    sections.find(s => s.id === formData.targetId)?.name || 'Section' :
                    classes.find(c => c.id === formData.targetId)?.name || 'Classe'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur la priorité */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Ordre de priorité des règles :</p>
            <ul className="space-y-1 text-xs">
              <li>• <strong>Classe</strong> : Priorité la plus haute (appliquée en premier)</li>
              <li>• <strong>Section</strong> : Priorité moyenne</li>
              <li>• <strong>École</strong> : Priorité la plus basse (appliquée par défaut)</li>
              <li>• Si plusieurs règles s'appliquent, la plus spécifique l'emporte</li>
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
          {rule ? 'Modifier' : 'Créer'} la Règle
        </Button>
      </div>
    </form>
  );
};

export { BillingRuleForm };