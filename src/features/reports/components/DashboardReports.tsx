import React from 'react';
import { TrendingUp, Users, DollarSign, FileText, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency, formatDate } from '../../../shared/utils';

const DashboardReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { students } = useStudents();
  const { payments } = usePayments();
  const { expenses } = useExpenses();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';

  // Calculer les métriques
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingAmount = invoices
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0);
  
  const overdueInvoices = invoices.filter(i => 
    i.status === 'overdue' || 
    (i.status === 'pending' && new Date(i.dueDate || '') < new Date())
  );

  // Données pour les graphiques (simulation)
  const monthlyData = [
    { month: 'Jan', revenue: totalRevenue * 0.15, expenses: totalExpenses * 0.12 },
    { month: 'Fév', revenue: totalRevenue * 0.18, expenses: totalExpenses * 0.15 },
    { month: 'Mar', revenue: totalRevenue * 0.22, expenses: totalExpenses * 0.18 },
    { month: 'Avr', revenue: totalRevenue * 0.20, expenses: totalExpenses * 0.20 },
    { month: 'Mai', revenue: totalRevenue * 0.25, expenses: totalExpenses * 0.35 },
  ];

  const recentPayments = payments.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus ce Mois</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyData[4].revenue, currentSchool?.currency)}
                </p>
                <p className="text-xs text-green-500 mt-1">+12% vs mois dernier</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dépenses ce Mois</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthlyData[4].expenses, currentSchool?.currency)}
                </p>
                <p className="text-xs text-red-500 mt-1">+8% vs mois dernier</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(pendingAmount, currentSchool?.currency)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{invoices.filter(i => i.status === 'pending').length} factures</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taux de Recouvrement</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoices.length > 0 ? Math.round((payments.length / invoices.length) * 100) : 0}%
                </p>
                <p className="text-xs text-blue-500 mt-1">Très bon</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">{data.month}</span>
                  </div>
                  <div className="flex space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      +{formatCurrency(data.revenue, currentSchool?.currency)}
                    </span>
                    <span className="text-red-600 font-medium">
                      -{formatCurrency(data.expenses, currentSchool?.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Factures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Payées</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{invoices.filter(i => i.status === 'paid').length}</span>
                  <Badge variant="success" size="sm">
                    {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">En attente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{invoices.filter(i => i.status === 'pending').length}</span>
                  <Badge variant="warning" size="sm">
                    {invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'pending').length / invoices.length) * 100) : 0}%
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">En retard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{overdueInvoices.length}</span>
                  <Badge variant="error" size="sm">
                    {invoices.length > 0 ? Math.round((overdueInvoices.length / invoices.length) * 100) : 0}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paiements récents et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements récents */}
        <Card>
          <CardHeader>
            <CardTitle>Paiements Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => {
                  const invoice = invoices.find(i => i.id === payment.invoiceId);
                  const student = students.find(s => s.id === invoice?.studentId);
                  
                  return (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payment.paymentNumber} - {formatDate(payment.paymentDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatCurrency(payment.amount, currentSchool?.currency)}
                        </p>
                        <Badge variant="info" size="sm">
                          {payment.paymentMethod === 'cash' ? 'Espèces' :
                           payment.paymentMethod === 'bank_transfer' ? 'Virement' :
                           payment.paymentMethod === 'check' ? 'Chèque' :
                           payment.paymentMethod === 'mobile_money' ? 'Mobile Money' : payment.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun paiement récent</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertes et notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueInvoices.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">
                      {overdueInvoices.length} facture(s) en retard
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    Montant total : {formatCurrency(
                      overdueInvoices.reduce((sum, i) => sum + (i.totalAmount - i.paidAmount), 0),
                      currentSchool?.currency
                    )}
                  </p>
                </div>
              )}

              {expenses.filter(e => !e.receiptUrl).length > 0 && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">
                      {expenses.filter(e => !e.receiptUrl).length} dépense(s) sans justificatif
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    Pensez à ajouter les reçus pour la conformité
                  </p>
                </div>
              )}

              {students.filter(s => s.status === 'active').length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">
                      {students.filter(s => s.status === 'active').length} élèves actifs
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    Taux d'inscription : {Math.round((students.filter(s => s.status === 'active').length / students.length) * 100)}%
                  </p>
                </div>
              )}

              {overdueInvoices.length === 0 && expenses.filter(e => !e.receiptUrl).length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">
                      Tout va bien !
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Aucune alerte en cours
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { DashboardReports };