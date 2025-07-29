import React, { useState } from 'react';
import { Calculator, Target, Users, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { bulkBillingSchema, type BulkBillingFormData } from '../../../shared/validations';
import { formatCurrency, formatDate } from '../../../shared/utils';

const BulkBillingForm: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const { 
    getFeeTypesBySchool,
    getSectionsBySchool,
    getClassesBySchool,
    getStudentsBySchool,
    bulkCreateInvoices
  } = useFakeDataStore();
  
  const [formData, setFormData] = useState<BulkBillingFormData>({
    target: 'school',
    targetId: '',
    feeTypeIds: [],
    dueDate: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<BulkBillingFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{
    studentsCount: number;
    totalAmount: number;
    feeTypes: any[];
  } | null>(null);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const feeTypes = getFeeTypesBySchool(schoolId);
  const sections = getSectionsBySchool(schoolId);
  const classes = getClassesBySchool(schoolId);
  const students = getStudentsBySchool(schoolId);

  // Initialiser la date d'échéance à 30 jours
  React.useEffect(() => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0],
    }));
  }, []);

  const handleChange = (field: keyof BulkBillingFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Réinitialiser l'aperçu
    setPreviewData(null);
  };

  const handleSelectChange = (field: keyof BulkBillingFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Réinitialiser targetId quand target change
    if (field === 'target') {
      setFormData(prev => ({ ...prev, targetId: '' }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Réinitialiser l'aperçu
    setPreviewData(null);
  };

  const handleFeeTypesChange = (feeTypeIds: string[]) => {
    setFormData(prev => ({ ...prev, feeTypeIds }));
    if (errors.feeTypeIds) {
      setErrors(prev => ({ ...prev, feeTypeIds: undefined }));
    }
    // Réinitialiser l'aperçu
    setPreviewData(null);
  };

  const getTargetOptions = () => {
    switch (formData.target) {
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

  const getAffectedStudents = () => {
    switch (formData.target) {
      case 'school':
        return students;
      case 'section':
        // Simulation - filtrer par section
        return students.filter(() => Math.random() > 0.5);
      case 'class':
        // Simulation - filtrer par classe
        return students.filter(() => Math.random() > 0.7);
      default:
        return [];
    }
  };

  const generatePreview = () => {
    if (!formData.feeTypeIds.length) {
      showNotification('Veuillez sélectionner au moins un type de frais', 'warning');
      return;
    }

    const affectedStudents = getAffectedStudents();
    const selectedFeeTypes = feeTypes.filter(f => formData.feeTypeIds.includes(f.id));
    const totalAmountPerStudent = selectedFeeTypes.reduce((sum, f) => sum + f.amount, 0);
    const totalAmount = affectedStudents.length * totalAmountPerStudent;

    setPreviewData({
      studentsCount: affectedStudents.length,
      totalAmount,
      feeTypes: selectedFeeTypes,
    });
  };

  const validateForm = (): boolean => {
    try {
      bulkBillingSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<BulkBillingFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof BulkBillingFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!previewData) {
      showNotification('Veuillez générer un aperçu avant de continuer', 'warning');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await bulkCreateInvoices({
        ...formData,
        schoolId: currentSchool?.id || '',
        createdBy: user?.id || '',
      });
      
      showNotification(
        `${result.created} factures créées avec succès`,
        'success'
      );
      
      // Réinitialiser le formulaire
      setFormData({
        target: 'school',
        targetId: '',
        feeTypeIds: [],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: '',
      });
      setPreviewData(null);
      
    } catch (error: any) {
      showNotification(
        error.message || 'Erreur lors de la création des factures',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const targetOptions = [
    { value: 'school', label: 'École entière' },
    { value: 'section', label: 'Section spécifique' },
    { value: 'class', label: 'Classe spécifique' },
  ];

  const feeTypeOptions = feeTypes.map(feeType => ({
    value: feeType.id,
    label: `${feeType.name} - ${formatCurrency(feeType.amount)}`,
    checked: formData.feeTypeIds.includes(feeType.id),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Facturation en Masse
        </h2>
        <p className="text-gray-600">Créez des factures pour plusieurs élèves en une seule fois</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuration de la cible */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Cible de la Facturation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Facturer *"
              options={targetOptions}
              value={formData.target}
              onChange={handleSelectChange('target')}
              error={errors.target}
              disabled={isLoading}
            />

            {formData.target !== 'school' && (
              <Select
                label={`${formData.target === 'section' ? 'Section' : 'Classe'} *`}
                options={getTargetOptions()}
                value={formData.targetId}
                onChange={handleSelectChange('targetId')}
                error={errors.targetId}
                placeholder={`Sélectionner une ${formData.target === 'section' ? 'section' : 'classe'}`}
                disabled={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Sélection des types de frais */}
        <Card>
          <CardHeader>
            <CardTitle>Types de Frais à Facturer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {feeTypes.map((feeType) => (
                <label key={feeType.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.feeTypeIds.includes(feeType.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFeeTypesChange([...formData.feeTypeIds, feeType.id]);
                      } else {
                        handleFeeTypesChange(formData.feeTypeIds.filter(id => id !== feeType.id));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{feeType.name}</div>
                    <div className="text-sm text-gray-500">{feeType.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatCurrency(feeType.amount)}</div>
                    <Badge variant={feeType.isMandatory ? 'error' : 'info'} size="sm">
                      {feeType.isMandatory ? 'Obligatoire' : 'Optionnel'}
                    </Badge>
                  </div>
                </label>
              ))}
            </div>
            {errors.feeTypeIds && (
              <p className="mt-2 text-sm text-red-600">{errors.feeTypeIds}</p>
            )}
          </CardContent>
        </Card>

        {/* Paramètres */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de Facturation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Date d'échéance *"
              type="date"
              value={formData.dueDate}
              onChange={handleChange('dueDate')}
              error={errors.dueDate}
              disabled={isLoading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={handleChange('notes')}
                placeholder="Notes qui apparaîtront sur toutes les factures..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aperçu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Aperçu de la Facturation</span>
              <Button
                type="button"
                variant="outline"
                onClick={generatePreview}
                disabled={isLoading || !formData.feeTypeIds.length}
              >
                Générer l'Aperçu
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewData ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-2">Résumé de la facturation :</p>
                      <ul className="space-y-1">
                        <li>• <strong>{previewData.studentsCount} élèves</strong> seront facturés</li>
                        <li>• <strong>{previewData.feeTypes.length} types de frais</strong> appliqués</li>
                        <li>• <strong>{formatCurrency(previewData.totalAmount)}</strong> de revenus générés</li>
                        <li>• Date d'échéance : <strong>{formatDate(formData.dueDate)}</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Types de frais sélectionnés :</h4>
                  <div className="space-y-2">
                    {previewData.feeTypes.map((feeType) => (
                      <div key={feeType.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-900">{feeType.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(feeType.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">
                      Total par élève :
                    </span>
                    <span className="text-lg font-bold text-green-900">
                      {formatCurrency(previewData.totalAmount / previewData.studentsCount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Cliquez sur "Générer l'Aperçu" pour voir le résumé</p>
                <p className="text-sm">Sélectionnez d'abord les types de frais</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avertissement */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Attention :</p>
              <ul className="space-y-1 text-xs">
                <li>• Cette action créera des factures pour tous les élèves de la cible sélectionnée</li>
                <li>• Les factures seront immédiatement visibles par les parents/élèves</li>
                <li>• Assurez-vous que les montants et dates sont corrects</li>
                <li>• Cette action ne peut pas être annulée en masse</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={generatePreview}
            disabled={isLoading || !formData.feeTypeIds.length}
          >
            Générer l'Aperçu
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !previewData}
            leftIcon={<FileText className="h-4 w-4" />}
          >
            Créer les Factures
          </Button>
        </div>
      </form>
    </div>
  );
};

export { BulkBillingForm };