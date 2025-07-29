import React, { useState } from 'react';
import { BarChart3, FileText, Download, Calendar, TrendingUp, Users, DollarSign, PieChart, Printer } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { DashboardReports } from '../components/DashboardReports';
import { FinancialReports } from '../components/FinancialReports';
import { StudentReports } from '../components/StudentReports';
import { AccountingReports } from '../components/AccountingReports';
import { ExportCenter } from '../components/ExportCenter';
import { ClassPaymentReport } from '../components/ClassPaymentReport';

type TabType = 'dashboard' | 'financial' | 'students' | 'accounting' | 'class-payments' | 'exports';

const ReportsPage: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const { 
    getStudentsBySchool,
    getInvoicesBySchool,
    getPaymentsBySchool,
    getExpensesBySchool,
    getAccountingEntriesBySchool
  } = useFakeDataStore();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const students = getStudentsBySchool(schoolId);
  const invoices = getInvoicesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);
  const expenses = getExpensesBySchool(schoolId);
  const accountingEntries = getAccountingEntriesBySchool(schoolId);

  // Calculer les statistiques générales
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netResult = totalRevenue - totalExpenses;
  const pendingInvoices = invoices.filter(i => i.status === 'pending').length;

  // Vérifier les permissions
  if (!user || !['platform_admin', 'school_manager', 'cashier', 'accountant'].includes(user.role)) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour consulter les rapports.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard' as TabType,
      name: 'Tableau de Bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble',
      roles: ['platform_admin', 'school_manager', 'cashier', 'accountant'],
    },
    {
      id: 'financial' as TabType,
      name: 'Rapports Financiers',
      icon: DollarSign,
      description: 'Revenus et dépenses',
      roles: ['platform_admin', 'school_manager', 'cashier', 'accountant'],
    },
    {
      id: 'students' as TabType,
      name: 'Rapports Élèves',
      icon: Users,
      description: 'Statistiques élèves',
      roles: ['platform_admin', 'school_manager', 'cashier'],
    },
    {
      id: 'accounting' as TabType,
      name: 'Rapports Comptables',
      icon: FileText,
      description: 'Bilan et résultats',
      roles: ['platform_admin', 'school_manager', 'accountant'],
    },
    {
      id: 'class-payments' as TabType,
      name: 'Listes de Classes',
      icon: Printer,
      description: 'Impression par classe',
      roles: ['platform_admin', 'school_manager', 'cashier'],
    },
    {
      id: 'exports' as TabType,
      name: 'Exports',
      icon: Download,
      description: 'Téléchargements',
      roles: ['platform_admin', 'school_manager', 'cashier', 'accountant'],
    },
  ];

  // Filtrer les onglets selon les permissions
  const availableTabs = tabs.filter(tab => tab.roles.includes(user.role));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardReports />;
      case 'financial':
        return <FinancialReports />;
      case 'students':
        return <StudentReports />;
      case 'accounting':
        return <AccountingReports />;
      case 'class-payments':
        return <ClassPaymentReport />;
      case 'exports':
        return <ExportCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports et Analytics</h1>
          <p className="text-gray-600">
            Analyses et rapports détaillés de {currentSchool?.name}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            onClick={() => setActiveTab('exports')}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
          <Button 
            leftIcon={<Calendar className="h-4 w-4" />}
          >
            Planifier Rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenus Totaux</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalRevenue.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Dépenses Totales</p>
                <p className="text-2xl font-bold text-red-600">
                  {totalExpenses.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                netResult >= 0 ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <BarChart3 className={`h-6 w-6 ${
                  netResult >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Résultat Net</p>
                <p className={`text-2xl font-bold ${
                  netResult >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {netResult.toLocaleString()} {currentSchool?.currency || 'CDF'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Élèves Actifs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {students.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {availableTabs.map((tab) => {
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
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export { ReportsPage };