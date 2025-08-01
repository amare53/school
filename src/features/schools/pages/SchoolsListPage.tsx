import React, { useState } from "react";
import {
  Plus,
  Search,
  Building,
  Users,
  Calendar,
  Settings,
  Eye,
  Edit,
  Archive,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../shared/components/ui/Card";
import { Button } from "../../../shared/components/ui/Button";
import { Input } from "../../../shared/components/ui/Input";
import { Badge } from "../../../shared/components/ui/Badge";
import { Table, type Column } from "../../../shared/components/ui/Table";
import { Modal } from "../../../shared/components/ui/Modal";
import {
  useAuth,
  useModal,
  useApiCall,
  useApiPlatformCollection,
} from "../../../shared/hooks";
import { formatDate } from "../../../shared/utils";
import { SchoolForm } from "../components/SchoolForm";
import type { School } from "../../../shared/types";
import { USER_ROLES } from "@/shared/constants";
import { schoolsApi } from "@/shared/services/api";

const SchoolsListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isViewOpen, open: openView, close: closeView } = useModal();
  const {
    data: allSchools,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => schoolsApi.getCollection(params),
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

  // Filtrer les écoles accessibles selon le rôle
  const getAccessibleSchools = () => {
    if (user?.role === USER_ROLES.PLATFORM_ADMIN) {
      return allSchools;
    } else if (user?.role === "school_manager") {
      const schoolIds =
        user.assignedSchools || (user.schoolId ? [user.schoolId] : []);
      return allSchools.filter((school) => schoolIds.includes(school.id));
    }
    return [];
  };

  const accessibleSchools = getAccessibleSchools();

  const filteredSchools = allSchools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateSchool = () => {
    setSelectedSchool(null);
    openForm();
  };

  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    openForm();
  };

  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    openView();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "success",
      suspended: "warning",
      archived: "default",
    } as const;

    const labels = {
      active: "Actif",
      suspended: "Suspendu",
      archived: "Archivé",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants = {
      basic: "default",
      standard: "info",
      premium: "success",
    } as const;

    return (
      <Badge
        variant={variants[plan as keyof typeof variants] || "default"}
        className="capitalize"
      >
        {plan}
      </Badge>
    );
  };

  const columns: Column<School>[] = [
    {
      key: "name",
      title: "École",
      sortable: true,
      render: (_, school) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{school.name}</div>
            <div className="text-sm text-gray-500">{school.email}</div>
          </div>
        </div>
      ),
    },
    // {
    //   key: "address",
    //   title: "Adresse",
    //   render: (address) => (
    //     <div className="text-sm text-gray-600 max-w-xs truncate">
    //       {address || "Non renseignée"}
    //     </div>
    //   ),
    // },
    {
      key: "phone",
      title: "Téléphone",
      render: (phone) => (
        <div className="text-sm text-gray-900">{phone || "Non renseigné"}</div>
      ),
    },
    {
      key: "subscriptionPlan",
      title: "Plan",
      render: (plan) => getPlanBadge(plan),
    },
    {
      key: "status",
      title: "Statut",
      render: (status) => getStatusBadge(status),
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
      render: (_, school) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewSchool(school)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(user.role === USER_ROLES.PLATFORM_ADMIN ||
            (user.role === "school_manager" &&
              school.id === user.schoolId)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditSchool(school)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {user.role === USER_ROLES.PLATFORM_ADMIN && (
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

  // Vérifier les permissions
  if (user?.role !== USER_ROLES.PLATFORM_ADMIN) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Seuls les administrateurs de la plateforme peuvent gérer les écoles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === USER_ROLES.PLATFORM_ADMIN
              ? "Gestion des Écoles"
              : "Mes Écoles"}
          </h1>
          <p className="text-gray-600">
            {user.role === USER_ROLES.PLATFORM_ADMIN
              ? "Gérez toutes les écoles de la plateforme"
              : "Gérez vos écoles assignées"}
          </p>
        </div>
        {user.role === USER_ROLES.PLATFORM_ADMIN && (
          <Button
            onClick={handleCreateSchool}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Nouvelle École
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {user.role === USER_ROLES.PLATFORM_ADMIN
                    ? "Total Écoles"
                    : "Mes Écoles"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {accessibleSchools.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Écoles Actives
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    accessibleSchools.filter((s) => s.status === "active")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Suspendues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    accessibleSchools.filter((s) => s.status === "suspended")
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Premium</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    accessibleSchools.filter(
                      (s) => s.subscriptionPlan === "premium"
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une école..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schools Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Écoles ({filteredSchools.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredSchools}
            columns={columns}
            loading={loading}
            emptyMessage="Aucune école trouvée"
            pagination={pagination}
            onPageChange={goToPage}
            onSort={(key, direction) => sort(key, direction)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      {(user.role === USER_ROLES.PLATFORM_ADMIN ||
        (user.role === "school_manager" && selectedSchool)) && (
        <Modal
          isOpen={isFormOpen}
          onClose={closeForm}
          title={selectedSchool ? "Modifier l'École" : "Nouvelle École"}
          size="lg"
        >
          <SchoolForm
            school={selectedSchool}
            onSuccess={() => {
              closeForm();
              window.location.reload();
            }}
            onCancel={closeForm}
          />
        </Modal>
      )}

      <Modal
        isOpen={isViewOpen}
        onClose={closeView}
        title="Détails de l'École"
        size="lg"
      >
        {selectedSchool && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedSchool.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(selectedSchool.status)}
                  {getPlanBadge(selectedSchool.subscriptionPlan)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Informations de Contact
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Email:</span>{" "}
                    {selectedSchool.email}
                  </p>
                  <p>
                    <span className="text-gray-600">Téléphone:</span>{" "}
                    {selectedSchool.phone || "Non renseigné"}
                  </p>
                  <p>
                    <span className="text-gray-600">Adresse:</span>{" "}
                    {selectedSchool.address || "Non renseignée"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Informations Système
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Créée le:</span>{" "}
                    {formatDate(selectedSchool.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-600">Plan:</span>{" "}
                    {selectedSchool.subscriptionPlan}
                  </p>
                  <p>
                    <span className="text-gray-600">Statut:</span>{" "}
                    {selectedSchool.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={closeView}>
                Fermer
              </Button>
              <Button
                onClick={() => {
                  closeView();
                  handleEditSchool(selectedSchool);
                }}
              >
                Modifier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export { SchoolsListPage };
