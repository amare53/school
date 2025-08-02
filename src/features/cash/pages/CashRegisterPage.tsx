import React, { useEffect, useState } from "react";
import { Plus, Calculator, ArrowUpDown, BarChart3 } from "lucide-react";
import { Button } from "../../../shared/components/ui/Button";
import { Modal } from "../../../shared/components/ui/Modal";
import { useAuth, useModal, useUI } from "../../../shared/hooks";
import { useCash } from "../stores/cashStore";
import {
  cashRegisterService,
  cashPaymentService,
  cashMovementService,
} from "../services/cashService";
import { SessionHeader } from "../components/SessionHeader";
import { OpenSessionForm } from "../components/OpenSessionForm";
import { CloseSessionForm } from "../components/CloseSessionForm";
import { CashPaymentForm } from "../components/CashPaymentForm";
import { CashMovementForm } from "../components/CashMovementForm";
import { SessionPaymentsList } from "../components/SessionPaymentsList";
import { SessionMovementsList } from "../components/SessionMovementsList";
import { USER_ROLES } from "../../../shared/constants";
import { PaymentForm } from "@/features/payments/components/PaymentForm";

const CashRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const {
    activeSession,
    hasActiveSession,
    isSessionOpen,
    setActiveSession,
    setSessionPayments,
    setSessionMovements,
    setLoading,
    updateSessionStats,
  } = useCash();
  const { showNotification } = useUI();
  const {
    isOpen: isOpenFormOpen,
    open: openOpenForm,
    close: closeOpenForm,
  } = useModal();
  const {
    isOpen: isCloseFormOpen,
    open: openCloseForm,
    close: closeCloseForm,
  } = useModal();
  const {
    isOpen: isPaymentFormOpen,
    open: openPaymentForm,
    close: closePaymentForm,
  } = useModal();
  const {
    isOpen: isMovementFormOpen,
    open: openMovementForm,
    close: closeMovementForm,
  } = useModal();

  // Charger la session active au démarrage
  useEffect(() => {
    loadActiveSession();
  }, []);

  // Charger les données de la session quand elle change

  const loadActiveSession = async () => {
    setLoading("session", true);
    try {
      const session = await cashRegisterService.getActiveSession();
      setActiveSession(session);
      setSessionMovements(session?.cashMovements);
      setSessionPayments(session?.payments);
      updateSessionStats();
    } catch (error: any) {
      console.error("Erreur lors du chargement de la session:", error);
    } finally {
      setLoading("session", false);
    }
  };
  // Vérifier les permissions
  if (
    !user ||
    ![USER_ROLES.SCHOOL_MANAGER, USER_ROLES.CASHIER].includes(user.role)
  ) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600">
          Seuls les gestionnaires d'école et les caissiers peuvent accéder à la
          caisse.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caisse</h1>
          <p className="text-gray-600">
            Gestion des sessions de caisse et enregistrement des paiements
          </p>
        </div>

        {/* Actions rapides */}
        {isSessionOpen && (
          <div className="flex space-x-2">
            <Button
              onClick={openPaymentForm}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Nouveau Paiement
            </Button>
            <Button
              variant="outline"
              onClick={openMovementForm}
              leftIcon={<ArrowUpDown className="h-4 w-4" />}
            >
              Mouvement Manuel
            </Button>
          </div>
        )}
      </div>

      {/* En-tête de session */}
      <SessionHeader
        onOpenSession={openOpenForm}
        onCloseSession={openCloseForm}
      />

      {/* Contenu principal */}
      {isSessionOpen && (
        <div className="grid grid-cols-1 gap-6">
          {/* Liste des paiements */}
          <SessionPaymentsList />
          {/* Liste des mouvements */}
          <SessionMovementsList />
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isOpenFormOpen}
        onClose={closeOpenForm}
        title="Ouvrir une Session de Caisse"
        size="md"
      >
        <OpenSessionForm
          onSuccess={() => {
            closeOpenForm();
            loadActiveSession();
          }}
          onCancel={closeOpenForm}
        />
      </Modal>

      <Modal
        isOpen={isCloseFormOpen}
        onClose={closeCloseForm}
        title="Fermer la Session de Caisse"
        size="lg"
      >
        <CloseSessionForm
          onSuccess={() => {
            closeCloseForm();
          }}
          onCancel={closeCloseForm}
        />
      </Modal>

      <Modal
        isOpen={isPaymentFormOpen}
        onClose={closePaymentForm}
        title="Nouveau Paiement"
        size="lg"
      >
        <PaymentForm
          onSuccess={() => {
            closeMovementForm();
            loadActiveSession();
            window.location.reload();
          }}
          onCancel={closeMovementForm}
        />
      </Modal>

      <Modal
        isOpen={isMovementFormOpen}
        onClose={closeMovementForm}
        title="Mouvement de Caisse Manuel"
        size="md"
      >
        <CashMovementForm
          onSuccess={() => {
            closeMovementForm();
            loadActiveSession();
          }}
          onCancel={closeMovementForm}
        />
      </Modal>
    </div>
  );
};

export { CashRegisterPage };
