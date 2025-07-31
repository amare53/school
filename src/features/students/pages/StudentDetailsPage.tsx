import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Hash,
  Users,
  GraduationCap,
  FileText,
  CreditCard,
  Edit,
  UserCheck,
  ArrowLeft,
  BookOpen,
  School,
  Plus,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { Modal } from "../../../shared/components/ui/Modal";
import {
  useApiPlatformCollection,
  useAuth,
  useModal,
} from "../../../shared/hooks";
import { formatDate, formatCurrency } from "../../../shared/utils";
import {
  STUDENT_STATUS_LABELS,
  STATUS_COLORS,
} from "../../../shared/constants";
import { studentsApi } from "@/shared/services/api";
import { PaymentForm } from "../../payments/components/PaymentForm";

const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSchool } = useAuth();
  const {
    isOpen: isPaymentOpen,
    open: openPayment,
    close: closePayment,
  } = useModal();

  const { data: student, loading } = useApiPlatformCollection(
    (id) => studentsApi.getItem(id),
    id,
    {
      cacheKey: "sections_list",
      immediate: true,
      one: true,
    }
  );

  // TODO: Remplacer par des appels API réels
  const enrollments: any[] = [];
  const classes: any[] = [];
  const academicYears: any[] = [];
  const feeTypes: any[] = [];

  if (!student) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Élève non trouvé
        </h2>
        <p className="text-gray-600 mb-4">
          L'élève demandé n'existe pas ou vous n'avez pas les permissions pour
          le voir.
        </p>
        <Button onClick={() => navigate("/students")}>Retour à la liste</Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variant =
      STATUS_COLORS.STUDENT[status as keyof typeof STATUS_COLORS.STUDENT] ||
      "bg-gray-100 text-gray-800";
    const label =
      STUDENT_STATUS_LABELS[status as keyof typeof STUDENT_STATUS_LABELS] ||
      status;

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-medium ${variant}`}
      >
        {label}
      </span>
    );
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Calculer les frais en souffrance pour chaque type de frais mensuel
  const getOutstandingFees = () => {
    const currentDate = new Date();
    const outstandingFees: Array<{
      feeType: any;
      monthsOwed: number;
      totalAmount: number;
      lastPaidMonth: string | null;
      nextDueMonth: string;
    }> = [];

    // Pour chaque type de frais mensuel
    const monthlyFeeTypes = feeTypes.filter(
      (ft) => ft.billingFrequency === "monthly"
    );

    monthlyFeeTypes.forEach((feeType) => {
      // Trouver le dernier paiement pour ce type de frais
      const feePayments = student?.payments
        ?.filter((p) => p.feeTypeId === feeType.id)
        .sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
        );

      const lastPayment = feePayments[0];
      let lastPaidDate: Date;
      let lastPaidMonth: string | null = null;

      if (lastPayment) {
        lastPaidDate = new Date(lastPayment.paymentDate);
        lastPaidMonth = lastPaidDate.toLocaleDateString("fr-FR", {
          month: "long",
          year: "numeric",
        });
      } else {
        // Si aucun paiement, commencer depuis l'inscription de l'élève
        lastPaidDate = new Date(student.createdAt);
        lastPaidDate.setMonth(lastPaidDate.getMonth() - 1); // Commencer le mois précédent
      }

      // Calculer les mois en souffrance
      const nextDueDate = new Date(lastPaidDate);
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);

      let monthsOwed = 0;
      const tempDate = new Date(nextDueDate);

      while (tempDate <= currentDate) {
        monthsOwed++;
        tempDate.setMonth(tempDate.getMonth() + 1);
      }

      if (monthsOwed > 0) {
        outstandingFees.push({
          feeType,
          monthsOwed,
          totalAmount: monthsOwed * feeType.amount,
          lastPaidMonth,
          nextDueMonth: nextDueDate.toLocaleDateString("fr-FR", {
            month: "long",
            year: "numeric",
          }),
        });
      }
    });

    return outstandingFees;
  };

  const outstandingFees = getOutstandingFees();

  const handlePayment = () => {
    openPayment();
  };

  // Colonnes pour l'historique des inscriptions
  const enrollmentColumns: Column<any>[] = [
    {
      key: "academicYear",
      title: "Année Académique",
      render: (_, enrollment) => {
        const year = academicYears.find(
          (y) => y.id === enrollment.academicYearId
        );
        return (
          <div>
            <div className="font-medium text-gray-900">{year?.name}</div>
            {year?.isCurrent && (
              <Badge variant="success" size="sm" className="mt-1">
                Courante
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "class",
      title: "Classe",
      render: (_, enrollment) => {
        const classItem = classes.find((c) => c.id === enrollment.classId);
        return (
          <div>
            <div className="font-medium text-gray-900">{classItem?.name}</div>
            <div className="text-sm text-gray-500">
              {classItem?.section?.name}
            </div>
          </div>
        );
      },
    },
    {
      key: "enrollmentDate",
      title: "Date d'inscription",
      render: (date) => formatDate(date),
    },
    {
      key: "status",
      title: "Statut",
      render: (status) => (
        <Badge variant={status === "active" ? "success" : "default"}>
          {status === "active" ? "Actif" : "Terminé"}
        </Badge>
      ),
    },
  ];

  // Colonnes pour les paiements récents
  const paymentColumns: Column<any>[] = [
    {
      key: "paymentNumber",
      title: "N° Paiement",
      render: (paymentNumber) => (
        <div className="font-medium text-gray-900">{paymentNumber}</div>
      ),
    },
    {
      key: "feeType",
      title: "Type de Frais",
      render: (_, payment) => {
        return (
          <div className="text-sm text-gray-900">
            {payment?.feeType?.name || "Type inconnu"}
          </div>
        );
      },
    },
    {
      key: "amount",
      title: "Montant",
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "paymentDate",
      title: "Date",
      render: (date) => formatDate(date),
    },
    {
      key: "paymentMethod",
      title: "Méthode",
      render: (method) => (
        <Badge variant="info" size="sm">
          {method === "cash"
            ? "Espèces"
            : method === "bank_transfer"
            ? "Virement"
            : method === "check"
            ? "Chèque"
            : method === "mobile_money"
            ? "Mobile Money"
            : method}
        </Badge>
      ),
    },
  ];
  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dossier de {student.firstName} {student.lastName}
            </h1>
            <p className="text-gray-600">
              Numéro d'élève : {student.studentNumber}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handlePayment}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Nouveau Paiement
          </Button>
          {/* <Button
            variant="outline"
            onClick={() => navigate(`/students/${student.id}/enroll`)}
            leftIcon={<UserCheck className="h-4 w-4" />}
          >
            Inscrire
          </Button> */}
          <Button
            onClick={() => navigate(`/students/${student.id}/edit`)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Modifier
          </Button>
        </div>
      </div>

      {/* Informations principales */}
      <div className="flex items-start space-x-6">
        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </div>

        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {student.firstName} {student.lastName}
            </h2>
            {getStatusBadge(student.status)}
          </div>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Hash className="h-4 w-4 mr-1" />
              <span className="font-mono">{student.studentNumber}</span>
            </div>
            {student.dateOfBirth && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{calculateAge(student.dateOfBirth)} ans</span>
              </div>
            )}
            {student.gender && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>
                  {student.gender === "male" ? "Masculin" : "Féminin"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Prénom
                </label>
                <p className="text-gray-900">{student.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Nom</label>
                <p className="text-gray-900">{student.lastName}</p>
              </div>
            </div>

            {student.dateOfBirth && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Date de naissance
                  </label>
                  <p className="text-gray-900">
                    {formatDate(student.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Âge
                  </label>
                  <p className="text-gray-900">
                    {calculateAge(student.dateOfBirth)} ans
                  </p>
                </div>
              </div>
            )}

            {student.gender && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Genre
                </label>
                <p className="text-gray-900 capitalize">
                  {student.gender === "male" ? "Masculin" : "Féminin"}
                </p>
              </div>
            )}

            {student.address && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Adresse
                </label>
                <p className="text-gray-900">{student.address}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">
                Date d'inscription
              </label>
              <p className="text-gray-900">{formatDate(student.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Informations du parent/tuteur */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Parent/Tuteur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.parentName && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Nom complet
                </label>
                <p className="text-gray-900">{student.parentName}</p>
              </div>
            )}

            {student.parentPhone && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Téléphone
                </label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{student.parentPhone}</p>
                </div>
              </div>
            )}

            {student.parentEmail && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Email
                </label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{student.parentEmail}</p>
                </div>
              </div>
            )}

            {!student.parentName &&
              !student.parentPhone &&
              !student.parentEmail && (
                <p className="text-gray-500 italic">
                  Aucune information de contact disponible
                </p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Informations financières */}
      <div className="grid grid-cols-1 gap-6">
        {/* Paiements récents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Paiements Récents
              </div>
              <Button
                size="sm"
                onClick={handlePayment}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Nouveau Paiement
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && student?.payments?.length > 0 ? (
              <Table
                data={student?.payments?.slice(-5).reverse()}
                columns={paymentColumns}
                loading={loading}
                emptyMessage="Aucun paiement trouvé"
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Aucun paiement enregistré</p>
                <Button
                  className="mt-4"
                  onClick={handlePayment}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Enregistrer un Paiement
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historique académique */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Historique Académique
            </div>
            <Button
              onClick={() => navigate(`/students/${student.id}/enroll`)}
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Nouvelle Inscription
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <Table
              data={enrollments}
              columns={enrollmentColumns}
              loading={loading}
              emptyMessage="Aucune inscription trouvée"
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucune inscription trouvée</p>
              <p className="text-sm">
                Cet élève n'est inscrit dans aucune classe pour le moment.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate(`/students/${student.id}/enroll`)}
                leftIcon={<UserCheck className="h-4 w-4" />}
              >
                Inscrire en classe
              </Button>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Frais en souffrance */}
      {outstandingFees.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-900">
              <CreditCard className="h-5 w-5 mr-2" />
              Frais en Souffrance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {outstandingFees.map((fee, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {fee.feeType.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {fee.monthsOwed} mois en retard
                      {fee.lastPaidMonth &&
                        ` (dernier paiement: ${fee.lastPaidMonth})`}
                    </div>
                    <div className="text-xs text-orange-600">
                      Prochain mois dû: {fee.nextDueMonth}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-orange-600">
                      {formatCurrency(fee.totalAmount, currentSchool?.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(
                        fee.feeType.amount,
                        currentSchool?.currency
                      )}{" "}
                      × {fee.monthsOwed}
                    </div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-orange-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-orange-900">
                    Total en souffrance:
                  </span>
                  <span className="text-xl font-bold text-orange-600">
                    {formatCurrency(
                      outstandingFees.reduce(
                        (sum, fee) => sum + fee.totalAmount,
                        0
                      ),
                      currentSchool?.currency
                    )}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de paiement */}
      <Modal
        isOpen={isPaymentOpen}
        onClose={closePayment}
        title="Nouveau Paiement"
        size="lg"
      >
        <PaymentForm
          preselectedStudentId={student.id}
          onSuccess={() => {
            closePayment();
            // Recharger la page pour voir le nouveau paiement
            window.location.reload();
          }}
          onCancel={closePayment}
        />
      </Modal>
    </div>
  );
};

export { StudentDetailsPage };
