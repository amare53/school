import React, { useState } from "react";
import {
  Plus,
  DollarSign,
  Receipt,
  FileText,
  TrendingUp,
  AlertTriangle,
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
import { useAuth, useModal } from "../../../shared/hooks";
import { ExpensesList } from "../components/ExpensesList";
import { ExpenseForm } from "../components/ExpenseForm";
import { ExpenseCategories } from "../components/ExpenseCategories";
import { Modal } from "../../../shared/components/ui/Modal";
import { USER_ROLES } from "@/shared/constants";

type TabType = "expenses" | "categories";

const ExpensesPage: React.FC = () => {
  const { user, currentSchool } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("expenses");
  const { isOpen: isFormOpen, open: openForm, close: closeForm } = useModal();

  // TODO: Remplacer par des appels API réels
  const totalExpenses = 0;
  const todayExpenses = 0;
  const thisMonthExpenses = 0;
  const expensesWithReceipts = 0;
  const expenses: any[] = [];

  // Vérifier les permissions
  if (
    !user ||
    // ![USER_ROLES.SCHOOL_MANAGER].includes(user.role)
    ![USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER].includes(user.role)
  ) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Vous n'avez pas les permissions pour gérer les dépenses.
        </p>
      </div>
    );
  }

  const tabs = [
    {
      id: "expenses" as TabType,
      name: "Dépenses",
      icon: DollarSign,
      description: "Gérer les dépenses",
      count: expenses.length,
    },
    {
      id: "categories" as TabType,
      name: "Catégories",
      icon: FileText,
      description: "Gérer les catégories",
      count: 5, // Nombre de catégories fixes
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "expenses":
        return <ExpensesList />;
      case "categories":
        return <ExpenseCategories />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestion des Dépenses
          </h1>
          <p className="text-gray-600">
            Gérez les dépenses et justificatifs de {currentSchool?.name}
          </p>
        </div>
        <Button onClick={openForm} leftIcon={<Plus className="h-4 w-4" />}>
          Nouvelle Dépense
        </Button>
      </div> */}

      {/* Navigation Tabs */}
      {/* <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
                <Badge
                  variant={activeTab === tab.id ? "info" : "default"}
                  size="sm"
                  className="ml-2"
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </nav>
      </div> */}

      {/* Tab Content */}
      <div className="mt-6">
        <ExpensesList />
      </div>

      {/* Expense Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title="Nouvelle Dépense"
        size="lg"
      >
        <ExpenseForm
          onSuccess={() => {
            closeForm();
          }}
          onCancel={closeForm}
        />
      </Modal>
    </div>
  );
};

export { ExpensesPage };
