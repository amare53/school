import React, { useState } from "react";
import {
  Plus,
  Search,
  DollarSign,
  Eye,
  Edit,
  Download,
  Filter,
  Receipt,
  FileText,
  AlertTriangle,
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
import { expensesApi } from "../../../shared/services/api";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseDetails } from "./ExpenseDetails";
import type { Expense } from "../../../shared/types";
import { useAuth } from "@/shared/stores";
import { useApiPlatformCollection, useModal } from "@/shared/hooks";
import { USER_ROLES } from "@/shared/constants";

const ExpensesList: React.FC = () => {
  const { currentSchool, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [hasReceiptFilter, setHasReceiptFilter] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const {
    isOpen: isDetailsOpen,
    open: openDetails,
    close: closeDetails,
  } = useModal();

  // Hook pour la collection de dépenses avec API Platform
  const {
    data: expenses,
    loading,
    pagination,
    updateParams,
    goToPage,
    search,
    filter,
    sort,
  } = useApiPlatformCollection(
    (params) => expensesApi.searchExpenses(params),
    {
      page: 1,
      itemsPerPage: 20,
      order: { expenseDate: "desc" },
    },
    {
      cacheKey: "expenses_list",
      immediate: true,
    }
  );

  // Gestionnaires de filtres
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    search(value);
  };

  const handleFiltersChange = () => {
    filter({
      category: categoryFilter || undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
      hasReceipt: hasReceiptFilter ? hasReceiptFilter === "true" : undefined,
    });
  };

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    openForm();
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    openForm();
  };

  const handleViewExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    openDetails();
  };

  const getCategoryBadge = (category: string) => {
    const variants = {
      salaries: "success",
      utilities: "info",
      supplies: "warning",
      maintenance: "default",
      other: "default",
    } as const;

    const labels = {
      salaries: "Salaires",
      utilities: "Services",
      supplies: "Fournitures",
      maintenance: "Maintenance",
      other: "Autres",
    };

    return (
      <Badge variant={variants[category as keyof typeof variants] || "default"}>
        {labels[category as keyof typeof labels] || category}
      </Badge>
    );
  };

  const columns: Column<Expense>[] = [
    {
      key: "expenseNumber",
      title: "Dépense",
      sortable: true,
      render: (_, expense) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {expense.expenseNumber}
            </div>
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {expense.description}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Montant",
      sortable: true,
      render: (amount) => (
        <div className="font-medium text-red-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "expenseDate",
      title: "Date",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "category",
      title: "Catégorie",
      render: (category) => getCategoryBadge(category),
    },
    {
      key: "supplier",
      title: "Fournisseur",
      render: (supplier) => (
        <div className="text-sm text-gray-900">
          {supplier || "Non spécifié"}
        </div>
      ),
    },
    {
      key: "receipt",
      title: "Justificatif",
      render: (_, expense) => (
        <div className="flex items-center">
          {expense.receiptUrl ? (
            <Badge variant="success" size="sm">
              <FileText className="h-3 w-3 mr-1" />
              Disponible
            </Badge>
          ) : (
            <Badge variant="warning" size="sm">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Manquant
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, expense) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewExpense(expense)}
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {USER_ROLES.CASHIER !== user?.role && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditExpense(expense)}
              title="Modifier"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {expense.receiptUrl && (
            <Button variant="ghost" size="sm" title="Télécharger justificatif">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const categoryOptions = [
    { value: "", label: "Toutes les catégories" },
    { value: "salaries", label: "Salaires" },
    { value: "utilities", label: "Services (eau, électricité)" },
    { value: "supplies", label: "Fournitures" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Autres" },
  ];

  const receiptOptions = [
    { value: "", label: "Tous" },
    { value: "true", label: "Avec justificatif" },
    { value: "false", label: "Sans justificatif" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dépenses</h2>
          <p className="text-gray-600">
            Gérez toutes les dépenses avec justificatifs
          </p>
        </div>
        <Button
          onClick={handleCreateExpense}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouvelle Dépense
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher une dépense (numéro, description, fournisseur)..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <Select
                options={categoryOptions}
                value={categoryFilter}
                onChange={(value) => {
                  setCategoryFilter(value);
                  handleFiltersChange();
                }}
                placeholder="Catégorie"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Date début"
                value={dateFromFilter}
                onChange={(e) => {
                  setDateFromFilter(e.target.value);
                  handleFiltersChange();
                }}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Date fin"
                value={dateToFilter}
                onChange={(e) => {
                  setDateToFilter(e.target.value);
                  handleFiltersChange();
                }}
              />
            </div>
            <div>
              <Select
                options={receiptOptions}
                value={hasReceiptFilter}
                onChange={(value) => {
                  setHasReceiptFilter(value);
                  handleFiltersChange();
                }}
                placeholder="Justificatif"
              />
            </div>
            <div>
              <Button
                variant="outline"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                  setDateFromFilter("");
                  setDateToFilter("");
                  setHasReceiptFilter("");
                  updateParams({ page: 1 });
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Dépenses ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={expenses}
            columns={columns}
            loading={loading}
            emptyMessage="Aucune dépense trouvée"
            onRowClick={handleViewExpense}
            pagination={pagination}
            onPageChange={goToPage}
            onSort={(key, direction) => sort(key, direction)}
          />
        </CardContent>
      </Card>

      {/* Alert pour justificatifs manquants */}
      {expenses.some((e) => !e.receiptUrl) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Justificatifs manquants</p>
                <p>
                  Certaines dépenses n'ont pas de justificatif. Pensez à ajouter
                  les reçus pour une comptabilité complète.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={selectedExpense ? "Modifier la Dépense" : "Nouvelle Dépense"}
        size="lg"
      >
        <ExpenseForm
          expense={selectedExpense}
          onSuccess={() => {
            closeForm();
            // Recharger la liste après création/modification
            updateParams({});
          }}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        title="Détails de la Dépense"
        size="xl"
      >
        {selectedExpense && (
          <ExpenseDetails
            expense={selectedExpense}
            onEdit={() => {
              closeDetails();
              handleEditExpense(selectedExpense);
            }}
            onClose={closeDetails}
          />
        )}
      </Modal>
    </div>
  );
};

export { ExpensesList };
