import React from 'react';
import { Tag, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency } from '../../../shared/utils';

const ExpenseCategories: React.FC = () => {
  const { currentSchool } = useAuth();
  const { getExpensesBySchool } = useFakeDataStore();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const expenses = getExpensesBySchool(schoolId);

  // Définir les catégories avec leurs informations
  const categories = [
    {
      id: 'salaries',
      name: 'Salaires et Charges Sociales',
      description: 'Rémunération du personnel enseignant et administratif',
      accountCode: '6411',
      color: 'bg-green-100 text-green-800',
      icon: DollarSign,
    },
    {
      id: 'utilities',
      name: 'Services Publics',
      description: 'Eau, électricité, internet, téléphone',
      accountCode: '6061',
      color: 'bg-blue-100 text-blue-800',
      icon: TrendingUp,
    },
    {
      id: 'supplies',
      name: 'Fournitures et Matériel',
      description: 'Fournitures scolaires, matériel pédagogique',
      accountCode: '6011',
      color: 'bg-yellow-100 text-yellow-800',
      icon: BarChart3,
    },
    {
      id: 'maintenance',
      name: 'Maintenance et Réparations',
      description: 'Entretien des bâtiments et équipements',
      accountCode: '6151',
      color: 'bg-purple-100 text-purple-800',
      icon: Tag,
    },
    {
      id: 'other',
      name: 'Autres Dépenses',
      description: 'Dépenses diverses non classées',
      accountCode: '6281',
      color: 'bg-gray-100 text-gray-800',
      icon: DollarSign,
    },
  ];

  // Calculer les statistiques par catégorie
  const getCategoryStats = (categoryId: string) => {
    const categoryExpenses = expenses.filter(e => e.category === categoryId);
    const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    const count = categoryExpenses.length;
    const withReceipts = categoryExpenses.filter(e => e.receiptUrl).length;
    
    return { total, count, withReceipts };
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Catégories de Dépenses</h2>
        <p className="text-gray-600">Analyse des dépenses par catégorie avec plan comptable</p>
      </div>

      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle>Vue d'Ensemble</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total Dépenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalExpenses, currentSchool?.currency)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Nombre de Dépenses</p>
              <p className="text-2xl font-bold text-gray-900">{expenses.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Avec Justificatifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {expenses.filter(e => e.receiptUrl).length}/{expenses.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catégories détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => {
          const stats = getCategoryStats(category.id);
          const percentage = totalExpenses > 0 ? (stats.total / totalExpenses) * 100 : 0;
          const Icon = category.icon;

          return (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${category.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">Compte {category.accountCode}</p>
                    </div>
                  </div>
                  <Badge variant="default" className={category.color}>
                    {percentage.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{category.description}</p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Montant</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(stats.total, currentSchool?.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Nombre</p>
                    <p className="text-lg font-bold text-gray-900">{stats.count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Justifiés</p>
                    <p className="text-lg font-bold text-gray-900">
                      {stats.withReceipts}/{stats.count}
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${category.color.replace('text-', 'bg-').replace('bg-', 'bg-').replace('-100', '-500')}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Plan comptable */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comptable des Charges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${category.color}`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.accountCode}</p>
                    <p className="text-sm text-gray-600">{category.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(getCategoryStats(category.id).total, currentSchool?.currency)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {getCategoryStats(category.id).count} dépense(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informations comptables */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <BarChart3 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Écritures comptables automatiques :</p>
              <ul className="space-y-1 text-xs">
                <li>• Chaque dépense génère automatiquement les écritures comptables</li>
                <li>• Débit du compte de charge selon la catégorie</li>
                <li>• Crédit du compte Caisse (5111)</li>
                <li>• Respect du principe de la partie double</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ExpenseCategories };