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
import { useApiPlatformCollection, useAuth } from "../../../shared/hooks";
import { useFakeDataStore } from "../../../shared/stores/fakeData";
import { formatDate } from "../../../shared/utils";
import {
  STUDENT_STATUS_LABELS,
  STATUS_COLORS,
} from "../../../shared/constants";
import { studentsApi } from "@/shared/services/api";

const StudentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSchool } = useAuth();
  const { data: student, loading } = useApiPlatformCollection(
    (id) => studentsApi.getItem(id),
    id,
    {
      cacheKey: "sections_list",
      immediate: true,
      one: true,
    }
  );

  const {
    getStudentsBySchool,
    getEnrollmentsByStudent,
    getClassesBySchool,
    getAcademicYearsBySchool,
  } = useFakeDataStore();

  // Récupérer l'élève
  const schoolId = currentSchool?.id || "";

  // Récupérer les données liées
  const enrollments = getEnrollmentsByStudent(id || "");
  const classes = getClassesBySchool(schoolId);
  const academicYears = getAcademicYearsBySchool(schoolId);

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
            onClick={() => navigate(`/students/${student.id}/enroll`)}
            leftIcon={<UserCheck className="h-4 w-4" />}
          >
            Inscrire
          </Button>
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

      {/* Historique académique */}
      <Card>
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
      </Card>

      {/* Informations financières */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Factures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune facture</p>
              <p className="text-xs text-gray-400">
                Les factures apparaîtront après inscription
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Paiements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun paiement</p>
              <p className="text-xs text-gray-400">
                Les paiements apparaîtront après facturation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { StudentDetailsPage };
