import React, { useState } from "react";
import {
  Plus,
  Search,
  CreditCard,
  Eye,
  Edit,
  Download,
  Filter,
  Receipt,
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
import { paymentsApi } from "../../../shared/services/api";
import { formatDate, formatCurrency } from "../../../shared/utils";
import { PAYMENT_METHOD_LABELS } from "../../../shared/constants";
import { PaymentForm } from "./PaymentForm";
import { PaymentDetails } from "./PaymentDetails";
import type { Payment } from "../../../shared/types";
import { useAuth } from "@/shared/stores";
import { useApiPlatformCollection, useModal } from "@/shared/hooks";

const PaymentsList: React.FC = () => {
  const { currentSchool } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();
  const {
    isOpen: isDetailsOpen,
    open: openDetails,
    close: closeDetails,
  } = useModal();

  // Hook pour la collection de paiements avec API Platform
  const {
    data: payments,
    loading,
    pagination,
    updateParams,
    goToPage,
    search,
    filter,
    sort,
  } = useApiPlatformCollection(
    (params) => paymentsApi.searchPayments(params),
    {
      page: 1,
      itemsPerPage: 20,
      order: { paymentDate: "desc" },
    },
    {
      cacheKey: "payments_list",
      immediate: true,
    }
  );

  // Gestionnaires de filtres
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    search(value);
  };

  const handleMethodFilterChange = (value: string) => {
    setMethodFilter(value);
    filter({
      paymentMethod: value || undefined,
      dateFrom: dateFromFilter || undefined,
      dateTo: dateToFilter || undefined,
    });
  };

  const handleDateFilterChange = (dateFrom: string, dateTo: string) => {
    setDateFromFilter(dateFrom);
    setDateToFilter(dateTo);
    filter({
      paymentMethod: methodFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
  };

  const handleCreatePayment = () => {
    setSelectedPayment(null);
    openForm();
  };

  const handleEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    openForm();
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    openDetails();
  };

  const getMethodBadge = (method: string) => {
    const variants = {
      cash: "success",
      bank_transfer: "info",
      check: "warning",
      mobile_money: "default",
    } as const;

    return (
      <Badge variant={variants[method as keyof typeof variants] || "default"}>
        {PAYMENT_METHOD_LABELS[method as keyof typeof PAYMENT_METHOD_LABELS] ||
          method}
      </Badge>
    );
  };

  const columns: Column<Payment>[] = [
    {
      key: "paymentNumber",
      title: "Paiement",
      sortable: true,
      render: (_, payment) => {
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {payment.paymentNumber}
              </div>
              <div className="text-sm text-gray-500">
                {payment.student
                  ? `${payment.student.firstName} ${payment.student.lastName}`
                  : "Élève inconnu"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "student",
      title: "Élève",
      render: (_, payment) => {
        return payment.student ? (
          <div>
            <div className="font-medium text-gray-900">
              {payment.student.firstName} {payment.student.lastName}
            </div>
            <div className="text-sm text-gray-500">
              N° {payment.student.studentNumber}
            </div>
          </div>
        ) : (
          <span className="text-gray-400">Élève inconnu</span>
        );
      },
    },
    {
      key: "feeType",
      title: "Type de Frais",
      render: (_, payment) => {
        return (
          <div className="text-sm text-gray-900">
            {payment.feeType?.name || "Type inconnu"}
          </div>
        );
      },
    },
    {
      key: "amount",
      title: "Montant",
      sortable: true,
      render: (amount) => (
        <div className="font-medium text-green-600">
          {formatCurrency(amount, currentSchool?.currency)}
        </div>
      ),
    },
    {
      key: "paymentDate",
      title: "Date de Paiement",
      sortable: true,
      render: (date) => formatDate(date),
    },
    {
      key: "paymentMethod",
      title: "Méthode",
      render: (method) => getMethodBadge(method),
    },
    {
      key: "reference",
      title: "Référence",
      render: (reference) => (
        <div className="text-sm text-gray-600 font-mono">
          {reference || "-"}
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, payment) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewPayment(payment)}
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditPayment(payment)}
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Télécharger reçu">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const methodOptions = [
    { value: "", label: "Toutes les méthodes" },
    ...Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Paiements</h2>
          <p className="text-gray-600">
            Gérez tous les paiements reçus directement
          </p>
        </div>
        <Button
          onClick={handleCreatePayment}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouveau Paiement
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher un paiement (numéro, référence, élève)..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div>
              <Select
                options={methodOptions}
                value={methodFilter}
                onChange={handleMethodFilterChange}
                placeholder="Méthode"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Date début"
                value={dateFromFilter}
                onChange={(e) =>
                  handleDateFilterChange(e.target.value, dateToFilter)
                }
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Date fin"
                value={dateToFilter}
                onChange={(e) =>
                  handleDateFilterChange(dateFromFilter, e.target.value)
                }
              />
            </div>
            <div>
              <Button
                variant="outline"
                leftIcon={<Filter className="h-4 w-4" />}
                onClick={() => {
                  setSearchTerm("");
                  setMethodFilter("");
                  setDateFromFilter("");
                  setDateToFilter("");
                  updateParams({ page: 1 });
                }}
              >
                Réinitialiser
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Paiements ({pagination.totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={payments}
            columns={columns}
            loading={loading}
            emptyMessage="Aucun paiement trouvé"
            onRowClick={handleViewPayment}
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
        title={selectedPayment ? "Modifier le Paiement" : "Nouveau Paiement"}
        size="lg"
      >
        <PaymentForm
          payment={selectedPayment}
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
        title="Détails du Paiement"
        size="lg"
      >
        {selectedPayment && (
          <PaymentDetails
            payment={selectedPayment}
            onEdit={() => {
              closeDetails();
              handleEditPayment(selectedPayment);
            }}
            onClose={closeDetails}
          />
        )}
      </Modal>
    </div>
  );
};

export { PaymentsList };
