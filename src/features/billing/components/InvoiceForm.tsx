import React, { useState, useEffect } from 'react';
import { FileText, User, DollarSign, Calendar, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth, useUI } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { invoiceSchema, type InvoiceFormData } from '../../../shared/validations';
import { formatCurrency, generateInvoiceNumber } from '../../../shared/utils';
import type { Invoice, InvoiceItem } from '../../../shared/types';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSuccess, onCancel }) => {
  const { currentSchool, user } = useAuth();
  const { 
    addInvoice, 
    updateInvoice, 
    getStudentsBySchool, 
    getFeeTypesBySchool 
  } = useFakeDataStore();
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    studentId: '',
    dueDate: '',
    notes: '',
    items: [
      {
        feeTypeId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
      }
    ],
  });
  const [errors, setErrors] = useState<Partial<InvoiceFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const { showNotification } = useUI();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const students = getStudentsBySchool(schoolId);
  const feeTypes = getFeeTypesBySchool(schoolId);

  // Initialiser le formulaire avec les données de la facture si en mode édition
  useEffect(() => {
    if (invoice) {
      setFormData({
        studentId: invoice.studentId,
        dueDate: invoice.dueDate || '',
        notes: invoice.notes || '',
        items: invoice.items || [
          {
            feeTypeId: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
          }
        ],
      });
    } else {
      // Pour une nouvelle facture, définir la date d'échéance à 30 jours
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0],
      }));
    }
  }, [invoice]);

  const handleChange = (field: keyof InvoiceFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Effacer l'erreur
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSelectChange = (field: keyof InvoiceFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculer le prix total pour cet item
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? value : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? value : newItems[index].unitPrice;
      newItems[index].totalPrice = quantity * unitPrice;
    }
    
    // Si on change le type de frais, mettre à jour la description et le prix
    if (field === 'feeTypeId') {
      const feeType = feeTypes.find(f => f.id === value);
      if (feeType) {
        newItems[index].description = feeType.name;
        newItems[index].unitPrice = feeType.amount;
        newItems[index].totalPrice = newItems[index].quantity * feeType.amount;
      }
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          feeTypeId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const validateForm = (): boolean => {
    try {
      invoiceSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<InvoiceFormData> = {};
      error.errors?.forEach((err: any) => {
        const field = err.path[0] as keyof InvoiceFormData;
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
      const totalAmount = calculateTotal();
      
      if (invoice) {
        // Mise à jour
        updateInvoice(invoice.id, {
          ...formData,
          totalAmount,
        });
      } else {
        // Création
        const schoolCode = currentSchool?.name.substring(0, 3).toUpperCase() || 'SCH';
        const invoiceNumber = generateInvoiceNumber(schoolCode);
        
        addInvoice({
          ...formData,
          schoolId: currentSchool?.id || '',
          invoiceNumber,
          issueDate: new Date().toISOString().split('T')[0],
          totalAmount,
          paidAmount: 0,
          status: 'pending',
          createdBy: user?.id || '',
        });
      }
      
      const action = invoice ? 'modifiée' : 'créée';
      showNotification(`Facture ${action} avec succès`, 'success');
      
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

  const studentOptions = students.map(student => ({
    value: student.id,
    label: `${student.firstName} ${student.lastName} (${student.studentNumber})`,
  }));

  const feeTypeOptions = feeTypes.map(feeType => ({
    value: feeType.id,
    label: `${feeType.name} - ${formatCurrency(feeType.amount)}`,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Informations de la Facture
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Élève *"
            options={studentOptions}
            value={formData.studentId}
            onChange={handleSelectChange('studentId')}
            error={errors.studentId}
            placeholder="Sélectionner un élève"
            disabled={isLoading}
          />

          <Input
            label="Date d'échéance"
            type="date"
            value={formData.dueDate}
            onChange={handleChange('dueDate')}
            error={errors.dueDate}
            leftIcon={<Calendar className="h-4 w-4" />}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Notes sur la facture..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Éléments de la facture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Éléments de la Facture</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Ajouter un élément
          </Button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Élément {index + 1}</h4>
                {formData.items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Type de frais"
                  options={feeTypeOptions}
                  value={item.feeTypeId}
                  onChange={(value) => handleItemChange(index, 'feeTypeId', value)}
                  placeholder="Sélectionner un type de frais"
                  disabled={isLoading}
                />

                <Input
                  label="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  placeholder="Description de l'élément"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Quantité"
                  type="number"
                  min="1"
                  value={item.quantity.toString()}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  disabled={isLoading}
                />

                <Input
                  label="Prix unitaire (XOF)"
                  type="number"
                  min="0"
                  step="100"
                  value={item.unitPrice.toString()}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  leftIcon={<DollarSign className="h-4 w-4" />}
                  disabled={isLoading}
                />

                <Input
                  label="Prix total (XOF)"
                  value={formatCurrency(item.totalPrice)}
                  disabled
                  leftIcon={<DollarSign className="h-4 w-4" />}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total de la facture :</span>
          <span className="text-2xl font-bold text-blue-600">
            {formatCurrency(calculateTotal())}
          </span>
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
          disabled={isLoading || calculateTotal() === 0}
        >
          {invoice ? 'Modifier' : 'Créer'} la Facture
        </Button>
      </div>
    </form>
  );
};

export { InvoiceForm };