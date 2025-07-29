import React, { useState } from "react";
import { Plus, BookOpen, Edit, Archive } from "lucide-react";
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
import { SectionForm } from "./SectionForm";
import type { Section } from "../../../shared/types";
import { sectionsApi } from "@/shared/services/api";

const SectionsList: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les sections pour l'école courante
  const {
    data: sections,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => sectionsApi.getCollection(params),
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

  const handleCreateSection = () => {
    setSelectedSection(null);
    openForm();
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    openForm();
  };

  const getSectionTypeBadge = (name: string) => {
    const variants = {
      Maternel: "success",
      Primaire: "info",
      Secondaire: "warning",
    } as const;

    return (
      <Badge variant={variants[name as keyof typeof variants] || "default"}>
        {name}
      </Badge>
    );
  };

  const columns: Column<Section>[] = [
    {
      key: "name",
      title: "Nom",
      sortable: true,
      render: (_, section) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{section.name}</div>
            {/* <div className="text-sm text-gray-500">Code: {section.code}</div> */}
          </div>
        </div>
      ),
    },
    {
      key: "code",
      title: "Code",
      render: (code) => (
        <Badge variant="default" size="sm">
          {code}
        </Badge>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (_, section) => getSectionTypeBadge(section.name),
    },
    {
      key: "classes",
      title: "Classes",
      render: () => (
        <div className="text-sm text-gray-600">
          {Math.floor(Math.random() * 5) + 1} classes
        </div>
      ),
    },
    {
      key: "students",
      title: "Élèves",
      render: () => (
        <div className="text-sm text-gray-600">
          {Math.floor(Math.random() * 200) + 50} élèves
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, section) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(section)}
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
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Sections
          </h1>
          <p className="text-gray-600">Gérez les sections de votre école</p>
        </div>
        <Button
          onClick={handleCreateSection}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvelle Section
        </Button>
      </div>

      {/* Sections Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Sections ({sections.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={sections}
            columns={columns}
            loading={loading}
            emptyMessage="Aucune section trouvée"
            pagination={pagination}
            onPageChange={goToPage}
            onSort={(key, direction) => sort(key, direction)}
          />
        </CardContent>
      </Card>

      {/* Empty state */}
      {sections.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune section
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer les sections de votre école (Maternel,
              Primaire, Secondaire).
            </p>
            <Button
              onClick={handleCreateSection}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Créer la première section
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedSection ? "Modifier la Section" : "Nouvelle Section"}
        size="md"
      >
        <SectionForm
          section={selectedSection}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { SectionsList };
