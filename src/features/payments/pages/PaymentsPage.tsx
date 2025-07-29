import React, { useState } from 'react';
import { Plus, CreditCard, Receipt, DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth, useModal } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { PaymentsList } from '../components/PaymentsList';
import { PaymentForm } from '../components/PaymentForm';
import { AccountingEntriesList } from '../components/AccountingEntriesList';
import { Modal } from '../../../shared/components/ui/Modal';

type TabType = 'payments' | 'accounting';

const PaymentsPage: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const { 
    getPaymentsBySchool, 
    getAccountingEntriesBySchool,
    getInvoicesBySchool 
  } = useFakeDataStore();
  const [activeTab, setActiveTab] = useState<TabType>('payments');
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const payments = getPaymentsBySchool(schoolId);
  const accountingEntries = getAccountingEntriesBySchool(schoolId);
  const invoices = getInvoicesBySchool(schoolId);

  // Calculer les statistiques
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const todayPayments = payments.filter(p => 
    new Date(p.paymentDate).toDateString() === new Date().toDateString()
  ).length;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;

  // Vérifier les permissions
  if (!user || !['platform_admin', 'school_manager', 'cashier'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour gérer les paiements.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'payments' as TabType,
      name: 'Paiements',
      icon: CreditCard,
      description: 'Gérer les paiements',
      count: payments.length,
    },
    {
      id: 'accounting' as TabType,
      name: 'Écritures Comptables',
      icon: Receipt,
      description: 'Voir les écritures',
      count: accountingEntries.length,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'payments':
        return <PaymentsList />;
      case 'accounting':
        return <AccountingEntriesList />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
          <p className="text-gray-600">
            Gérez les paiements et écritures comptables de {currentSchool?.name}
          </p>
        </div>
        <Button 
          onClick={openForm}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouveau Paiement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Encaissé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalPayments.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paiements Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{todayPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Factures En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{pendingInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Factures En Retard</p>
                <p className="text-2xl font-bold text-gray-900">{overdueInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
                <Badge 
                  variant={activeTab === tab.id ? 'info' : 'default'} 
                  size="sm" 
                  className="ml-2"
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Payment Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Nouveau Paiement"
        size="lg"
      >
        <PaymentForm
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { PaymentsPage };