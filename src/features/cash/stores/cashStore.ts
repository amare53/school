import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CashRegisterSession,
  Payment,
  CashMovement,
  PaymentMode,
} from "../../../shared/types/cash";

interface CashState {
  // Session active
  activeSession: CashRegisterSession | null;
  isSessionLoading: boolean;

  // Paiements de la session courante
  sessionPayments: Payment[];
  paymentsLoading: boolean;

  // Mouvements de la session courante
  sessionMovements: CashMovement[];
  movementsLoading: boolean;

  // Statistiques en temps réel
  sessionStats: {
    totalPayments: number;
    totalMovementsIn: number;
    totalMovementsOut: number;
    expectedBalance: number;
    paymentsByMode: Record<PaymentMode, number>;
    paymentsCount: number;
    movementsCount: number;
  };

  // Actions
  setActiveSession: (session: CashRegisterSession | null) => void;
  setSessionPayments: (payments: Payment[]) => void;
  setSessionMovements: (movements: CashMovement[]) => void;
  addPayment: (payment: Payment) => void;
  addMovement: (movement: CashMovement) => void;
  updateSessionStats: () => void;
  clearSession: () => void;
  setLoading: (
    type: "session" | "payments" | "movements",
    loading: boolean
  ) => void;
  hydrate: () => void;
}

export const useCashStore = create<CashState>()(
  persist(
    immer((set, get) => ({
      // État initial
      activeSession: null,
      isSessionLoading: false,
      sessionPayments: [],
      paymentsLoading: false,
      sessionMovements: [],
      movementsLoading: false,
      sessionStats: {
        totalPayments: 0,
        totalMovementsIn: 0,
        totalMovementsOut: 0,
        expectedBalance: 0,
        paymentsByMode: {
          cash: 0,
          mobile_money: 0,
          bank_transfer: 0,
          check: 0,
        },
        paymentsCount: 0,
        movementsCount: 0,
      },

      // Actions
      setActiveSession: (session) =>
        set((state) => {
          state.activeSession = session;
          if (!session) {
            state.sessionPayments = [];
            state.sessionMovements = [];
          }
          state.updateSessionStats();
        }),

      setSessionPayments: (payments) =>
        set((state) => {
          state.sessionPayments = payments;
          state.updateSessionStats();
        }),

      setSessionMovements: (movements) =>
        set((state) => {
          state.sessionMovements = movements;
          state.updateSessionStats();
        }),

      addPayment: (payment) =>
        set((state) => {
          state.sessionPayments.push(payment);
          state.updateSessionStats();
        }),

      addMovement: (movement) =>
        set((state) => {
          state.sessionMovements.push(movement);
          state.updateSessionStats();
        }),

      updateSessionStats: () =>
        set((state) => {
          const { activeSession, sessionPayments, sessionMovements } = state;

          if (!activeSession) {
            state.sessionStats = {
              totalPayments: 0,
              totalMovementsIn: 0,
              totalMovementsOut: 0,
              expectedBalance: 0,
              paymentsByMode: {
                cash: 0,
                mobile_money: 0,
                bank_transfer: 0,
                check: 0,
              },
              paymentsCount: 0,
              movementsCount: 0,
            };
            return;
          }

          // Calculer les totaux
          const totalPayments = sessionPayments.reduce(
            (sum, p) => sum + p.amount,
            0
          );

          const totalMovementsIn = sessionMovements
            .filter((m) => m.typeMovement === "in")
            .reduce((sum, m) => sum + parseInt(m.amount), 0);
          const totalMovementsOut = sessionMovements
            .filter((m) => m.typeMovement === "out")
            .reduce((sum, m) => sum + parseInt(m.amount), 0);

          // Calculer les paiements par mode
          const paymentsByMode = sessionPayments.reduce((acc, payment) => {
            acc[payment.paymentMethod] =
              (acc[payment.paymentMethod] || 0) + payment.amount;
            return acc;
          }, {} as Record<PaymentMode, number>);

          // Assurer que tous les modes sont présents
          const completePaymentsByMode: Record<PaymentMode, number> = {
            cash: paymentsByMode.cash || 0,
            mobile_money: paymentsByMode.mobile_money || 0,
            bank_transfer: paymentsByMode.bank_transfer || 0,
            check: paymentsByMode.check || 0,
          };

          // Calculer le solde attendu
          const expectedBalance =
            parseInt(activeSession.startingCashAmount) +
            totalPayments +
            totalMovementsIn -
            totalMovementsOut;

          state.sessionStats = {
            totalPayments,
            totalMovementsIn,
            totalMovementsOut,
            expectedBalance,
            paymentsByMode: completePaymentsByMode,
            paymentsCount: sessionPayments.length,
            movementsCount: sessionMovements.length,
          };
        }),

      clearSession: () =>
        set((state) => {
          state.activeSession = null;
          state.sessionPayments = [];
          state.sessionMovements = [];
          state.updateSessionStats();
        }),

      setLoading: (type, loading) =>
        set((state) => {
          switch (type) {
            case "session":
              state.isSessionLoading = loading;
              break;
            case "payments":
              state.paymentsLoading = loading;
              break;
            case "movements":
              state.movementsLoading = loading;
              break;
          }
        }),

      hydrate: () => {
        // Nettoyer le cache expiré au démarrage
        get().clearSession();
      },
    })),
    {
      name: "school-manager-cash-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSession: state.activeSession,
        sessionPayments: state.sessionPayments,
        sessionMovements: state.sessionMovements,
      }),
      onRehydrateStorage: () => (state) => {
        // Nettoyer le cache expiré après la réhydratation
        if (state) {
          // state.hydrate();
          // state.updateSessionStats();
        }
      },
    }
  )
);

// Hook pour faciliter l'utilisation
export const useCash = () => {
  const store = useCashStore();
  return {
    // État
    activeSession: store.activeSession,
    sessionPayments: store.sessionPayments,
    sessionMovements: store.sessionMovements,
    sessionStats: store.sessionStats,
    isSessionLoading: store.isSessionLoading,
    paymentsLoading: store.paymentsLoading,
    movementsLoading: store.movementsLoading,

    // Actions
    setActiveSession: store.setActiveSession,
    setSessionPayments: store.setSessionPayments,
    setSessionMovements: store.setSessionMovements,
    addPayment: store.addPayment,
    addMovement: store.addMovement,
    clearSession: store.clearSession,
    setLoading: store.setLoading,
    updateSessionStats: store.updateSessionStats,

    // Utilitaires
    hasActiveSession: !!store.activeSession,
    isSessionOpen: store.activeSession?.status === "in_progress",
    canRecordPayments: store.activeSession?.status === "in_progress",
  };
};
