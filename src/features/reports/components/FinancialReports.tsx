import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, PieChart, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Select } from '../../../shared/components/ui/Select';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency, formatDate } from '../../../shared/utils';

const FinancialReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { 
    getInvoicesBySchool,
    getPaymentsBySchool,
    getExpensesBySchool
  } = useFakeDataStore();
  
  const [period, setPeriod] = useState('current_month');
  const [reportType, setReportType] = useState('summary');

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const invoices = getInvoicesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);
  const expenses = getExpensesBySchool(schoolId);

  // Filtrer par période
  const getFilteredData = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'last_year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const endDate = period === 'last_month' 
      ? new Date(now.getFullYear(), now.getMonth(), 0)
      : period === 'last_year'
      ? new Date(now.getFullYear() - 1, 11, 31)
      : now;

    return {
      payments: payments.filter(p => {
        const date = new Date(p.paymentDate);
        return date >= startDate && date <= endDate;
      }),
      expenses: expenses.filter(e => {
        const date = new Date(e.expenseDate);
        return date >= startDate && date <= endDate;
      }),
      invoices: invoices.filter(i => {
        const date = new Date(i.issueDate);
        return date >= startDate && date <= endDate;
      })
    };
  };

  const filteredData = getFilteredData();
  const totalRevenue = filteredData.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netResult = totalRevenue - totalExpenses;

  // Répartition des revenus par type de frais
  const revenueByFeeType = filteredData.payments.reduce((acc, payment) => {
    const invoice = invoices.find(i => i.id === payment.invoiceId);
    if (invoice?.items) {
      invoice.items.forEach(item => {
        acc[item.description] = (acc[item.description] || 0) + (payment.amount * (item.totalPrice / invoice.totalAmount));
      });
    }
    return acc;
  }, {} as Record<string, number>);

  // Répartition des dépenses par catégorie
  const expensesByCategory = filteredData.expenses.reduce((acc, expense) => {
    const categoryLabels = {
      salaries: 'Salaires',
      utilities: 'Services',
      supplies: 'Fournitures',
      maintenance: 'Maintenance',
      other: 'Autres',
    };
    const label = categoryLabels[expense.category as keyof typeof categoryLabels] || expense.category;
    acc[label] = (acc[label] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const periodOptions = [
    { value: 'current_month', label: 'Mois en cours' },
    { value: 'last_month', label: 'Mois dernier' },
    { value: 'current_year', label: 'Année en cours' },
    { value: 'last_year', label: 'Année dernière' },
  ];

  const reportTypeOptions = [
    { value: 'summary', label: 'Résumé' },
    { value: 'detailed', label: 'Détaillé' },
    { value: 'comparison', label: 'Comparaison' },
  ];

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <Select
                label="Période"
                options={periodOptions}
                value={period}
                onChange={setPeriod}
              />
            </div>
            <div className="w-48">
              <Select
                label="Type de rapport"
                options={reportTypeOptions}
                value={reportType}
                onChange={setReportType}
              />
            </div>
            <Button leftIcon={<Calendar className="h-4 w-4" />}>
              Période personnalisée
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue, currentSchool?.currency)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+15% vs période précédente</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dépenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses, currentSchool?.currency)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-500">+8% vs période précédente</span>
                </div>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résultat Net</p>
                <p className={`text-2xl font-bold ${
                  netResult >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(netResult, currentSchool?.currency)}
                </p>
                <div className="flex items-center mt-2">
                  {netResult >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    netResult >= 0 ? 'text-blue-500' : 'text-orange-500'
                  }`}>
                    {netResult >= 0 ? 'Bénéfice' : 'Déficit'}
                  </span>
                </div>
              </div>
              <BarChart3 className={`h-8 w-8 ${
                netResult >= 0 ? 'text-blue-600' : 'text-orange-600'
              }`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des revenus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Répartition des Revenus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(revenueByFeeType).map(([type, amount]) => {
                const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-900">{type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(amount, currentSchool?.currency)}
                      </span>
                      <Badge variant="success" size="sm">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {Object.keys(revenueByFeeType).length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucun revenu pour cette période</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Répartition des dépenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Répartition des Dépenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByCategory).map(([category, amount]) => {
                const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                const colors = {
                  'Salaires': 'bg-blue-500',
                  'Services': 'bg-yellow-500',
                  'Fournitures': 'bg-green-500',
                  'Maintenance': 'bg-purple-500',
                  'Autres': 'bg-gray-500',
                };
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[category as keyof typeof colors] || 'bg-gray-500'}`}></div>
                      <span className="text-sm text-gray-900">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(amount, currentSchool?.currency)}
                      </span>
                      <Badge variant="warning" size="sm">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {Object.keys(expensesByCategory).length === 0 && (
                <p className="text-gray-500 text-center py-4">Aucune dépense pour cette période</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails par méthode de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Méthode de Paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['cash', 'bank_transfer', 'check', 'mobile_money'].map(method => {
              const methodPayments = filteredData.payments.filter(p => p.paymentMethod === method);
              const amount = methodPayments.reduce((sum, p) => sum + p.amount, 0);
              const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
              
              const labels = {
                cash: 'Espèces',
                bank_transfer: 'Virement',
                check: 'Chèque',
                mobile_money: 'Mobile Money',
              };

              return (
                <div key={method} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">
                    {labels[method as keyof typeof labels]}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(amount, currentSchool?.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {percentage.toFixed(1)}% ({methodPayments.length} paiements)
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de performance */}
      <Card>
        <CardHeader>
          <CardTitle>Indicateurs de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Marge Bénéficiaire</p>
              <p className={`text-2xl font-bold ${
                netResult >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {totalRevenue > 0 ? ((netResult / totalRevenue) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {netResult >= 0 ? 'Rentable' : 'À améliorer'}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Revenu par Élève</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  filteredData.payments.length > 0 ? totalRevenue / filteredData.payments.length : 0,
                  currentSchool?.currency
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">Moyenne</p>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Croissance</p>
              <p className="text-2xl font-bold text-purple-600">+12%</p>
              <p className="text-xs text-gray-500 mt-1">vs période précédente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { FinancialReports };