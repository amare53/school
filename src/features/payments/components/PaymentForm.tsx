import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, Hash, FileText, User, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency, generatePaymentNumber } from '../../../shared/utils';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../../shared/constants';
import type { Payment } from '../../../shared/types';

interface PaymentFormProps {
  payment?: Payment | null;
  preselectedStudentId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  payment, 
  preselectedStudentId,
  onSuccess, 
  onCancel 
}) => {
  const { currentSchool, user } = useAuth();
  const { 
    addPayment, 
    updatePayment, 
    getStudentsBySchool,
    getFeeTypesBySchool,
    addAccountingEntry
  } = useFakeDataStore();
  
  const [formData, setFormData] = useState({
    studentId: preselectedStudentId || '',
    feeTypeId: '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as const,
    reference: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';

  // Initialiser le formulaire avec les données du paiement si en mode édition
  useEffect(() => {
    if (payment) {
      setFormData({
        studentId: payment.studentId,
        feeTypeId: payment.feeTypeId || '',
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference || '',
        notes: payment.notes || '',
      });
    }
  }, [payment]);

  // Auto-remplir le montant quand un type de frais est sélectionné
  useEffect(() => {
    if (formData.feeTypeId && !payment) {
      const feeType = feeTypes.find(f => f.id === formData.feeTypeId);
      if (feeType) {
        setFormData(prev => ({ ...prev, amount: feeType.amount }));
      }
    }
  }, [formData.feeTypeId, feeTypes, payment]);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.studentId) {
      newErrors.studentId = 'L\'élève est requis';
    }
    if (!formData.feeTypeId) {
      newErrors.feeTypeId = 'Le type de frais est requis';
    }
    if (formData.amount <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    }
    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La date de paiement est requise';
    }
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'La méthode de paiement est requise';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      if (payment) {
        // Mise à jour
        updatePayment(payment.id, formData);
      } else {
        // Création
        const schoolCode = currentSchool?.name.substring(0, 3).toUpperCase() || 'SCH';
        const paymentNumber = generatePaymentNumber(schoolCode);
        
        const newPayment = addPayment({
          ...formData,
          schoolId: currentSchool?.id || '',
          paymentNumber,
          createdBy: user?.id || '',
        });

        // Créer les écritures comptables automatiques
        await createAccountingEntries(newPayment);
      }
      
      const action = payment ? 'modifié' : 'enregistré';
      showNotification(`Paiement ${action} avec succès`, 'success');
      
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

  const createAccountingEntries = async (payment: Payment) => {
    const currency = currentSchool?.currency || 'CDF';
    
    // Écriture de débit (Caisse)
    addAccountingEntry({
      schoolId: currentSchool?.id || '',
      entryNumber: `ECR-${payment.paymentNumber}`,
      entryDate: payment.paymentDate,
      description: `Encaissement ${payment.paymentNumber}`,
      referenceType: 'payment',
      referenceId: payment.id,
      debitAmount: payment.amount,
      creditAmount: 0,
      accountCode: '5111', // Caisse
      currency,
    });

    // Écriture de crédit (Produits)
    addAccountingEntry({
      schoolId: currentSchool?.id || '',
      entryNumber: `ECR-${payment.paymentNumber}-2`,
      entryDate: payment.paymentDate,
      description: `Produit scolaire ${payment.paymentNumber}`,
      referenceType: 'payment',
      referenceId: payment.id,
      debitAmount: 0,
      creditAmount: payment.amount,
      accountCode: '7011', // Produits scolaires
      currency,
    });
  };

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
  }));

  const feeTypeOptions = feeTypes.map(feeType => ({
    value: feeType.id,
    label: `${feeType.name} - ${formatCurrency(feeType.amount, currentSchool?.currency)}`,
  }));

  const paymentMethodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  const selectedStudent = students.find(s => s.id === formData.studentId);
  const selectedFeeType = feeTypes.find(f => f.id === formData.feeTypeId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Informations du Paiement
        </h3>

        <Select
          label="Élève *"
          options={studentOptions}
          value={formData.studentId}
          onChange={handleSelectChange('studentId')}
          error={errors.studentId}
          placeholder="Sélectionner un élève"
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
            label="Montant du paiement *"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount.toString()}
            onChange={handleChange('amount')}
            error={errors.amount}
            leftIcon={<DollarSign className="h-4 w-4" />}
            disabled={isLoading}
            helperText={`Devise: ${currentSchool?.currency || 'CDF'}`}
          />

          <Input
            label="Date de paiement *"
            type="date"
            value={formData.paymentDate}
            onChange={handleChange('paymentDate')}
            error={errors.paymentDate}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Méthode de paiement *"
            options={paymentMethodOptions}
            value={formData.paymentMethod}
            onChange={handleSelectChange('paymentMethod')}
            error={errors.paymentMethod}
            disabled={isLoading}
          />

          <Input
            label="Référence"
            placeholder="Numéro de chèque, référence virement..."
            value={formData.reference}
            onChange={handleChange('reference')}
            error={errors.reference}
            leftIcon={<Hash className="h-4 w-4" />}
            disabled={isLoading}
            helperText="Optionnel selon la méthode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Notes sur le paiement..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Aperçu du paiement */}
      {selectedStudent && selectedFeeType && formData.amount > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Aperçu du paiement :</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              <span>Élève : {selectedStudent.firstName} {selectedStudent.lastName}</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>Frais : {selectedFeeType.name}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>Montant : {formatCurrency(formData.amount, currentSchool?.currency)}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Date : {new Date(formData.paymentDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur les écritures comptables */}
      {!payment && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Écritures comptables automatiques :</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Débit Caisse (5111)</strong> : {formatCurrency(formData.amount, currentSchool?.currency)}</li>
                <li>• <strong>Crédit Produits Scolaires (7011)</strong> : {formatCurrency(formData.amount, currentSchool?.currency)}</li>
                <li>• Les écritures seront générées automatiquement</li>
              </ul>
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
          disabled={isLoading || formData.amount <= 0 || !formData.studentId || !formData.feeTypeId}
        >
          {payment ? 'Modifier' : 'Enregistrer'} le Paiement
        </Button>
      </div>
    </form>
  );
};

export { PaymentForm };