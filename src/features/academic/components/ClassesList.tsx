import React, { useState } from "react";
import { Plus, Users, Edit, Archive, UserCheck } from "lucide-react";
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
import { ClassForm } from "./ClassForm";
import type { Class } from "../../../shared/types";
import { classesApi } from "@/shared/services/api";

const ClassesList: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les classes pour l'école courante
  const {
    data: classes,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => classesApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 20,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "classes_list",
      immediate: true,
    }
  );

  const handleCreateClass = () => {
    setSelectedClass(null);
    openForm();
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    openForm();
  };

  // Grouper les classes par section
  const classesBySection = classes.reduce((acc, classItem) => {
    const sectionName = classItem.section?.name || "Section inconnue";

    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(classItem);
    return acc;
  }, {} as Record<string, Class[]>);

  const getOccupancyBadge = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    let variant: "success" | "warning" | "error" = "success";

    if (percentage >= 90) variant = "error";
    else if (percentage >= 75) variant = "warning";

    return (
      <Badge variant={variant} size="sm">
        {enrolled}/{capacity}
      </Badge>
    );
  };

  const columns: Column<Class>[] = [
    {
      key: "name",
      title: "Classe",
      sortable: true,
      render: (_, classItem) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{classItem.name}</div>
            <div className="text-sm text-gray-500">
              {classItem.section?.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "capacity",
      title: "Capacité",
      render: (capacity) => (
        <div className="text-sm text-gray-900">{capacity} places</div>
      ),
    },
    {
      key: "enrolled",
      title: "Inscrits",
      render: (_, classItem) => {
        const enrolled = Math.floor(Math.random() * (classItem.capacity || 30)); // Simulation
        return getOccupancyBadge(enrolled, classItem.capacity || 30);
      },
    },
    {
      key: "teacher",
      title: "Enseignant",
      render: () => <div className="text-sm text-gray-600">Non assigné</div>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, classItem) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Voir les élèves">
            <UserCheck className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditClass(classItem)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
          <p className="text-gray-600">
            Gérez les classes par année académique et section
          </p>
        </div>
        <Button
          onClick={handleCreateClass}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvelle Classe
        </Button>
      </div>

      {/* Classes by Level */}
      <div className="space-y-6">
        {Object.entries(classesBySection).map(
          ([sectionName, sectionClasses]) => (
            <Card key={sectionName}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {sectionName} ({sectionClasses.length} classes)
                  </span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="info" size="sm">
                      {sectionClasses.reduce(
                        (total, c) => total + (c.capacity || 0),
                        0
                      )}{" "}
                      places
                    </Badge>
                    <Badge variant="success" size="sm">
                      {sectionClasses.reduce(
                        (total, c) =>
                          total +
                          Math.floor(Math.random() * (c.capacity || 30)),
                        0
                      )}{" "}
                      inscrits
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table
                  data={sectionClasses}
                  columns={columns}
                  loading={loading}
                  emptyMessage="Aucune classe trouvée pour cette section"
                  pagination={pagination}
                  onPageChange={goToPage}
                  onSort={(key, direction) => sort(key, direction)}
                />
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Empty state */}
      {classes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune classe
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer des classes pour organiser vos élèves.
            </p>
            <Button
              onClick={handleCreateClass}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Créer la première classe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedClass ? "Modifier la Classe" : "Nouvelle Classe"}
        size="md"
      >
        <ClassForm
          classItem={selectedClass}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { ClassesList };
