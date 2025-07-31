import React, { useEffect, useState } from "react";
import {
  Printer,
  Users,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Select } from "../../../shared/components/ui/Select";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { useApiPlatformCollection, useAuth } from "../../../shared/hooks";
import { useFakeDataStore } from "../../../shared/stores/fakeData";
import { formatCurrency, formatDate } from "../../../shared/utils";
import {
  academicYearsApi,
  classesApi,
  enrollmentApi,
  paymentsApi,
  reportsApi,
  studentsApi,
} from "@/shared/services/api";

const ClassPaymentReport: React.FC = () => {
  const { currentSchool } = useAuth();
  const {
    getStudentsBySchool,
    getInvoicesBySchool,
    getPaymentsBySchool,
    getEnrollmentsByStudent,
  } = useFakeDataStore();

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [classStudents, setClassStudents] = useState([]);
  const [monthFilter, setMonthFilter] = useState();

  // Récupérer les données pour l'école courante
  const schoolId = currentSchool?.id || "";
  const { data: academicYears, loading } = useApiPlatformCollection(
    (params) => academicYearsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 12,
      current: true,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );
  const { data: classes } = useApiPlatformCollection(
    (params) => classesApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 2000,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  const students = getStudentsBySchool(schoolId);
  const invoices = getInvoicesBySchool(schoolId);
  const payments = getPaymentsBySchool(schoolId);

  // Simuler les inscriptions par classe
  const getStudentsByClass = (classId: string) => {
    // Dans un vrai système, on utiliserait les inscriptions
    // Ici on simule en prenant un échantillon d'élèves
    const classObj = classes.find((c) => c.id === classId);
    if (!classObj) return [];

    const capacity = classObj.capacity || 30;
    const enrolledCount = Math.floor(capacity * 0.8); // 80% de remplissage

    return students.slice(0, enrolledCount).map((student) => {
      // Simuler les données de paiement pour chaque élève
      const studentInvoices = invoices.filter(
        (i) => i.studentId === student.id
      );
      const studentPayments = payments.filter((p) =>
        studentInvoices.some((inv) => inv.id === p.invoiceId)
      );

      const totalDue = studentInvoices.reduce(
        (sum, inv) => sum + inv.totalAmount,
        0
      );
      const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
      const balance = totalDue - totalPaid;

      const status =
        balance === 0 ? "paid" : balance < totalDue ? "partial" : "unpaid";

      return {
        ...student,
        totalDue,
        totalPaid,
        balance,
        status,
        lastPaymentDate:
          studentPayments.length > 0
            ? studentPayments[studentPayments.length - 1].paymentDate
            : null,
        invoicesCount: studentInvoices.length,
        paymentsCount: studentPayments.length,
      };
    });
  };

  const getStudents = async () => {
    if (selectedClassId && selectedYear && monthFilter) {
      const response = await reportsApi.getClassPaymentReport({
        schoolClass: selectedClassId,
        month: monthFilter,
        academicYear: selectedYear,
      });

      setClassStudents(response);
    }
  };

  useEffect(() => {
    getStudents();
  }, [monthFilter, selectedClassId, selectedClassId]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Trier les élèves
  const sortedStudents = [...classStudents].sort((a, b) => {
    return `${a.student.firstName} ${a.student.lastName}`.localeCompare(
      `${b.student.firstName} ${b.student.lastName}`
    );
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "success",
      partial: "warning",
      unpaid: "error",
    } as const;

    const labels = {
      paid: "À jour",
      partial: "Partiel",
      unpaid: "Impayé",
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
          <title>Liste de Classe - ${selectedClass.level}</title>
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
            <div class="class-info">Liste de Classe - ${
              selectedClass.level
            }</div>
            <div class="class-info">${selectedClass.section?.name}</div>
            <div style="font-size: 14px; margin-top: 10px;">Imprimé le ${formatDate(
              new Date().toISOString(),
              "dd/MM/yyyy à HH:mm"
            )}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>Nom et Prénom</th>
                <th>N° Élève</th>
                <th>Total Payé</th>
                <th>Dernier Paiement</th>
              </tr>
            </thead>
            <tbody>
              ${sortedStudents
                .map(
                  (student, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${student.student.firstName} ${
                    student.student.lastName
                  }</td>
                  <td>${student.student.studentNumber}</td>
                  <td class="amount">${formatCurrency(
                    student.amount,
                    currentSchool?.currency
                  )}</td>
                  <td>${
                    student.createdAt ? formatDate(student.createdAt) : "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>Document généré automatiquement par ${currentSchool?.name}</p>
          </div>
        </body>
      </html>
    `;

    // Ouvrir dans une nouvelle fenêtre et imprimer
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };

  const classOptions = classes.map((classItem) => ({
    value: classItem.id,
    // label: `${classItem.level} - ${classItem.section?.name} (${classItem.academicYear?.name})`,
    label: `${classItem.level} - ${classItem.section?.name}`,
  }));

  const academicYearsOptions = academicYears.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  const monthOptions = [
    { value: "1", label: "Janvier" },
    { value: "2", label: "Février" },
    { value: "3", label: "Mars" },
    { value: "4", label: "Avril" },
    { value: "5", label: "Mai" },
    { value: "6", label: "Juin" },
    { value: "7", label: "Juillet" },
    { value: "8", label: "Août" },
    { value: "9", label: "Septembre" },
    { value: "10", label: "Octobre" },
    { value: "11", label: "Novembre" },
    { value: "12", label: "Décembre" },
  ];

  const columns: Column<(typeof sortedStudents)[0]>[] = [
    {
      key: "student",
      title: "Élève",
      render: (_, payment) => (
        <div>
          <div className="font-medium text-gray-900">
            {payment.student.firstName} {payment.student.lastName}
          </div>
          <div className="text-sm text-gray-500">
            N° {payment.student.studentNumber}
          </div>
        </div>
      ),
    },
    {
      key: "totalDue",
      title: "Total Dû",
      render: (_, payment) => (
        <div className="text-right font-medium text-gray-900">
          {formatCurrency(payment.amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "totalPaid",
      title: "Total Payé",
      render: (_, payment) => (
        <div className="text-right font-medium text-green-600">
          {formatCurrency(payment.amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "balance",
      title: "Solde",
      render: (_, balance) => (
        <div
          className={`text-right font-medium ${
            0 === 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatCurrency(0, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "status",
      title: "Statut",
      render: (status) => getStatusBadge("paid"),
    },
    {
      key: "lastPaymentDate",
      title: "Dernier Paiement",
      render: (_, payment) => (
        <div className="text-sm text-gray-600">
          {payment ? formatDate(payment.createdAt) : "Aucun"}
        </div>
      ),
    },
  ];

  // Calculer les statistiques de la classe
  const classStats = {
    total: classStudents.length,
    paid: classStudents.filter((s) => s.status === "paid").length,
    partial: classStudents.filter((s) => s.status === "partial").length,
    unpaid: classStudents.filter((s) => s.status === "unpaid").length,
    totalDue: classStudents.reduce((sum, s) => sum + s.totalDue, 0),
    totalPaid: classStudents.reduce((sum, s) => sum + s.totalPaid, 0),
    totalBalance: classStudents.reduce((sum, s) => sum + s.balance, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Liste de Classe avec Paiements
          </h2>
          <p className="text-gray-600">
            Imprimez la liste des élèves avec leur statut de paiement
          </p>
        </div>
        {monthFilter && classStudents.length > 0 && (
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Année académique"
              options={academicYearsOptions}
              value={selectedYear}
              onChange={setSelectedYear}
              placeholder="Choisir une Année académique..."
            />
            {selectedYear && (
              <Select
                label="Sélectionner une classe"
                options={classOptions}
                value={selectedClassId}
                onChange={setSelectedClassId}
                placeholder="Choisir une classe..."
              />
            )}

            {selectedClassId && (
              <Select
                label="Sélectionner le mois"
                options={monthOptions}
                value={monthFilter}
                onChange={async (month) => {
                  setMonthFilter(month);
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des élèves */}
      {monthFilter && (
        <Card>
          <CardHeader>
            <CardTitle>Liste des Élèves ({sortedStudents.length})</CardTitle>
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
    </div>
  );
};

export { ClassPaymentReport };
