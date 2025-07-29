import React, { useState } from "react";
import { Plus, Calendar, Edit, Archive, CheckCircle } from "lucide-react";
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
import { useApiPlatformCollection, useModal } from "../../../shared/hooks";
import { formatDate } from "../../../shared/utils";
import { AcademicYearForm } from "./AcademicYearForm";
import type { AcademicYear } from "../../../shared/types";
import { academicYearsApi } from "@/shared/services/api";

const AcademicYearsList: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les années académiques pour l'école courante

  const {
    data: academicYears,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => academicYearsApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 20,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  const handleCreateYear = () => {
    setSelectedYear(null);
    openForm();
  };

  const handleEditYear = (year: AcademicYear) => {
    setSelectedYear(year);
    openForm();
  };

  const getStatusBadge = (year: AcademicYear) => {
    if (year?.isCurrent) {
      return <Badge variant="success">Année Courante</Badge>;
    }

    const variants = {
      active: "info",
      archived: "default",
    } as const;

    const labels = {
      active: "Active",
      archived: "Archivée",
    };

    return (
      <Badge
        variant={variants[year?.status as keyof typeof variants] || "default"}
      >
        {labels[year?.status as keyof typeof labels] ||
          year?.status ||
          "default"}
      </Badge>
    );
  };

  const columns: Column<AcademicYear>[] = [
    {
      key: "name",
      title: "Année Académique",
      sortable: true,
      render: (_, year) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center">
              {year.name}
              {year.isCurrent && (
                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(year.startDate)} - {formatDate(year.endDate)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "startDate",
      title: "Date de Début",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "endDate",
      title: "Date de Fin",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "status",
      title: "Statut",
      render: (_, year) => getStatusBadge(year),
    },
    {
      key: "createdAt",
      title: "Créée le",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, year) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditYear(year)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {!year.isCurrent && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Années Académiques
          </h2>
          <p className="text-gray-600">
            Gérez les années scolaires de votre école
          </p>
        </div>
        <Button
          onClick={handleCreateYear}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvelle Année
        </Button>
      </div>

      {/* Current Year Card */}
      {academicYears.find((y) => y.isCurrent) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900">
                    Année Courante:{" "}
                    {academicYears.find((y) => y.isCurrent)?.name}
                  </h3>
                  <p className="text-green-700">
                    Du{" "}
                    {formatDate(
                      academicYears.find((y) => y.isCurrent)?.startDate || ""
                    )}
                    au{" "}
                    {formatDate(
                      academicYears.find((y) => y.isCurrent)?.endDate || ""
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleEditYear(academicYears.find((y) => y.isCurrent)!)
                }
              >
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Years Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Années ({academicYears.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={academicYears}
            columns={columns}
            loading={loading}
            emptyMessage="Aucune année académique trouvée"
            pagination={pagination}
            onPageChange={goToPage}
            onSort={(key, direction) => sort(key, direction)}
          />
        </CardContent>
      </Card>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={
          selectedYear
            ? "Modifier l'Année Académique"
            : "Nouvelle Année Académique"
        }
        size="md"
      >
        <AcademicYearForm
          academicYear={selectedYear}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { AcademicYearsList };
