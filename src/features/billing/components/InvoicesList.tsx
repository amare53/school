import React, { useState } from 'react';
import { Plus, FileText, Search, Eye, Edit, Send, Download, Filter, Calendar, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { Modal } from '../../../shared/components/ui/Modal';
import { useAuth, useModal } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate, formatCurrency } from '../../../shared/utils';
import { INVOICE_STATUS, INVOICE_STATUS_LABELS, STATUS_COLORS } from '../../../shared/constants';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceDetails } from './InvoiceDetails';
import type { Invoice } from '../../../shared/types';

const InvoicesList: React.FC = () => {
  const { currentSchool } = useAuth();
  const { getInvoicesBySchool, getStudentsBySchool } = useFakeDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isDetailsOpen, open: openDetails, close: closeDetails } = useModal();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const invoices = getInvoicesBySchool(schoolId);
  const students = getStudentsBySchool(schoolId);

  // Filtrer les factures
  const filteredInvoices = invoices.filter(invoice => {
    const student = students.find(s => s.id === invoice.studentId);
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    openForm();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openForm();
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    openDetails();
  };

  const getStatusBadge = (status: string) => {
    const variant = STATUS_COLORS.INVOICE[status as keyof typeof STATUS_COLORS.INVOICE] || 'bg-gray-100 text-gray-800';
    const label = INVOICE_STATUS_LABELS[status as keyof typeof INVOICE_STATUS_LABELS] || status;
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${variant}`}>
        {label}
      </span>
    );
  };

  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      title: 'Facture',
      sortable: true,
      render: (_, invoice) => {
        const student = students.find(s => s.id === invoice.studentId);
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
              <div className="text-sm text-gray-500">
                {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'student',
      title: 'Élève',
      render: (_, invoice) => {
        const student = students.find(s => s.id === invoice.studentId);
        return student ? (
          <div>
            <div className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">N° {student.studentNumber}</div>
          </div>
        ) : (
          <span className="text-gray-400">Élève inconnu</span>
        );
      },
    },
    {
      key: 'issueDate',
      title: 'Date d\'émission',
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: 'dueDate',
      title: 'Date d\'échéance',
      sortable: true,
      render: (date) => date ? formatDate(date) : '-',
    },
    {
      key: 'totalAmount',
      title: 'Montant Total',
      sortable: true,
      render: (amount) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      key: 'paidAmount',
      title: 'Montant Payé',
      render: (paidAmount, invoice) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatCurrency(paidAmount)}
          </div>
          {paidAmount < invoice.totalAmount && (
            <div className="text-xs text-red-600">
              Reste: {formatCurrency(invoice.totalAmount - paidAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, invoice) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewInvoice(invoice)}
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditInvoice(invoice)}
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Envoyer par email"
          >
            <Send className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            title="Télécharger PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Factures</h2>
          <p className="text-gray-600">Gérez toutes les factures de votre école</p>
        </div>
        <Button onClick={handleCreateInvoice} leftIcon={<Plus className="h-4 w-4" />}>
          Nouvelle Facture
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une facture (numéro, élève)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Statut"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des Factures ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredInvoices}
            columns={columns}
            loading={false}
            emptyMessage="Aucune facture trouvée"
            onRowClick={handleViewInvoice}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedInvoice ? 'Modifier la Facture' : 'Nouvelle Facture'}
        size="lg"
      >
        <InvoiceForm
          invoice={selectedInvoice}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        title="Détails de la Facture"
        size="lg"
      >
        {selectedInvoice && (
          <InvoiceDetails
            invoice={selectedInvoice}
            onEdit={() => {
              closeDetails();
              handleEditInvoice(selectedInvoice);
            }}
            onClose={closeDetails}
          />
        )}
      </Modal>
    </div>
  );
};

export { InvoicesList };