import React, { useState } from 'react';
import { Users, GraduationCap, UserCheck, UserX, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { Select } from '../../../shared/components/ui/Select';
import { Table, type Column } from '../../../shared/components/ui/Table';
import { useAuth } from '../../../shared/hooks';
import { useFakeDataStore } from '../../../shared/stores/fakeData';
import { formatDate, formatCurrency } from '../../../shared/utils';
import { STUDENT_STATUS_LABELS } from '../../../shared/constants';

const StudentReports: React.FC = () => {
  const { currentSchool } = useAuth();
  const { 
    getStudentsBySchool,
    getSectionsBySchool,
    getClassesBySchool,
    getInvoicesBySchool,
    getPaymentsBySchool
  } = useFakeDataStore();
  
  const [groupBy, setGroupBy] = useState('status');
  const [period, setPeriod] = useState('current_year');

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || '';
  const students = getStudentsBySchool(schoolId);
  const sections = getSectionsBySchool(schoolId);
  const classes = getClassesBySchool(schoolId);
  const invoices = getInvoicesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);

  // Statistiques générales
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const maleStudents = students.filter(s => s.gender === 'male').length;
  const femaleStudents = students.filter(s => s.gender === 'female').length;

  // Répartition par statut
  const studentsByStatus = students.reduce((acc, student) => {
    acc[student.status] = (acc[student.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Répartition par section
  const studentsBySection = students.reduce((acc, student) => {
    // Simulation - dans un vrai système, on utiliserait les inscriptions
    const randomSection = sections[Math.floor(Math.random() * sections.length)];
    if (randomSection) {
      acc[randomSection.name] = (acc[randomSection.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Répartition par âge
  const studentsByAge = students.reduce((acc, student) => {
    if (student.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear();
      const ageGroup = age < 6 ? '3-5 ans' : 
                     age < 12 ? '6-11 ans' : 
                     age < 16 ? '12-15 ans' : '16+ ans';
      acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Nouveaux élèves (cette année)
  const newStudents = students.filter(s => {
    const createdDate = new Date(s.createdAt);
    const currentYear = new Date().getFullYear();
    return createdDate.getFullYear() === currentYear;
  });

  // Top élèves par paiements
  const studentPayments = students.map(student => {
    const studentInvoices = invoices.filter(i => i.studentId === student.id);
    const studentPaymentsList = payments.filter(p => 
      studentInvoices.some(i => i.id === p.invoiceId)
    );
    const totalPaid = studentPaymentsList.reduce((sum, p) => sum + p.amount, 0);
    
    return {
      ...student,
      totalPaid,
      invoicesCount: studentInvoices.length,
      paymentsCount: studentPaymentsList.length,
    };
  }).sort((a, b) => b.totalPaid - a.totalPaid);

  const groupByOptions = [
    { value: 'status', label: 'Par statut' },
    { value: 'section', label: 'Par section' },
    { value: 'age', label: 'Par âge' },
    { value: 'gender', label: 'Par genre' },
  ];

  const periodOptions = [
    { value: 'current_year', label: 'Année en cours' },
    { value: 'last_year', label: 'Année dernière' },
    { value: 'all_time', label: 'Depuis le début' },
  ];

  const getGroupData = () => {
    switch (groupBy) {
      case 'status':
        return studentsByStatus;
      case 'section':
        return studentsBySection;
      case 'age':
        return studentsByAge;
      case 'gender':
        return { 'Masculin': maleStudents, 'Féminin': femaleStudents };
      default:
        return studentsByStatus;
    }
  };

  const groupData = getGroupData();

  const topStudentsColumns: Column<typeof studentPayments[0]>[] = [
    {
      key: 'name',
      title: 'Élève',
      render: (_, student) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">N° {student.studentNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'totalPaid',
      title: 'Total Payé',
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: 'invoicesCount',
      title: 'Factures',
      render: (count) => (
        <Badge variant="info" size="sm">{count}</Badge>
      ),
    },
    {
      key: 'paymentsCount',
      title: 'Paiements',
      render: (count) => (
        <Badge variant="success" size="sm">{count}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-48">
              <Select
                label="Grouper par"
                options={groupByOptions}
                value={groupBy}
                onChange={setGroupBy}
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
        </CardContent>
      </Card>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Élèves</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
                <p className="text-xs text-gray-500 mt-1">Tous statuts</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Élèves Actifs</p>
                <p className="text-2xl font-bold text-green-600">{activeStudents}</p>
                <p className="text-xs text-green-500 mt-1">
                  {totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}% du total
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nouveaux cette Année</p>
                <p className="text-2xl font-bold text-purple-600">{newStudents.length}</p>
                <p className="text-xs text-purple-500 mt-1">
                  {totalStudents > 0 ? Math.round((newStudents.length / totalStudents) * 100) : 0}% du total
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ratio Filles/Garçons</p>
                <p className="text-2xl font-bold text-orange-600">
                  {maleStudents > 0 ? Math.round((femaleStudents / maleStudents) * 100) / 100 : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {femaleStudents}F / {maleStudents}M
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Répartition selon le groupement sélectionné */}
      <Card>
        <CardHeader>
          <CardTitle>
            Répartition {groupByOptions.find(o => o.value === groupBy)?.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupData).map(([key, count]) => {
              const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'active': return 'bg-green-100 text-green-800';
                  case 'graduated': return 'bg-blue-100 text-blue-800';
                  case 'transferred': return 'bg-yellow-100 text-yellow-800';
                  case 'dropped_out': return 'bg-red-100 text-red-800';
                  default: return 'bg-gray-100 text-gray-800';
                }
              };

              return (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {groupBy === 'status' ? STUDENT_STATUS_LABELS[key as keyof typeof STUDENT_STATUS_LABELS] || key : key}
                    </span>
                    {groupBy === 'status' && (
                      <Badge className={getStatusColor(key)} size="sm">
                        {count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top élèves par paiements */}
      <Card>
        <CardHeader>
          <CardTitle>Top Élèves par Paiements</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={studentPayments.slice(0, 10)}
            columns={topStudentsColumns}
            loading={false}
            emptyMessage="Aucune donnée de paiement"
          />
        </CardContent>
      </Card>

      {/* Évolution des inscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des Inscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { month: 'Janvier', new: 15, total: 120 },
              { month: 'Février', new: 8, total: 128 },
              { month: 'Mars', new: 12, total: 140 },
              { month: 'Avril', new: 5, total: 145 },
              { month: 'Mai', new: 3, total: 148 },
            ].map((data) => (
              <div key={data.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">{data.month}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Nouveaux</p>
                    <p className="font-bold text-green-600">+{data.new}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-blue-600">{data.total}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { StudentReports };