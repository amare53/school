import { api, BaseApiService } from "../../../shared/services/api";
import type {
  CashRegisterSession,
  Payment,
  CashMovement,
  CashRegisterReport,
  DailyCashReport,
} from "../../../shared/types/cash";

export class CashRegisterService extends BaseApiService {
  constructor() {
    super("/cash-register");
  }

  // Ouvrir une nouvelle session
  async openSession(data: {
    openingBalance: number;
    notes?: string;
  }): Promise<CashRegisterSession> {
    const response = await api.post(`${this.endpoint}/open-session`, data);
    return response.data;
  }

  // Fermer une session
  async closeSession(
    sessionId: string,
    data: {
      actualClosingBalance: number;
      notes?: string;
    }
  ): Promise<CashRegisterSession> {
    const response = await api.patch(
      `${this.endpoint}/close-session/${sessionId}`,
      data
    );
    return response.data;
  }

  // Obtenir la session active du caissier
  async getActiveSession(): Promise<CashRegisterSession | null> {
    try {
      const response = await api.get(`${this.endpoint}/current-session`);
      if ("session" in response.data) {
        if (response.data.session == null) {
          return null;
        }
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Obtenir les détails d'une session
  async getSessionDetails(sessionId: string): Promise<CashRegisterSession> {
    const response = await api.get(`${this.endpoint}/${sessionId}/details`);
    return response.data;
  }

  // Obtenir le rapport d'une session
  async getSessionReport(sessionId: string): Promise<CashRegisterReport> {
    const response = await api.get(`${this.endpoint}/${sessionId}/report`);
    return response.data;
  }
}

export class CashPaymentService extends BaseApiService {
  constructor() {
    super("/cash-register");
  }

  // Enregistrer un paiement
  async recordPayment(data: {
    studentId: string;
    amount: number;
    paymentMode: string;
    feeTypeId: string;
    reference?: string;
    notes?: string;
  }): Promise<Payment> {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  // Obtenir les paiements d'une session
  async getSessionPayments(sessionId: string): Promise<Payment[]> {
    const response = await api.get(`${this.endpoint}?session=${sessionId}`);
    return response.data.member || [];
  }
}

export class CashMovementService extends BaseApiService {
  constructor() {
    super("/cash_movements");
  }

  // Enregistrer un mouvement de caisse
  async recordMovement(data: {
    type: "in" | "out";
    amount: number;
    reason: string;
    description?: string;
    cashRegisterSession: string;
    school: string;
    createdBy: string;
  }): Promise<CashMovement> {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  // Obtenir les mouvements d'une session
  async getSessionMovements(sessionId: string): Promise<CashMovement[]> {
    const response = await api.get(`${this.endpoint}?session=${sessionId}`);
    return response.data.member || [];
  }
}

export class CashReportService {
  // Rapport journalier
  async getDailyReport(date: string): Promise<DailyCashReport> {
    const response = await api.get(`/cash-register/daily-report?date=${date}`);
    return response.data;
  }

  // Rapport par période
  async getPeriodReport(params: {
    dateFrom: string;
    dateTo: string;
    cashierId?: string;
  }): Promise<DailyCashReport[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(
      `/cash-register/range-daily-report?${queryParams.toString()}`
    );
    return response.data;
  }

  // Exporter un rapport de session
  async exportSessionReport(
    sessionId: string,
    format: "pdf" | "excel"
  ): Promise<Blob> {
    const response = await api.get(
      `/cash_reports/session/${sessionId}/export?format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  }
}

// Instances des services
export const cashRegisterService = new CashRegisterService();
export const cashPaymentService = new CashPaymentService();
export const cashMovementService = new CashMovementService();
export const cashReportService = new CashReportService();
