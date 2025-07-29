import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar, FileText, Upload, Building, AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { expenseSchema, type ExpenseFormData } from '../../../shared/validations';
import { generateExpenseNumber } from '../../../shared/utils';
import type { Expense } from '../../../shared/types';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, onSuccess, onCancel }) => {
  const { currentSchool, user } = useAuth();
  const { addExpense, updateExpense } = useExpenses();
  const { addAccountingEntry } = useAccounting();
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    category: 'other',
    supplier: '',
    receiptUrl: '',
  });
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { showNotification } = useUI();

  // Initialiser le formulaire avec les données de la dépense si en mode édition
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        expenseDate: expense.expenseDate,
        category: expense.category,
        supplier: expense.supplier || '',
        receiptUrl: expense.receiptUrl || '',
      });
    }
  }, [expense]);

  const handleChange = (field: keyof ExpenseFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof ExpenseFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du fichier
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      
      if (file.size > maxSize) {
        showNotification('Le fichier ne peut pas dépasser 5MB', 'error');
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        showNotification('Seuls les fichiers JPG, PNG et PDF sont acceptés', 'error');
        return;
      }
      
      setUploadedFile(file);
      // Simuler l'upload - dans un vrai système, on uploadrait vers un serveur
      const fakeUrl = `https://storage.example.com/receipts/${file.name}`;
      setFormData(prev => ({ ...prev, receiptUrl: fakeUrl }));
      showNotification('Justificatif uploadé avec succès', 'success');
    }
  };

  const validateForm = (): boolean => {
    try {
      expenseSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<ExpenseFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof ExpenseFormData;
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
      if (expense) {
        // Mise à jour
        updateExpense(expense.id, formData);
      } else {
        // Création
        const schoolCode = currentSchool?.name.substring(0, 3).toUpperCase() || 'SCH';
        const expenseNumber = generateExpenseNumber(schoolCode);
        
        const newExpense = addExpense({
          ...formData,
          schoolId: currentSchool?.id || '',
          expenseNumber,
          createdBy: user?.id || '',
        });

        // Créer les écritures comptables automatiques
        await createAccountingEntries(newExpense);
      }
      
      const action = expense ? 'modifiée' : 'enregistrée';
      showNotification(`Dépense ${action} avec succès`, 'success');
      
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

  const createAccountingEntries = async (expense: Expense) => {
    const currency = currentSchool?.currency || 'CDF';
    
    // Déterminer le compte de charge selon la catégorie
    const getChargeAccount = (category: string) => {
      switch (category) {
        case 'salaries': return '6411'; // Charges de personnel
        case 'utilities': return '6061'; // Services extérieurs
        case 'supplies': return '6011'; // Achats
        case 'maintenance': return '6151'; // Entretien et réparations
        default: return '6281'; // Autres charges
      }
    };

    const chargeAccount = getChargeAccount(expense.category);
    
    // Écriture de débit (Charge)
    addAccountingEntry({
      schoolId: currentSchool?.id || '',
      entryNumber: `ECR-${expense.expenseNumber}`,
      entryDate: expense.expenseDate,
      description: `Dépense ${expense.description}`,
      referenceType: 'expense',
      referenceId: expense.id,
      debitAmount: expense.amount,
      creditAmount: 0,
      accountCode: chargeAccount,
      currency,
    });

    // Écriture de crédit (Caisse)
    addAccountingEntry({
      schoolId: currentSchool?.id || '',
      entryNumber: `ECR-${expense.expenseNumber}-2`,
      entryDate: expense.expenseDate,
      description: `Sortie de caisse ${expense.expenseNumber}`,
      referenceType: 'expense',
      referenceId: expense.id,
      debitAmount: 0,
      creditAmount: expense.amount,
      accountCode: '5111', // Caisse
      currency,
    });
  };

  const categoryOptions = [
    { value: 'salaries', label: 'Salaires et charges sociales' },
    { value: 'utilities', label: 'Services (eau, électricité, internet)' },
    { value: 'supplies', label: 'Fournitures et matériel' },
    { value: 'maintenance', label: 'Maintenance et réparations' },
    { value: 'other', label: 'Autres dépenses' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Informations de la Dépense
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Description détaillée de la dépense..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Montant *"
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
            label="Date de dépense *"
            type="date"
            value={formData.expenseDate}
            onChange={handleChange('expenseDate')}
            error={errors.expenseDate}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Catégorie *"
            options={categoryOptions}
            value={formData.category}
            onChange={handleSelectChange('category')}
            error={errors.category}
            disabled={isLoading}
          />

          <Input
            label="Fournisseur"
            placeholder="Nom du fournisseur ou prestataire"
            value={formData.supplier}
            onChange={handleChange('supplier')}
            error={errors.supplier}
            leftIcon={<Building className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Upload de justificatif */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Justificatif
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Glissez-déposez votre justificatif ici, ou
              </p>
              <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  parcourez vos fichiers
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG ou PDF jusqu'à 5MB
            </p>
          </div>
        </div>

        {uploadedFile && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">{uploadedFile.name}</p>
                <p className="text-sm text-green-700">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {formData.receiptUrl && !uploadedFile && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">Justificatif existant</p>
                <p className="text-sm text-blue-700">Un justificatif est déjà associé</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informations sur les écritures comptables */}
      {!expense && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Écritures comptables automatiques :</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Débit Charges</strong> : {formData.amount > 0 ? `${formData.amount.toLocaleString()} ${currentSchool?.currency}` : 'Montant de la dépense'}</li>
                <li>• <strong>Crédit Caisse (5111)</strong> : {formData.amount > 0 ? `${formData.amount.toLocaleString()} ${currentSchool?.currency}` : 'Montant de la dépense'}</li>
                <li>• Le compte de charge dépend de la catégorie sélectionnée</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement justificatif */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Importance du justificatif :</p>
            <ul className="space-y-1 text-xs">
              <li>• Obligatoire pour la conformité comptable</li>
              <li>• Nécessaire pour les contrôles fiscaux</li>
              <li>• Preuve de la réalité de la dépense</li>
              <li>• Vous pouvez l'ajouter plus tard si nécessaire</li>
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
          disabled={isLoading || formData.amount <= 0}
        >
          {expense ? 'Modifier' : 'Enregistrer'} la Dépense
        </Button>
      </div>
    </form>
  );
};

export { ExpenseForm };