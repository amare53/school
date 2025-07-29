import React, { useState } from 'react';
import { Plus, DollarSign, Receipt, FileText, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth, useModal } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { ExpensesList } from '../components/ExpensesList';
import { ExpenseForm } from '../components/ExpenseForm';
import { ExpenseCategories } from '../components/ExpenseCategories';
import { Modal } from '../../../shared/components/ui/Modal';

type TabType = 'expenses' | 'categories';

const ExpensesPage: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const { 
    getExpensesBySchool,
    getAccountingEntriesBySchool 
  } = useFakeDataStore();
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const expenses = getExpensesBySchool(schoolId);
  const accountingEntries = getAccountingEntriesBySchool(schoolId);

  // Calculer les statistiques
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const todayExpenses = expenses.filter(e => 
    new Date(e.expenseDate).toDateString() === new Date().toDateString()
  ).length;
  const thisMonthExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.expenseDate);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);
  const expensesWithReceipts = expenses.filter(e => e.receiptUrl).length;

  // Vérifier les permissions
  if (!user || !['platform_admin', 'school_manager', 'cashier'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour gérer les dépenses.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'expenses' as TabType,
      name: 'Dépenses',
      icon: DollarSign,
      description: 'Gérer les dépenses',
      count: expenses.length,
    },
    {
      id: 'categories' as TabType,
      name: 'Catégories',
      icon: FileText,
      description: 'Gérer les catégories',
      count: 5, // Nombre de catégories fixes
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpensesList />;
      case 'categories':
        return <ExpenseCategories />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Dépenses</h1>
          <p className="text-gray-600">
            Gérez les dépenses et justificatifs de {currentSchool?.name}
          </p>
        </div>
        <Button 
          onClick={openForm}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvelle Dépense
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalExpenses.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                <p className="text-2xl font-bold text-gray-900">
                  {thisMonthExpenses.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aujourd'hui</p>
                <p className="text-2xl font-bold text-gray-900">{todayExpenses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avec Justificatifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {expensesWithReceipts}/{expenses.length}
                </p>
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

      {/* Expense Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Nouvelle Dépense"
        size="lg"
      >
        <ExpenseForm
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { ExpensesPage };