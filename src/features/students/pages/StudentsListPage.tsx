import React, { useState } from "react";
import {
  Plus,
  Search,
  GraduationCap,
  Users,
  UserCheck,
  Eye,
  Edit,
  Archive,
  Filter,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Select } from "../../../shared/components/ui/Select";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { Modal } from "../../../shared/components/ui/Modal";
import { useNavigate } from "react-router-dom";
import { studentsApi } from "../../../shared/services/api";
import { formatDate } from "../../../shared/utils";
import {
  STUDENT_STATUS,
  STUDENT_STATUS_LABELS,
  STATUS_COLORS,
} from "../../../shared/constants";
import { StudentForm } from "../components/StudentForm";
import type { Student } from "../../../shared/types";
import { useAuth } from "@/shared/stores";
import { useApiPlatformCollection, useModal } from "@/shared/hooks";

const StudentsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSchool } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Hook pour la collection d'élèves avec API Platform
  const {
    data: students,
    loading,
    pagination,
    updateParams,
    goToPage,
    search,
    filter,
    sort,
  } = useApiPlatformCollection(
    (params) => studentsApi.searchStudents(params),
    {
      page: 1,
      itemsPerPage: 20,
      order: { lastName: "asc" },
    },
    {
      cacheKey: "students_list",
      immediate: true,
    }
  );

  // Mettre à jour les filtres
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    search(value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    filter({ status: value || undefined });
  };

  const handleSectionFilterChange = (value: string) => {
    setSectionFilter(value);
    filter({ section: value || undefined });
  };

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    openForm();
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    navigate(`/students/${student.id}/edit`);
  };

  const handleViewStudent = (student: Student) => {
    navigate(`/students/${student.id}`);
  };

  const handleEnrollStudent = (student: Student) => {
    navigate(`/students/${student.id}/enroll`);
  };

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

  const columns: Column<Student>[] = [
    {
      key: "studentInfo",
      title: "Élève",
      sortable: true,
      render: (_, student) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {student.firstName} {student.lastName}
            </div>
            <div className="text-sm text-gray-500">
              N° {student.studentNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "dateOfBirth",
      title: "Âge",
      render: (dateOfBirth) => {
        if (!dateOfBirth) return "-";
        const age =
          new Date().getFullYear() - new Date(dateOfBirth).getFullYear();
        return (
          <div>
            <div className="text-sm text-gray-900">{age} ans</div>
            <div className="text-xs text-gray-500">
              {formatDate(dateOfBirth)}
            </div>
          </div>
        );
      },
    },
    {
      key: "gender",
      title: "Genre",
      render: (gender) => (
        <Badge variant="default" size="sm" className="capitalize">
          {gender === "male" ? "M" : gender === "female" ? "F" : "-"}
        </Badge>
      ),
    },
    {
      key: "parentInfo",
      title: "Parent/Tuteur",
      render: (_, student) => (
        <div>
          <div className="text-sm text-gray-900">
            {student.parentName || "-"}
          </div>
          <div className="text-xs text-gray-500">
            {student.parentPhone || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "currentClass",
      title: "Classe Actuelle",
      render: (_, student) => (
        <div className="text-sm text-gray-600">
          {/* À implémenter avec les inscriptions API */}
          Non inscrit
        </div>
      ),
    },
    {
      key: "status",
      title: "Statut",
      render: (status) => getStatusBadge(status),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, student) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewStudent(student)}
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEnrollStudent(student)}
            title="Inscrire en classe"
          >
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditStudent(student)}
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            title="Archiver"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const statusOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(STUDENT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  // Options de sections - à charger depuis l'API
  const sectionOptions = [
    { value: "", label: "Toutes les sections" },
    { value: "maternel", label: "Maternel" },
    { value: "primaire", label: "Primaire" },
    { value: "secondaire", label: "Secondaire" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Élèves
          </h1>
          <p className="text-gray-600">
            Gérez les dossiers élèves de {currentSchool?.name}
          </p>
        </div>
        <Button
          onClick={handleCreateStudent}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvel Élève
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un élève (nom, prénom, numéro, parent)..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={handleStatusFilterChange}
                placeholder="Statut"
              />
            </div>
            <div className="w-48">
              <Select
                options={sectionOptions}
                value={sectionFilter}
                onChange={handleSectionFilterChange}
                placeholder="Section"
              />
            </div>
            <Button variant="outline" leftIcon={<Filter className="h-4 w-4" />}>
              Plus de filtres
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Élèves ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={students}
            columns={columns}
            loading={loading}
            emptyMessage="Aucun élève trouvé"
            onRowClick={handleViewStudent}
            pagination={pagination}
            onPageChange={goToPage}
            onSort={(key, direction) => sort(key, direction)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedStudent ? "Modifier l'Élève" : "Nouvel Élève"}
        size="lg"
      >
        <StudentForm
          student={selectedStudent}
          onSuccess={() => {
            closeForm();
            // Recharger la liste après création/modification
            updateParams({});
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { StudentsListPage };
