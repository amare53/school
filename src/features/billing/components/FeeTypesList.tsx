import React, { useState } from "react";
import {
  Plus,
  DollarSign,
  Edit,
  Archive,
  Clock,
  CheckCircle,
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
import { Modal } from "../../../shared/components/ui/Modal";
import {
  useApiPlatformCollection,
  useAuth,
  useModal,
} from "../../../shared/hooks";
import { useFakeDataStore } from "../../../shared/stores/fakeData";
import { formatCurrency } from "../../../shared/utils";
import { FeeTypeForm } from "./FeeTypeForm";
import type { FeeType } from "../../../shared/types";
import { feeTypesApi } from "@/shared/services/api";

const FeeTypesList: React.FC = () => {
  const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // Récupérer les types de frais pour l'école courante
  const {
    data: feeTypes,
    loading,
    pagination,
    goToPage,
    sort,
  } = useApiPlatformCollection(
    (params) => feeTypesApi.getCollection(params),
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

  const handleCreateFeeType = () => {
    setSelectedFeeType(null);
    openForm();
  };

  const handleEditFeeType = (feeType: FeeType) => {
    setSelectedFeeType(feeType);
    openForm();
  };

  const getFrequencyBadge = (frequency: string) => {
    const variants = {
      once: "default",
      monthly: "info",
      quarterly: "warning",
      annually: "success",
    } as const;

    const labels = {
      once: "Une fois",
      monthly: "Mensuel",
      quarterly: "Trimestriel",
      annually: "Annuel",
    };

    return (
      <Badge
        variant={variants[frequency as keyof typeof variants] || "default"}
      >
        {labels[frequency as keyof typeof labels] || frequency}
      </Badge>
    );
  };

  const columns: Column<FeeType>[] = [
    {
      key: "name",
      title: "Type de Frais",
      sortable: true,
      render: (_, feeType) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{feeType.name}</div>
            <div className="text-sm text-gray-500">{feeType.description}</div>
          </div>
        </div>
      ),
    },
    {
      key: "amount",
      title: "Montant",
      sortable: true,
      render: (amount) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(amount)}
        </div>
      ),
    },
    {
      key: "billingFrequency",
      title: "Fréquence",
      render: (frequency) => getFrequencyBadge(frequency),
    },
    {
      key: "isMandatory",
      title: "Type",
      render: (isMandatory) => (
        <Badge variant={isMandatory ? "error" : "info"}>
          {isMandatory ? "Obligatoire" : "Optionnel"}
        </Badge>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (_, feeType) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditFeeType(feeType)}
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
            Configuration des Frais
          </h1>
          <p className="text-gray-600">
            Configurez les différents types de frais de votre école
          </p>
        </div>
        <Button
          onClick={handleCreateFeeType}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Nouveau Type de Frais
        </Button>
      </div>

      {/* Fee Types Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Types de Frais ({feeTypes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            data={feeTypes}
            columns={columns}
            loading={false}
            emptyMessage="Aucun type de frais configuré"
          />
        </CardContent>
      </Card>

      {/* Empty state */}
      {feeTypes.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun type de frais
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer les types de frais de votre école
              (inscription, scolarité, cantine, etc.).
            </p>
            <Button
              onClick={handleCreateFeeType}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Créer le premier type de frais
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={
          selectedFeeType
            ? "Modifier le Type de Frais"
            : "Nouveau Type de Frais"
        }
        size="md"
      >
        <FeeTypeForm
          feeType={selectedFeeType}
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { FeeTypesList };
