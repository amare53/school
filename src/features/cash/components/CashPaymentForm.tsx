import React, { useState, useEffect } from 'react';
import { CreditCard, User, DollarSign, Hash, FileText } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useApiPlatformCollection, useAuth, useUI } from '../../../shared/hooks';
import { useCash } from '../stores/cashStore';
import { cashPaymentService } from '../services/cashService';
import { formatCurrency, generatePaymentNumber } from '../../../shared/utils';
import { cashPaymentSchema, type CashPaymentFormData } from '../../../shared/validations/cash';
import { studentsApi, feeTypesApi } from '../../../shared/services/api';

interface CashPaymentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  preselectedStudentId?: string;
}

const CashPaymentForm: React.FC<CashPaymentFormProps> = ({ 
  onSuccess, 
  onCancel,
  preselectedStudentId 
}) => {
  const { currentSchool, user } = useAuth();
  const { activeSession, addPayment } = useCash();
  const { showNotification } = useUI();
  
  const [formData, setFormData] = useState<CashPaymentFormData>({
    studentId: preselectedStudentId || '',
    amount: 0,
    paymentMode: 'cash',
    feeTypeId: '',
    reference: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CashPaymentFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState<any>(null);

  // Charger les élèves et types de frais
  const { data: students } = useApiPlatformCollection(
    (params) => studentsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 1000,
      status: 'active',
      order: { firstName: 'asc' },
    },
    { immediate: true }
  );

  const { data: feeTypes } = useApiPlatformCollection(
    (params) => feeTypesApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 100,
      order: { name: 'asc' },
    },
    { immediate: true }
  );

  // Auto-remplir le montant quand un type de frais est sélectionné
  useEffect(() => {
    if (formData.feeTypeId) {
      const feeType = feeTypes.find(f => f.id === formData.feeTypeId);
      setSelectedFeeType(feeType);
      if (feeType) {
        setFormData(prev => ({ ...prev, amount: feeType.amount }));
      }
    }
  }, [formData.feeTypeId, feeTypes]);

  const handleChange = (field: keyof CashPaymentFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof CashPaymentFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      cashPaymentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<CashPaymentFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof CashPaymentFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!activeSession) {
      showNotification('Aucune session de caisse active', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const payment = await cashPaymentService.recordPayment(formData);
      addPayment(payment);
      
      showNotification(
        'Paiement enregistré avec succès',
        'success',
        'Paiement Enregistré'
      );
      
      // Réinitialiser le formulaire pour un nouveau paiement
      setFormData({
        studentId: '',
        amount: 0,
        paymentMode: 'cash',
        feeTypeId: '',
        reference: '',
        notes: '',
      });
      setSelectedFeeType(null);
      
      onSuccess();
      
    } catch (error: any) {
      showNotification(
        error.message || 'Erreur lors de l\'enregistrement du paiement',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
  }));

  const feeTypeOptions = feeTypes.map(feeType => ({
    value: feeType.id,
    label: `${feeType.name} - ${formatCurrency(feeType.amount, currentSchool?.currency)}`,
  }));

  const paymentModeOptions = [
    { value: 'cash', label: 'Espèces' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'bank_transfer', label: 'Virement Bancaire' },
    { value: 'check', label: 'Chèque' },
  ];

  const selectedStudent = students.find(s => s.id === formData.studentId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Enregistrer un Paiement
        </h3>

        <Select
          label="Élève *"
          options={studentOptions}
          value={formData.studentId}
          onChange={handleSelectChange('studentId')}
          error={errors.studentId}
          placeholder="Rechercher un élève..."
          disabled={isLoading || !!preselectedStudentId}
        />

        <Select
          label="Type de frais *"
          options={feeTypeOptions}
          value={formData.feeTypeId}
          onChange={handleSelectChange('feeTypeId')}
          error={errors.feeTypeId}
          placeholder="Sélectionner un type de frais"
          disabled={isLoading}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Montant *"
            type="number"
            min="0"
            step="100"
            value={formData.amount.toString()}
            onChange={handleChange('amount')}
            error={errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
            helperText={`Devise: ${currentSchool?.currency || 'CDF'}`}
            disabled={isLoading}
          />

          <Select
            label="Mode de paiement *"
            options={paymentModeOptions}
            value={formData.paymentMode}
            onChange={handleSelectChange('paymentMode')}
            error={errors.paymentMode}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Référence"
          placeholder="Numéro de transaction, référence..."
          value={formData.reference}
          onChange={handleChange('reference')}
          error={errors.reference}
          leftIcon={<Hash className="h-4 w-4" />}
          disabled={isLoading}
          helperText="Optionnel selon le mode de paiement"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Notes sur le paiement..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu du paiement */}
      {selectedStudent && selectedFeeType && formData.amount > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Aperçu du paiement :</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>• Élève : {selectedStudent.firstName} {selectedStudent.lastName}</p>
            <p>• Type : {selectedFeeType.name}</p>
            <p>• Montant : {formatCurrency(formData.amount, currentSchool?.currency)}</p>
            <p>• Mode : {paymentModeOptions.find(m => m.value === formData.paymentMode)?.label}</p>
            <p>• Session : {activeSession?.sessionNumber}</p>
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
          disabled={isLoading || !activeSession}
        >
          Enregistrer le Paiement
        </Button>
      </div>
    </form>
  );
};

export { CashPaymentForm };