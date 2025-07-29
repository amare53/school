import React, { useState } from 'react';
import { Receipt, Search, Filter, Calendar, DollarSign, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate, formatCurrency } from '../../../shared/utils';
import type { AccountingEntry } from '../../../shared/types';

const AccountingEntriesList: React.FC = () => {
  const { currentSchool } = useAuth();
  const { getAccountingEntriesBySchool } = useFakeDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [referenceTypeFilter, setReferenceTypeFilter] = useState('');
  const [accountCodeFilter, setAccountCodeFilter] = useState('');

  // Récupérer les écritures pour l'école courante
  const schoolId = currentSchool?.id || '';
  const accountingEntries = getAccountingEntriesBySchool(schoolId);

  // Filtrer les écritures
  const filteredEntries = accountingEntries.filter(entry => {
    const matchesSearch = 
      entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accountCode.includes(searchTerm);
    
    const matchesReferenceType = !referenceTypeFilter || entry.referenceType === referenceTypeFilter;
    const matchesAccountCode = !accountCodeFilter || entry.accountCode === accountCodeFilter;
    
    return matchesSearch && matchesReferenceType && matchesAccountCode;
  });

  const getReferenceTypeBadge = (type: string) => {
    const variants = {
      payment: 'success',
      invoice: 'info',
      expense: 'warning',
    } as const;
    
    const labels = {
      payment: 'Paiement',
      invoice: 'Facture',
      expense: 'Dépense',
    };

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getAccountName = (code: string) => {
    const accounts: Record<string, string> = {
      '5111': 'Caisse',
      '4111': 'Clients',
      '7011': 'Produits scolaires',
      '6011': 'Achats',
      '6411': 'Charges de personnel',
    };
    
    return accounts[code] || 'Compte inconnu';
  };

  const columns: Column<AccountingEntry>[] = [
    {
      key: 'entryNumber',
      title: 'N° Écriture',
      sortable: true,
      render: (_, entry) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Receipt className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{entry.entryNumber}</div>
            <div className="text-sm text-gray-500">{formatDate(entry.entryDate)}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: 'Description',
      render: (description) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 truncate">{description}</div>
        </div>
      ),
    },
    {
      key: 'accountCode',
      title: 'Compte',
      render: (accountCode) => (
        <div>
          <div className="font-medium text-gray-900">{accountCode}</div>
          <div className="text-sm text-gray-500">{getAccountName(accountCode)}</div>
        </div>
      ),
    },
    {
      key: 'debitAmount',
      title: 'Débit',
      render: (debitAmount) => (
        <div className="text-right">
          {debitAmount > 0 ? (
            <span className="font-medium text-green-600">
              {formatCurrency(debitAmount, currentSchool?.currency)}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'creditAmount',
      title: 'Crédit',
      render: (creditAmount) => (
        <div className="text-right">
          {creditAmount > 0 ? (
            <span className="font-medium text-blue-600">
              {formatCurrency(creditAmount, currentSchool?.currency)}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'referenceType',
      title: 'Type',
      render: (referenceType) => getReferenceTypeBadge(referenceType),
    },
    {
      key: 'entryDate',
      title: 'Date',
      sortable: true,
      render: (date) => formatDate(date),
    },
  ];

  const referenceTypeOptions = [
    { value: '', label: 'Tous les types' },
    { value: 'payment', label: 'Paiements' },
    { value: 'invoice', label: 'Factures' },
    { value: 'expense', label: 'Dépenses' },
  ];

  const accountCodeOptions = [
    { value: '', label: 'Tous les comptes' },
    { value: '5111', label: '5111 - Caisse' },
    { value: '4111', label: '4111 - Clients' },
    { value: '7011', label: '7011 - Produits scolaires' },
    { value: '6011', label: '6011 - Achats' },
    { value: '6411', label: '6411 - Charges de personnel' },
  ];

  // Calculer les totaux
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debitAmount, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.creditAmount, 0);
  const balance = totalDebit - totalCredit;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Écritures Comptables</h2>
          <p className="text-gray-600">Journal des écritures générées automatiquement</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Débits</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalDebit, currentSchool?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Crédits</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalCredit, currentSchool?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Solde</p>
                <p className={`text-2xl font-bold ${
                  balance === 0 ? 'text-green-600' : 
                  balance > 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(balance), currentSchool?.currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une écriture (numéro, description, compte)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={referenceTypeOptions}
                value={referenceTypeFilter}
                onChange={setReferenceTypeFilter}
                placeholder="Type"
              />
            </div>
            <div className="w-48">
              <Select
                options={accountCodeOptions}
                value={accountCodeFilter}
                onChange={setAccountCodeFilter}
                placeholder="Compte"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounting Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Journal des Écritures ({filteredEntries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredEntries}
            columns={columns}
            loading={false}
            emptyMessage="Aucune écriture comptable trouvée"
          />
          
          {/* Totaux */}
          {filteredEntries.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-right">
                  <span className="font-medium text-gray-600">Total Débits:</span>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(totalDebit, currentSchool?.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-600">Total Crédits:</span>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(totalCredit, currentSchool?.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-600">Différence:</span>
                  <p className={`text-lg font-bold ${
                    balance === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(balance, currentSchool?.currency)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info sur les écritures automatiques */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Écritures automatiques :</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Paiements</strong> : Débit Caisse (5111) / Crédit Clients (4111)</li>
                <li>• <strong>Factures</strong> : Débit Clients (4111) / Crédit Produits (7011)</li>
                <li>• <strong>Dépenses</strong> : Débit Charges / Crédit Caisse (5111)</li>
                <li>• Toutes les écritures respectent le principe de la partie double</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { AccountingEntriesList };