import React, { useState } from "react";
import {
  Plus,
  Search,
  UserCog,
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
  useApiPlatformCollection,
  useAuth,
  useModal,
} from "../../../shared/hooks";
import { formatDate } from "../../../shared/utils";
import { USER_ROLE_LABELS, USER_ROLES } from "../../../shared/constants";
import { SchoolManagerForm } from "../components/SchoolManagerForm";
import type { User } from "../../../shared/types";
import { usersApi } from "@/shared/services/api";

const SchoolManagersListPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState<User | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isViewOpen, open: openView, close: closeView } = useModal();

  // TODO: Remplacer par des appels API réels
  const schools: any[] = [];

  const {
    data: schoolManagers,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => usersApi.getCollection(params),
    {
      page: 1,
      itemsPerPage: 20,
      role: USER_ROLES.SCHOOL_MANAGER,
      order: { createdAt: "desc" },
    },
    {
      cacheKey: "sections_list",
      immediate: true,
    }
  );

  const filteredManagers = schoolManagers.filter(
    (manager) =>
      manager.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateManager = () => {
    setSelectedManager(null);
    openForm();
  };

  const handleEditManager = (manager: User) => {
    setSelectedManager(manager);
    openForm();
  };

  const handleViewManager = (manager: User) => {
    setSelectedManager(manager);
    openView();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "success",
      inactive: "warning",
      archived: "default",
    } as const;

    const labels = {
      active: "Actif",
      inactive: "Inactif",
      archived: "Archivé",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || "default"}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      title: "School Manager",
      sortable: true,
      render: (_, manager) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <UserCog className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {manager.firstName} {manager.lastName}
            </div>
            <div className="text-sm text-gray-500">{manager.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "assignedSchools",
      title: "Écoles Assignées",
      render: (_, manager) => {
        const assignedSchools =
          manager.managedSchools ||
          (manager.schoolId ? [manager.schoolId] : []);
        const schoolNames = assignedSchools.map((s) => s.name);

        return (
          <div>
            <div className="font-medium text-gray-900">
              {assignedSchools.length} école(s)
            </div>
            <div className="text-sm text-gray-500">
              {schoolNames.slice(0, 2).join(", ")}
              {schoolNames.length > 2 && ` +${schoolNames.length - 2} autres`}
            </div>
          </div>
        );
      },
    },
    {
      key: "phone",
      title: "Téléphone",
      render: (phone) => (
        <div className="text-sm text-gray-900">{phone || "Non renseigné"}</div>
      ),
    },
    {
      key: "status",
      title: "Statut",
      render: (status) => getStatusBadge(status),
    },
    {
      key: "lastLogin",
      title: "Dernière Connexion",
      render: (lastLogin) => (
        <div className="text-sm text-gray-600">
          {lastLogin ? formatDate(lastLogin, "dd/MM/yyyy HH:mm") : "Jamais"}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Créé le",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, manager) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewManager(manager)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditManager(manager)}
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

  // Vérifier les permissions
  if (user?.role !== USER_ROLES.PLATFORM_ADMIN) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserCog className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Seuls les administrateurs de la plateforme peuvent gérer les school
          managers.
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
            Gestion des School Managers
          </h1>
          <p className="text-gray-600">
            Gérez les gestionnaires d'écoles de la plateforme
          </p>
        </div>
        <Button
          onClick={handleCreateManager}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouveau School Manager
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCog className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Managers
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {schoolManagers.length}
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
                <p className="text-sm font-medium text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schoolManagers.filter((m) => m.status === "active").length}
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
                <p className="text-sm font-medium text-gray-600">
                  Connectés Récemment
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    schoolManagers.filter((m) => {
                      if (!m.lastLogin) return false;
                      const lastLogin = new Date(m.lastLogin);
                      const weekAgo = new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                      );
                      return lastLogin > weekAgo;
                    }).length
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
                <p className="text-sm font-medium text-gray-600">
                  Multi-Écoles
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    schoolManagers.filter(
                      (m) => (m.assignedSchools?.length || 0) > 1
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
                placeholder="Rechercher un school manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Managers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des School Managers ({filteredManagers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredManagers}
            columns={columns}
            loading={false}
            emptyMessage="Aucun school manager trouvé"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={
          selectedManager
            ? "Modifier le School Manager"
            : "Nouveau School Manager"
        }
        size="lg"
      >
        <SchoolManagerForm
          manager={selectedManager}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={closeView}
        title="Détails du School Manager"
        size="lg"
      >
        {selectedManager && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <UserCog className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedManager.firstName} {selectedManager.lastName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(selectedManager.status)}
                  <Badge variant="info">
                    {
                      USER_ROLE_LABELS[
                        selectedManager.role as keyof typeof USER_ROLE_LABELS
                      ]
                    }
                  </Badge>
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
                    {selectedManager.email}
                  </p>
                  <p>
                    <span className="text-gray-600">Téléphone:</span>{" "}
                    {selectedManager.phone || "Non renseigné"}
                  </p>
                  <p>
                    <span className="text-gray-600">Dernière connexion:</span>{" "}
                    {selectedManager.lastLogin
                      ? formatDate(
                          selectedManager.lastLogin,
                          "dd/MM/yyyy HH:mm"
                        )
                      : "Jamais"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Écoles Assignées
                </h4>
                <div className="space-y-2">
                  {(
                    selectedManager.assignedSchools || [
                      selectedManager.schoolId,
                    ]
                  )
                    .filter(Boolean)
                    .map((schoolId) => {
                      const school = schools.find((s) => s.id === schoolId);
                      return school ? (
                        <div
                          key={schoolId}
                          className="flex items-center space-x-2"
                        >
                          <Badge variant="info" size="sm">
                            {school.name}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            ({school.subscriptionPlan})
                          </span>
                        </div>
                      ) : null;
                    })}
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
                  handleEditManager(selectedManager);
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

export { SchoolManagersListPage };
