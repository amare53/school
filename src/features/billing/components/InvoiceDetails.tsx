import React from 'react';
import { FileText, User, Calendar, DollarSign, Edit, Send, Download, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate, formatCurrency } from '../../../shared/utils';
import { INVOICE_STATUS_LABELS, STATUS_COLORS } from '../../../shared/constants';
import type { Invoice, InvoiceItem } from '../../../shared/types';

interface InvoiceDetailsProps {
  invoice: Invoice;
  onEdit: () => void;
  onClose: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoice, onEdit, onClose }) => {
  const { currentSchool } = useAuth();
  const { getStudentsBySchool, getPaymentsByInvoice } = useFakeDataStore();

  // Récupérer les données liées
  const schoolId = currentSchool?.id || '';
  const students = getStudentsBySchool(schoolId);
  const student = students.find(s => s.id === invoice.studentId);
  const payments = getPaymentsByInvoice(invoice.id);

  const getStatusBadge = (status: string) => {
    const variant = STATUS_COLORS.INVOICE[status as keyof typeof STATUS_COLORS.INVOICE] || 'bg-gray-100 text-gray-800';
    const label = INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] || status;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${variant}`}>
        {label}
      </span>
    );
  };

  const itemsColumns: Column<InvoiceItem>[] = [
    {
      key: 'description',
      title: 'Description',
      render: (description) => (
        <div className="font-medium text-gray-900">{description}</div>
      ),
    },
    {
      key: 'quantity',
      title: 'Quantité',
      render: (quantity) => (
        <div className="text-center">{quantity}</div>
      ),
    },
    {
      key: 'unitPrice',
      title: 'Prix Unitaire',
      render: (unitPrice) => (
        <div className="text-right">{formatCurrency(unitPrice)}</div>
      ),
    },
    {
      key: 'totalPrice',
      title: 'Total',
      render: (totalPrice) => (
        <div className="text-right font-medium">{formatCurrency(totalPrice)}</div>
      ),
    },
  ];

  const paymentsColumns: Column<any>[] = [
    {
      key: 'paymentNumber',
      title: 'N° Paiement',
      render: (paymentNumber) => (
        <div className="font-medium text-gray-900">{paymentNumber}</div>
      ),
    },
    {
      key: 'paymentDate',
      title: 'Date',
      render: (date) => formatDate(date),
    },
    {
      key: 'amount',
      title: 'Montant',
      render: (amount) => (
        <div className="font-medium text-green-600">{formatCurrency(amount)}</div>
      ),
    },
    {
      key: 'paymentMethod',
      title: 'Méthode',
      render: (method) => (
        <Badge variant="info" size="sm" className="capitalize">
          {method === 'cash' ? 'Espèces' : 
           method === 'bank_transfer' ? 'Virement' :
           method === 'check' ? 'Chèque' :
           method === 'mobile_money' ? 'Mobile Money' : method}
        </Badge>
      ),
    },
  ];

  const remainingAmount = invoice.totalAmount - invoice.paidAmount;
  const isFullyPaid = remainingAmount === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Facture {invoice.invoiceNumber}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(invoice.status)}
              <span className="text-gray-500">•</span>
              <span className="text-gray-600">
                Émise le {formatDate(invoice.issueDate)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" leftIcon={<Send className="h-4 w-4" />}>
            Envoyer
          </Button>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            PDF
          </Button>
          <Button onClick={onEdit} leftIcon={<Edit className="h-4 w-4" />}>
            Modifier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations de la facture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Informations de la Facture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Numéro</label>
                <p className="text-gray-900 font-mono">{invoice.invoiceNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Statut</label>
                <div className="mt-1">{getStatusBadge(invoice.status)}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Date d'émission</label>
                <p className="text-gray-900">{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date d'échéance</label>
                <p className="text-gray-900">
                  {invoice.dueDate ? formatDate(invoice.dueDate) : 'Non définie'}
                </p>
              </div>
            </div>
            
            {invoice.notes && (
              <div>
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-gray-900">{invoice.notes}</p>
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
              </>
            ) : (
              <p className="text-gray-500 italic">Informations de l'élève non disponibles</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Éléments de la facture */}
      <Card>
        <CardHeader>
          <CardTitle>Détail des Frais</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={invoice.items || []}
            columns={itemsColumns}
            loading={false}
            emptyMessage="Aucun élément dans cette facture"
          />
          
          {/* Totaux */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between text-lg">
              <span className="font-medium">Montant Total :</span>
              <span className="font-bold text-gray-900">
                {formatCurrency(invoice.totalAmount)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="font-medium">Montant Payé :</span>
              <span className="font-bold text-green-600">
                {formatCurrency(invoice.paidAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xl border-t pt-2">
              <span className="font-bold">Reste à Payer :</span>
              <span className={`font-bold ${isFullyPaid ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(remainingAmount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des paiements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Historique des Paiements
            </div>
            {!isFullyPaid && (
              <Button size="sm" leftIcon={<CreditCard className="h-4 w-4" />}>
                Enregistrer un Paiement
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <Table
              data={payments}
              columns={paymentsColumns}
              loading={false}
              emptyMessage="Aucun paiement enregistré"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun paiement enregistré</p>
              <p className="text-sm">Cette facture n'a pas encore été payée.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        {!isFullyPaid && (
          <Button leftIcon={<CreditCard className="h-4 w-4" />}>
            Enregistrer un Paiement
          </Button>
        )}
      </div>
    </div>
  );
};

export { InvoiceDetails };