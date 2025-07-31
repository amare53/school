import React, { useState } from "react";
import { Plus, Search, Users, Eye, Edit, Archive } from "lucide-react";
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
import { useAuth, useModal } from "../../../shared/hooks";
import { formatDate } from "../../../shared/utils";
import { USER_ROLE_LABELS } from "../../../shared/constants";
import { UserForm } from "../components/UserForm";
import type { User } from "../../../shared/types";

const UsersListPage: React.FC = () => {
  const { user: currentUser, currentSchool } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const { isOpen: isViewOpen, open: openView, close: closeView } = useModal();

  // Récupérer les utilisateurs pour les écoles du school manager
  const getAccessibleUsers = () => {
    // TODO: Remplacer par des appels API réels
    return [];
  };

  const users = getAccessibleUsers();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setSelectedUser(null);
    openForm();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    openForm();
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
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

  const getRoleBadge = (role: string) => {
    const variants = {
      cashier: "info",
      accountant: "warning",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || "default"}>
        {USER_ROLE_LABELS[role as keyof typeof USER_ROLE_LABELS] || role}
      </Badge>
    );
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      title: "Utilisateur",
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Rôle",
      render: (role) => getRoleBadge(role),
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
      render: (_, user) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewUser(user)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditUser(user)}
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

  const roleOptions = [
    { value: "", label: "Tous les rôles" },
    { value: "cashier", label: "Caissier" },
    { value: "accountant", label: "Comptable" },
  ];

  // Vérifier les permissions
  if (currentUser?.role !== "school_manager") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Seuls les gestionnaires d'école peuvent gérer les utilisateurs.
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
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            Gérez les caissiers et comptables de vos écoles
          </p>
        </div>
        <Button
          onClick={handleCreateUser}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvel Utilisateur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Utilisateurs
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.length}
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
                <p className="text-sm font-medium text-gray-600">Caissiers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "cashier").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Comptables</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.role === "accountant").length}
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
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-48">
              <Select
                options={roleOptions}
                value={roleFilter}
                onChange={setRoleFilter}
                placeholder="Rôle"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={filteredUsers}
            columns={columns}
            loading={false}
            emptyMessage="Aucun utilisateur trouvé"
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedUser ? "Modifier l'Utilisateur" : "Nouvel Utilisateur"}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={isViewOpen}
        onClose={closeView}
        title="Détails de l'Utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(selectedUser.status)}
                  {getRoleBadge(selectedUser.role)}
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
                    {selectedUser.email}
                  </p>
                  <p>
                    <span className="text-gray-600">Téléphone:</span>{" "}
                    {selectedUser.phone || "Non renseigné"}
                  </p>
                  <p>
                    <span className="text-gray-600">Dernière connexion:</span>{" "}
                    {selectedUser.lastLogin
                      ? formatDate(selectedUser.lastLogin, "dd/MM/yyyy HH:mm")
                      : "Jamais"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Informations Système
                </h4>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Créé le:</span>{" "}
                    {formatDate(selectedUser.createdAt)}
                  </p>
                  <p>
                    <span className="text-gray-600">Rôle:</span>{" "}
                    {
                      USER_ROLE_LABELS[
                        selectedUser.role as keyof typeof USER_ROLE_LABELS
                      ]
                    }
                  </p>
                  <p>
                    <span className="text-gray-600">Statut:</span>{" "}
                    {selectedUser.status}
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
                  handleEditUser(selectedUser);
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

export { UsersListPage };
