import React, { useState } from 'react';
import { Printer, Users, CheckCircle, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Select } from '../../../shared/components/ui/Select';
import { Badge } from '../../../shared/components/ui/Badge';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatCurrency, formatDate } from '../../../shared/utils';

const ClassPaymentReport: React.FC = () => {
  const { currentSchool } = useAuth();
  const { 
    getClassesBySchool,
    getStudentsBySchool,
    getInvoicesBySchool,
    getPaymentsBySchool,
    getEnrollmentsByStudent
  } = useFakeDataStore();
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [sortBy, setSortBy] = useState('name');

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const classes = getClassesBySchool(schoolId);
  const students = getStudentsBySchool(schoolId);
  const invoices = getInvoicesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);

  // Simuler les inscriptions par classe
  const getStudentsByClass = (classId: string) => {
    // Dans un vrai système, on utiliserait les inscriptions
    // Ici on simule en prenant un échantillon d'élèves
    const classObj = classes.find(c => c.id === classId);
    if (!classObj) return [];
    
    const capacity = classObj.capacity || 30;
    const enrolledCount = Math.floor(capacity * 0.8); // 80% de remplissage
    
    return students.slice(0, enrolledCount).map(student => {
      // Simuler les données de paiement pour chaque élève
      const studentInvoices = invoices.filter(i => i.studentId === student.id);
      const studentPayments = payments.filter(p => 
        studentInvoices.some(inv => inv.id === p.invoiceId)
      );
      
      const totalDue = studentInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalDue - totalPaid;
      
      const status = balance === 0 ? 'paid' : 
                   balance < totalDue ? 'partial' : 'unpaid';
      
      return {
        ...student,
        totalDue,
        totalPaid,
        balance,
        status,
        lastPaymentDate: studentPayments.length > 0 
          ? studentPayments[studentPayments.length - 1].paymentDate 
          : null,
        invoicesCount: studentInvoices.length,
        paymentsCount: studentPayments.length,
      };
    });
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const classStudents = selectedClassId ? getStudentsByClass(selectedClassId) : [];

  // Trier les élèves
  const sortedStudents = [...classStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'status':
        const statusOrder = { paid: 0, partial: 1, unpaid: 2 };
        return statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
      case 'balance':
        return b.balance - a.balance;
      case 'totalPaid':
        return b.totalPaid - a.totalPaid;
      default:
        return 0;
    }
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'success',
      partial: 'warning', 
      unpaid: 'error',
    } as const;
    
    const labels = {
      paid: 'À jour',
      partial: 'Partiel',
      unpaid: 'Impayé',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handlePrint = () => {
    if (!selectedClass || classStudents.length === 0) return;

    // Créer le contenu à imprimer
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste de Classe - ${selectedClass.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .school-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .class-info { font-size: 18px; color: #666; }
            .summary { margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px; }
            .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center; }
            .summary-item { padding: 10px; }
            .summary-number { font-size: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-paid { color: #16a34a; font-weight: bold; }
            .status-partial { color: #ea580c; font-weight: bold; }
            .status-unpaid { color: #dc2626; font-weight: bold; }
            .amount { text-align: right; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="school-name">${currentSchool?.name}</div>
            <div class="class-info">Liste de Classe - ${selectedClass.name}</div>
            <div class="class-info">${selectedClass.section?.name} - ${selectedClass.academicYear?.name}</div>
            <div style="font-size: 14px; margin-top: 10px;">Imprimé le ${formatDate(new Date().toISOString(), 'dd/MM/yyyy à HH:mm')}</div>
          </div>

          <div class="summary">
            <h3>Résumé de la Classe</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-number">${classStudents.length}</div>
                <div>Total Élèves</div>
              </div>
              <div class="summary-item">
                <div class="summary-number" style="color: #16a34a;">${classStudents.filter(s => s.status === 'paid').length}</div>
                <div>À Jour</div>
              </div>
              <div class="summary-item">
                <div class="summary-number" style="color: #ea580c;">${classStudents.filter(s => s.status === 'partial').length}</div>
                <div>Partiels</div>
              </div>
              <div class="summary-item">
                <div class="summary-number" style="color: #dc2626;">${classStudents.filter(s => s.status === 'unpaid').length}</div>
                <div>Impayés</div>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom et Prénom</th>
                <th>N° Élève</th>
                <th>Total Dû</th>
                <th>Total Payé</th>
                <th>Solde</th>
                <th>Statut</th>
                <th>Dernier Paiement</th>
              </tr>
            </thead>
            <tbody>
              ${sortedStudents.map((student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.firstName} ${student.lastName}</td>
                  <td>${student.studentNumber}</td>
                  <td class="amount">${formatCurrency(student.totalDue, currentSchool?.currency)}</td>
                  <td class="amount">${formatCurrency(student.totalPaid, currentSchool?.currency)}</td>
                  <td class="amount">${formatCurrency(student.balance, currentSchool?.currency)}</td>
                  <td class="status-${student.status}">
                    ${student.status === 'paid' ? 'À jour' : 
                      student.status === 'partial' ? 'Partiel' : 'Impayé'}
                  </td>
                  <td>${student.lastPaymentDate ? formatDate(student.lastPaymentDate) : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Document généré automatiquement par ${currentSchool?.name}</p>
            <p>Total des montants dus : ${formatCurrency(classStudents.reduce((sum, s) => sum + s.totalDue, 0), currentSchool?.currency)} | 
               Total payé : ${formatCurrency(classStudents.reduce((sum, s) => sum + s.totalPaid, 0), currentSchool?.currency)} | 
               Solde restant : ${formatCurrency(classStudents.reduce((sum, s) => sum + s.balance, 0), currentSchool?.currency)}</p>
          </div>
        </body>
      </html>
    `;

    // Ouvrir dans une nouvelle fenêtre et imprimer
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const classOptions = classes.map(classItem => ({
    value: classItem.id,
    label: `${classItem.name} - ${classItem.section?.name} (${classItem.academicYear?.name})`,
  }));

  const sortOptions = [
    { value: 'name', label: 'Nom alphabétique' },
    { value: 'status', label: 'Statut de paiement' },
    { value: 'balance', label: 'Solde restant' },
    { value: 'totalPaid', label: 'Montant payé' },
  ];

  const columns: Column<typeof sortedStudents[0]>[] = [
    {
      key: 'student',
      title: 'Élève',
      render: (_, student) => (
        <div>
          <div className="font-medium text-gray-900">
            {student.firstName} {student.lastName}
          </div>
          <div className="text-sm text-gray-500">N° {student.studentNumber}</div>
        </div>
      ),
    },
    {
      key: 'totalDue',
      title: 'Total Dû',
      render: (amount) => (
        <div className="text-right font-medium text-gray-900">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: 'totalPaid',
      title: 'Total Payé',
      render: (amount) => (
        <div className="text-right font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: 'balance',
      title: 'Solde',
      render: (balance) => (
        <div className={`text-right font-medium ${
          balance === 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {formatCurrency(balance, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Statut',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'lastPaymentDate',
      title: 'Dernier Paiement',
      render: (date) => (
        <div className="text-sm text-gray-600">
          {date ? formatDate(date) : 'Aucun'}
        </div>
      ),
    },
  ];

  // Calculer les statistiques de la classe
  const classStats = {
    total: classStudents.length,
    paid: classStudents.filter(s => s.status === 'paid').length,
    partial: classStudents.filter(s => s.status === 'partial').length,
    unpaid: classStudents.filter(s => s.status === 'unpaid').length,
    totalDue: classStudents.reduce((sum, s) => sum + s.totalDue, 0),
    totalPaid: classStudents.reduce((sum, s) => sum + s.totalPaid, 0),
    totalBalance: classStudents.reduce((sum, s) => sum + s.balance, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Liste de Classe avec Paiements</h2>
          <p className="text-gray-600">Imprimez la liste des élèves avec leur statut de paiement</p>
        </div>
        {selectedClass && classStudents.length > 0 && (
          <Button 
            onClick={handlePrint}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Imprimer la Liste
          </Button>
        )}
      </div>

      {/* Sélection de classe */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Sélectionner une classe"
              options={classOptions}
              value={selectedClassId}
              onChange={setSelectedClassId}
              placeholder="Choisir une classe..."
            />
            
            {selectedClassId && (
              <Select
                label="Trier par"
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informations de la classe sélectionnée */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {selectedClass.name} - {selectedClass.section?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{classStats.total}</div>
                <div className="text-sm text-blue-700">Total Élèves</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{classStats.paid}</div>
                <div className="text-sm text-green-700">À Jour</div>
                <div className="text-xs text-green-600">
                  {classStats.total > 0 ? Math.round((classStats.paid / classStats.total) * 100) : 0}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{classStats.partial}</div>
                <div className="text-sm text-yellow-700">Partiels</div>
                <div className="text-xs text-yellow-600">
                  {classStats.total > 0 ? Math.round((classStats.partial / classStats.total) * 100) : 0}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{classStats.unpaid}</div>
                <div className="text-sm text-red-700">Impayés</div>
                <div className="text-xs text-red-600">
                  {classStats.total > 0 ? Math.round((classStats.unpaid / classStats.total) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Résumé financier */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(classStats.totalDue, currentSchool?.currency)}
                </div>
                <div className="text-sm text-gray-600">Total Dû</div>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(classStats.totalPaid, currentSchool?.currency)}
                </div>
                <div className="text-sm text-gray-600">Total Payé</div>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold ${
                  classStats.totalBalance === 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(classStats.totalBalance, currentSchool?.currency)}
                </div>
                <div className="text-sm text-gray-600">Solde Restant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des élèves */}
      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Liste des Élèves ({sortedStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedStudents.length > 0 ? (
              <Table
                data={sortedStudents}
                columns={columns}
                loading={false}
                emptyMessage="Aucun élève dans cette classe"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucun élève inscrit dans cette classe</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions d'impression */}
      {selectedClass && classStudents.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Printer className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Instructions d'impression :</p>
                <ul className="space-y-1 text-xs">
                  <li>• La liste sera formatée automatiquement pour l'impression</li>
                  <li>• Inclut le résumé de la classe et les totaux financiers</li>
                  <li>• Les élèves sont triés selon votre sélection</li>
                  <li>• Utilisez l'aperçu avant impression pour vérifier le format</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { ClassPaymentReport };