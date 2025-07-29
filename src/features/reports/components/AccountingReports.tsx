import React, { useState } from 'react';
import { Receipt, BarChart3, TrendingUp, Calculator, FileText, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Select } from '../../../shared/components/ui/Select';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency, formatDate } from '../../../shared/utils';

const AccountingReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { 
    getAccountingEntriesBySchool,
    getPaymentsBySchool,
    getExpensesBySchool
  } = useFakeDataStore();
  
  const [reportType, setReportType] = useState('balance_sheet');
  const [period, setPeriod] = useState('current_year');

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const accountingEntries = getAccountingEntriesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);
  const expenses = getExpensesBySchool(schoolId);

  // Calculer les totaux par compte
  const accountTotals = accountingEntries.reduce((acc, entry) => {
    if (!acc[entry.accountCode]) {
      acc[entry.accountCode] = { debit: 0, credit: 0, balance: 0 };
    }
    acc[entry.accountCode].debit += entry.debitAmount;
    acc[entry.accountCode].credit += entry.creditAmount;
    acc[entry.accountCode].balance = acc[entry.accountCode].debit - acc[entry.accountCode].credit;
    return acc;
  }, {} as Record<string, { debit: number; credit: number; balance: number }>);

  // Plan comptable avec noms
  const accountNames: Record<string, string> = {
    '5111': 'Caisse',
    '4111': 'Clients',
    '7011': 'Produits scolaires',
    '6011': 'Achats',
    '6061': 'Services extérieurs',
    '6151': 'Entretien et réparations',
    '6281': 'Autres charges',
    '6411': 'Charges de personnel',
  };

  // Bilan simplifié
  const balanceSheet = {
    actif: {
      caisse: accountTotals['5111']?.balance || 0,
      clients: accountTotals['4111']?.balance || 0,
    },
    passif: {
      // Simulation - dans un vrai système, on aurait plus de comptes
      capital: 100000, // Capital initial simulé
      resultat: (accountTotals['7011']?.balance || 0) - 
                (accountTotals['6011']?.balance || 0) - 
                (accountTotals['6061']?.balance || 0) - 
                (accountTotals['6151']?.balance || 0) - 
                (accountTotals['6281']?.balance || 0) - 
                (accountTotals['6411']?.balance || 0),
    }
  };

  // Compte de résultat
  const incomeStatement = {
    produits: {
      produitsScolarite: Math.abs(accountTotals['7011']?.balance || 0),
    },
    charges: {
      achats: accountTotals['6011']?.balance || 0,
      services: accountTotals['6061']?.balance || 0,
      entretien: accountTotals['6151']?.balance || 0,
      personnel: accountTotals['6411']?.balance || 0,
      autres: accountTotals['6281']?.balance || 0,
    }
  };

  const totalProduits = Object.values(incomeStatement.produits).reduce((sum, val) => sum + val, 0);
  const totalCharges = Object.values(incomeStatement.charges).reduce((sum, val) => sum + val, 0);
  const resultatNet = totalProduits - totalCharges;

  const reportTypeOptions = [
    { value: 'balance_sheet', label: 'Bilan' },
    { value: 'income_statement', label: 'Compte de Résultat' },
    { value: 'trial_balance', label: 'Balance Générale' },
    { value: 'cash_flow', label: 'Flux de Trésorerie' },
  ];

  const periodOptions = [
    { value: 'current_month', label: 'Mois en cours' },
    { value: 'current_year', label: 'Année en cours' },
    { value: 'last_year', label: 'Année dernière' },
  ];

  const trialBalanceColumns: Column<any>[] = [
    {
      key: 'accountCode',
      title: 'Compte',
      render: (code, row) => (
        <div>
          <div className="font-medium text-gray-900">{code}</div>
          <div className="text-sm text-gray-500">{row.name}</div>
        </div>
      ),
    },
    {
      key: 'debit',
      title: 'Débit',
      render: (amount) => (
        <div className="text-right font-medium text-green-600">
          {amount > 0 ? formatCurrency(amount, currentSchool?.currency) : '-'}
        </div>
      ),
    },
    {
      key: 'credit',
      title: 'Crédit',
      render: (amount) => (
        <div className="text-right font-medium text-blue-600">
          {amount > 0 ? formatCurrency(amount, currentSchool?.currency) : '-'}
        </div>
      ),
    },
    {
      key: 'balance',
      title: 'Solde',
      render: (balance) => (
        <div className={`text-right font-medium ${
          balance > 0 ? 'text-green-600' : balance < 0 ? 'text-red-600' : 'text-gray-600'
        }`}>
          {balance !== 0 ? formatCurrency(Math.abs(balance), currentSchool?.currency) : '-'}
        </div>
      ),
    },
  ];

  const trialBalanceData = Object.entries(accountTotals).map(([code, totals]) => ({
    accountCode: code,
    name: accountNames[code] || 'Compte inconnu',
    debit: totals.debit,
    credit: totals.credit,
    balance: totals.balance,
  }));

  const renderBalanceSheet = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Actif */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">ACTIF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Caisse</span>
              <span className="font-bold text-green-600">
                {formatCurrency(balanceSheet.actif.caisse, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Créances Clients</span>
              <span className="font-bold text-green-600">
                {formatCurrency(Math.abs(balanceSheet.actif.clients), currentSchool?.currency)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">TOTAL ACTIF</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(
                    balanceSheet.actif.caisse + Math.abs(balanceSheet.actif.clients),
                    currentSchool?.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passif */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">PASSIF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-900">Capital</span>
              <span className="font-bold text-blue-600">
                {formatCurrency(balanceSheet.passif.capital, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-900">Résultat de l'Exercice</span>
              <span className={`font-bold ${
                balanceSheet.passif.resultat >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(balanceSheet.passif.resultat, currentSchool?.currency)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">TOTAL PASSIF</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(
                    balanceSheet.passif.capital + balanceSheet.passif.resultat,
                    currentSchool?.currency
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIncomeStatement = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Produits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">PRODUITS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-900">Produits de Scolarité</span>
              <span className="font-bold text-green-600">
                {formatCurrency(incomeStatement.produits.produitsScolarite, currentSchool?.currency)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">TOTAL PRODUITS</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(totalProduits, currentSchool?.currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">CHARGES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Achats</span>
              <span className="font-bold text-red-600">
                {formatCurrency(incomeStatement.charges.achats, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Services Extérieurs</span>
              <span className="font-bold text-red-600">
                {formatCurrency(incomeStatement.charges.services, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Charges de Personnel</span>
              <span className="font-bold text-red-600">
                {formatCurrency(incomeStatement.charges.personnel, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Entretien</span>
              <span className="font-bold text-red-600">
                {formatCurrency(incomeStatement.charges.entretien, currentSchool?.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="font-medium text-gray-900">Autres Charges</span>
              <span className="font-bold text-red-600">
                {formatCurrency(incomeStatement.charges.autres, currentSchool?.currency)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">TOTAL CHARGES</span>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(totalCharges, currentSchool?.currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultat */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className={`${resultatNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            RÉSULTAT NET
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-sm text-gray-600 mb-2">
              Produits - Charges = Résultat
            </p>
            <p className={`text-4xl font-bold ${
              resultatNet >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(resultatNet, currentSchool?.currency)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {resultatNet >= 0 ? 'Bénéfice' : 'Perte'} de l'exercice
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrialBalance = () => (
    <Card>
      <CardHeader>
        <CardTitle>Balance Générale</CardTitle>
      </CardHeader>
      <CardContent>
        <Table
          data={trialBalanceData}
          columns={trialBalanceColumns}
          loading={false}
          emptyMessage="Aucune écriture comptable"
        />
        
        {/* Totaux */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Débits</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(
                  Object.values(accountTotals).reduce((sum, acc) => sum + acc.debit, 0),
                  currentSchool?.currency
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Crédits</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(
                  Object.values(accountTotals).reduce((sum, acc) => sum + acc.credit, 0),
                  currentSchool?.currency
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Différence</p>
              <p className={`text-lg font-bold ${
                Object.values(accountTotals).reduce((sum, acc) => sum + acc.debit, 0) === 
                Object.values(accountTotals).reduce((sum, acc) => sum + acc.credit, 0)
                ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(
                  Math.abs(
                    Object.values(accountTotals).reduce((sum, acc) => sum + acc.debit, 0) -
                    Object.values(accountTotals).reduce((sum, acc) => sum + acc.credit, 0)
                  ),
                  currentSchool?.currency
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCashFlow = () => (
    <Card>
      <CardHeader>
        <CardTitle>Tableau de Flux de Trésorerie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flux d'exploitation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Flux de Trésorerie d'Exploitation</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Encaissements clients</span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0), currentSchool?.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Décaissements fournisseurs</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0), currentSchool?.currency)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Flux net d'exploitation</span>
                  <span className={`${
                    payments.reduce((sum, p) => sum + p.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0) >= 0
                    ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      payments.reduce((sum, p) => sum + p.amount, 0) - expenses.reduce((sum, e) => sum + e.amount, 0),
                      currentSchool?.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variation de trésorerie */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Variation de Trésorerie</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Trésorerie de fin de période</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(accountTotals['5111']?.balance || 0, currentSchool?.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (reportType) {
      case 'balance_sheet':
        return renderBalanceSheet();
      case 'income_statement':
        return renderIncomeStatement();
      case 'trial_balance':
        return renderTrialBalance();
      case 'cash_flow':
        return renderCashFlow();
      default:
        return renderBalanceSheet();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-48">
                <Select
                  label="Type de rapport"
                  options={reportTypeOptions}
                  value={reportType}
                  onChange={setReportType}
                />
              </div>
              <div className="w-48">
                <Select
                  label="Période"
                  options={periodOptions}
                  value={period}
                  onChange={setPeriod}
                />
              </div>
            </div>
            <Button leftIcon={<Download className="h-4 w-4" />}>
              Exporter PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs clés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalProduits, currentSchool?.currency)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Charges</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalCharges, currentSchool?.currency)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Résultat Net</p>
                <p className={`text-2xl font-bold ${
                  resultatNet >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {formatCurrency(resultatNet, currentSchool?.currency)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu du rapport */}
      {renderContent()}
    </div>
  );
};

export { AccountingReports };