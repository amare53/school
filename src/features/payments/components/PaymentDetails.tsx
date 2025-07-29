import React from 'react';
import { CreditCard, User, Calendar, DollarSign, Hash, FileText, Edit, Download, Receipt } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate, formatCurrency } from '../../../shared/utils';
import { PAYMENT_METHOD_LABELS } from '../../../shared/constants';
import type { Payment } from '../../../shared/types';

interface PaymentDetailsProps {
  payment: Payment;
  onEdit: () => void;
  onClose: () => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ payment, onEdit, onClose }) => {
  const { currentSchool } = useAuth();
  const { students } = useStudents();
  const { feeTypes } = useFeeTypes();
  const { getAccountingEntriesFromCache } = useAccounting();

  // Récupérer les données liées
  const schoolId = currentSchool?.id || '';
  const student = students.find(s => s.id === payment.studentId);
  const feeType = feeTypes.find(f => f.id === payment.feeTypeId);
  const accountingEntries = getAccountingEntriesFromCache(`payment_${payment.id}`) || [];

  const getMethodBadge = (method: string) => {
    const variants = {
      cash: 'success',
      bank_transfer: 'info',
      check: 'warning',
      mobile_money: 'default',
    } as const;

    return (
      <Badge variant={variants[method as keyof typeof variants] || 'default'}>
        {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] || method}
      </Badge>
    );
  };

  const handleDownloadReceipt = () => {
    // Simulation du téléchargement
    console.log('Téléchargement du reçu pour:', payment.paymentNumber);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Paiement {payment.paymentNumber}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              {getMethodBadge(payment.paymentMethod)}
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                {formatDate(payment.paymentDate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleDownloadReceipt}
          >
            Reçu PDF
          </Button>
          <Button onClick={onEdit} leftIcon={<Edit className="h-4 w-4" />}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations du paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Détails du Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Numéro</label>
                <p className="text-gray-900 font-mono">{payment.paymentNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Montant</label>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(payment.amount, currentSchool?.currency)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date de paiement</label>
                <p className="text-gray-900">{formatDate(payment.paymentDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Méthode</label>
                <div className="mt-1">{getMethodBadge(payment.paymentMethod)}</div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Type de frais</label>
              <p className="text-gray-900">{feeType?.name || 'Type inconnu'}</p>
              {feeType?.description && (
                <p className="text-sm text-gray-500">{feeType.description}</p>
              )}
            </div>
            
            {payment.reference && (
              <div>
                <label className="text-sm font-medium text-gray-600">Référence</label>
                <p className="text-gray-900 font-mono">{payment.reference}</p>
              </div>
            )}
            
            {payment.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900">{payment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de l'élève */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations de l'Élève
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nom complet</label>
                  <p className="text-gray-900 font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Numéro d'élève</label>
                    <p className="text-gray-900 font-mono">{student.studentNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Statut</label>
                    <Badge variant="success" size="sm" className="capitalize">
                      {student.status}
                    </Badge>
                  </div>
                </div>
                
                {student.parentName && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Parent/Tuteur</label>
                    <p className="text-gray-900">{student.parentName}</p>
                    {student.parentPhone && (
                      <p className="text-sm text-gray-500">{student.parentPhone}</p>
                    )}
                  </div>
                )}

                {student.dateOfBirth && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date de naissance</label>
                    <p className="text-gray-900">{formatDate(student.dateOfBirth)}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500 italic">Informations de l'élève non disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Écritures comptables générées */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Écritures Comptables Générées
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountingEntries.length > 0 ? (
            <div className="space-y-3">
              {accountingEntries.map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{entry.description}</p>
                    <p className="text-sm text-gray-500">
                      Compte {entry.accountCode} - {formatDate(entry.entryDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    {entry.debitAmount > 0 && (
                      <p className="text-green-600 font-medium">
                        Débit: {formatCurrency(entry.debitAmount, currentSchool?.currency)}
                      </p>
                    )}
                    {entry.creditAmount > 0 && (
                      <p className="text-blue-600 font-medium">
                        Crédit: {formatCurrency(entry.creditAmount, currentSchool?.currency)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune écriture comptable trouvée</p>
              <p className="text-sm">Les écritures sont générées automatiquement</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button 
          leftIcon={<Download className="h-4 w-4" />}
          onClick={handleDownloadReceipt}
        >
          Télécharger le Reçu
        </Button>
      </div>
    </div>
  );
};

export { PaymentDetails };