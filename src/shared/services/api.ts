import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { APP_CONFIG, ERROR_MESSAGES } from "../constants";
import { useAppStore } from "../stores";
import { User } from "../types";

// Configuration de base d'Axios pour Symfony API Platform
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: APP_CONFIG.API_BASE_URL,
    timeout: 30000,
    headers: {
      "Content-Type": "application/ld+json",
      Accept: "application/ld+json",
    },
  });

  // Intercepteur de requête pour ajouter le token d'authentification
  instance.interceptors.request.use(
    (config) => {
      const { authToken } = useAppStore.getState();
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur de réponse pour gérer les erreurs et la pagination API Platform
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      const { response } = error;

      if (response?.status === 401) {
        // Token expiré ou invalide
        const { logout } = useAppStore.getState();
        logout();
        if (window.location.pathname !== "/login") {
          // window.location.href = "/login";
        }

        return Promise.reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
      }

      if (response?.status === 403) {
        return Promise.reject(new Error(ERROR_MESSAGES.FORBIDDEN));
      }

      if (response?.status === 404) {
        return Promise.reject(new Error(ERROR_MESSAGES.NOT_FOUND));
      }

      if (response?.status >= 500) {
        return Promise.reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
      }

      if (!response) {
        return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
      }

      // Erreur de validation API Platform
      if (response.status === 422 && response.data?.violations) {
        const violations = response.data.violations;
        const message = violations
          .map((v: any) => `${v.propertyPath}: ${v.message}`)
          .join(", ");
        return Promise.reject(new Error(message));
      }

      // Erreur de validation ou autre erreur client
      const message =
        response.data?.["description"] ||
        response.data?.message ||
        ERROR_MESSAGES.UNKNOWN_ERROR;
      return Promise.reject(new Error(message));
    }
  );

  return instance;
};

// Instance API principale
export const api = createApiInstance();

// Types pour les réponses API Platform
export interface ApiPlatformResponse<T = any> {
  "@context": string;
  "@id": string;
  "@type": string;
  member: T[];
  totalItems: number;
  view?: {
    "@id": string;
    "@type": string;
    first?: string;
    last?: string;
    previous?: string;
    next?: string;
  };
  search?: {
    "@type": string;
    template: string;
    variableRepresentation: string;
    mapping: Array<{
      "@type": string;
      variable: string;
      property: string;
      required: boolean;
    }>;
  };
}

export interface ApiPlatformItem<T = any> {
  "@id": string;
  "@type": string;
  id: string;
  [key: string]: any;
}

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  order?: Record<string, "asc" | "desc">;
  [key: string]: any; // Pour les filtres personnalisés
}

// Classe de service API de base pour API Platform
export class BaseApiService {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // GET - Collection avec pagination et filtres API Platform
  async getCollection<T>(
    params: PaginationParams = {}
  ): Promise<ApiPlatformResponse<T>> {
    const queryParams = this.buildQueryParams(params);
    const response = await api.get(`${this.endpoint}${queryParams}`);
    return response.data;
  }

  // GET - Élément par ID
  async getItem<T>(id: string): Promise<ApiPlatformItem<T>> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  // POST - Créer un nouvel élément
  async create<T>(data: Partial<T>): Promise<ApiPlatformItem<T>> {
    const response = await api.post(this.endpoint, data);
    return response.data;
  }

  // PUT - Mettre à jour un élément complet
  async update<T>(id: string, data: Partial<T>): Promise<ApiPlatformItem<T>> {
    const response = await api.put(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  // PATCH - Mise à jour partielle (recommandé pour API Platform)
  async patch<T>(id: string, data: Partial<T>): Promise<ApiPlatformItem<T>> {
    const response = await api.patch(`${this.endpoint}/${id}`, data, {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    });
    return response.data;
  }

  // DELETE - Supprimer un élément
  async delete(id: string): Promise<void> {
    await api.delete(`${this.endpoint}/${id}`);
  }

  // Recherche avec filtres API Platform
  async search<T>(
    searchParams: Record<string, any>
  ): Promise<ApiPlatformResponse<T>> {
    const queryParams = this.buildQueryParams(searchParams);
    const response = await api.get(`${this.endpoint}${queryParams}`);
    return response.data;
  }

  // Construction des paramètres de requête pour API Platform
  private buildQueryParams(params: Record<string, any>) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (key === "order" && typeof value === "object") {
          // Gestion du tri API Platform : order[property]=asc|desc
          Object.entries(value).forEach(([prop, direction]) => {
            searchParams.append(`order[${prop}]`, direction as string);
          });
        } else if (Array.isArray(value)) {
          // Gestion des tableaux
          value.forEach((item) => {
            searchParams.append(`${key}[]`, String(item));
          });
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }
}

// Services API spécialisés pour API Platform
export class AuthApiService {
  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    const response = await api.post("/auth/login", {
      username: email,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post("/auth/refresh");
    return response.data;
  }

  async getMe(): Promise<any> {
    const response = await api.get("/auth/me");
    return response.data;
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.patch("/auth/change-password", {
      currentPassword,
      newPassword,
    });
  }
}

export class StudentsApiService extends BaseApiService {
  constructor() {
    super("/students");
  }

  // Recherche d'élèves avec filtres spécifiques
  async searchStudents(params: {
    search?: string;
    status?: string;
    section?: string;
    academicYear?: string;
    page?: number;
    itemsPerPage?: number;
    order?: Record<string, "asc" | "desc">;
  }): Promise<ApiPlatformResponse<any>> {
    const searchParams: Record<string, any> = {};

    // Recherche textuelle (nom, prénom, numéro)
    if (params.search) {
      searchParams["search"] = params.search;
    }

    // Filtres spécifiques
    if (params.status) {
      searchParams["status"] = params.status;
    }

    if (params.section) {
      searchParams["enrollments.schoolClass.section.id"] = params.section;
    }

    if (params.academicYear) {
      searchParams["enrollments.academicYear.id"] = params.academicYear;
    }

    // Pagination
    if (params.page) {
      searchParams["page"] = params.page;
    }

    if (params.itemsPerPage) {
      searchParams["itemsPerPage"] = params.itemsPerPage;
    }

    // Tri
    if (params.order) {
      searchParams["order"] = params.order;
    }

    return await this.search(searchParams);
  }

  // Obtenir les paiements d'un élève
  async getStudentPayments(
    studentId: string,
    params: PaginationParams = {}
  ): Promise<ApiPlatformResponse<any>> {
    const queryParams = this.buildQueryParams({
      "student.id": studentId,
      ...params,
    });
    const response = await api.get(`/payments${queryParams}`);
    return response.data;
  }

  // GET - Élément par ID
  async getItem<T>(id: string): Promise<ApiPlatformItem<T>> {
    const response = await api.get(`${this.endpoint}/${id}`);
    return response.data;
  }

  static QueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
  }
}

export class PaymentsApiService extends BaseApiService {
  constructor() {
    super("/payments");
  }

  // Recherche de paiements avec filtres
  async searchPayments(params: {
    search?: string;
    paymentMethod?: string;
    feeType?: string;
    dateFrom?: string;
    dateTo?: string;
    student?: string;
    page?: number;
    itemsPerPage?: number;
    order?: Record<string, "asc" | "desc">;
  }): Promise<ApiPlatformResponse<any>> {
    const searchParams: Record<string, any> = {};

    // Recherche textuelle
    if (params.search) {
      searchParams["search"] = params.search;
    }

    // Filtres spécifiques
    if (params.paymentMethod) {
      searchParams["paymentMethod"] = params.paymentMethod;
    }

    if (params.feeType) {
      searchParams["feeType.id"] = params.feeType;
    }

    if (params.student) {
      searchParams["student.id"] = params.student;
    }

    // Filtres de date
    if (params.dateFrom) {
      searchParams["paymentDate[after]"] = params.dateFrom;
    }

    if (params.dateTo) {
      searchParams["paymentDate[before]"] = params.dateTo;
    }

    // Pagination et tri
    if (params.page) searchParams["page"] = params.page;
    if (params.itemsPerPage) searchParams["itemsPerPage"] = params.itemsPerPage;
    if (params.order) searchParams["order"] = params.order;

    return this.search(searchParams);
  }

  // Générer un reçu de paiement
  async generateReceipt(paymentId: string): Promise<Blob> {
    const response = await api.get(`${this.endpoint}/${paymentId}/receipt`, {
      responseType: "blob",
    });
    return response.data;
  }
}

export class ExpensesApiService extends BaseApiService {
  constructor() {
    super("/expenses");
  }

  // Recherche de dépenses avec filtres
  async searchExpenses(params: {
    search?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    hasReceipt?: boolean;
    page?: number;
    itemsPerPage?: number;
    order?: Record<string, "asc" | "desc">;
  }): Promise<ApiPlatformResponse<any>> {
    const searchParams: Record<string, any> = {};

    if (params.search) {
      searchParams["search"] = params.search;
    }

    if (params.category) {
      searchParams["category"] = params.category;
    }

    if (params.dateFrom) {
      searchParams["expenseDate[after]"] = params.dateFrom;
    }

    if (params.dateTo) {
      searchParams["expenseDate[before]"] = params.dateTo;
    }

    if (params.hasReceipt !== undefined) {
      searchParams["hasReceipt"] = params.hasReceipt;
    }

    if (params.page) searchParams["page"] = params.page;
    if (params.itemsPerPage) searchParams["itemsPerPage"] = params.itemsPerPage;
    if (params.order) searchParams["order"] = params.order;

    return this.search(searchParams);
  }

  // Upload de justificatif
  async uploadReceipt(
    expenseId: string,
    file: File
  ): Promise<{ receiptUrl: string }> {
    const formData = new FormData();
    formData.append("receipt", file);

    const response = await api.post(
      `${this.endpoint}/${expenseId}/receipt`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  }
}

export class ReportsApiService {
  // Rapports avec filtres API Platform
  async getDashboardStats(
    params: {
      dateFrom?: string;
      dateTo?: string;
      academicYear?: string;
    } = {}
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(
      `/reports/dashboard?${queryParams.toString()}`
    );
    return response.data;
  }

  async getFinancialReport(
    params: {
      period?: string;
      dateFrom?: string;
      dateTo?: string;
      groupBy?: string;
    } = {}
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(
      `/reports/financial?${queryParams.toString()}`
    );
    return response.data;
  }

  async getStudentsReport(
    params: {
      groupBy?: string;
      status?: string;
      section?: string;
      academicYear?: string;
    } = {}
  ): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(
      `/reports/students?${queryParams.toString()}`
    );
    return response.data;
  }

  async getAccountingReport(params: {
    type: "balance_sheet" | "income_statement" | "trial_balance" | "cash_flow";
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });

    const response = await api.get(
      `/reports/accounting?${queryParams.toString()}`
    );
    return response.data;
  }

  async getClassPaymentReport(params: {
    schoolClass: string;
    month: number;
    academicYear: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });

    const response = await api.get(
      `/reports/payments?${queryParams.toString()}`
    );
    return response.data;
  }

  // Export de rapports
  async exportReports(params: {
    reports: string[];
    format: "pdf" | "excel" | "csv";
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Blob> {
    const response = await api.post("/reports/export", params, {
      responseType: "blob",
    });
    return response.data;
  }
}

// Instances des services
export const authApi = new AuthApiService();
export const studentsApi = new StudentsApiService();
export const usersApi = new BaseApiService("/users");
export const schoolsApi = new BaseApiService("/schools");
export const academicYearsApi = new BaseApiService("/academic_years");
export const sectionsApi = new BaseApiService("/sections");
export const classesApi = new BaseApiService("/school_classes");
export const paymentsApi = new PaymentsApiService();
export const feeTypesApi = new BaseApiService("/fee_types");
export const expensesApi = new ExpensesApiService();
export const accountingEntriesApi = new BaseApiService("/accounting_entries");
export const enrollmentApi = new BaseApiService("/enrollments");
export const reportsApi = new ReportsApiService();

// Utilitaires pour les appels API Platform
export const apiPlatformUtils = {
  // Extraire les données de la réponse API Platform
  extractItems: <T>(response: ApiPlatformResponse<T>): T[] => {
    return response["member"] || [];
  },

  // Extraire les informations de pagination
  extractPagination: (response: ApiPlatformResponse<any>) => {
    const view = response["view"];
    const totalItems = response["totalItems"];

    return {
      totalItems,
      hasNext: !!view?.["next"],
      hasPrevious: !!view?.["previous"],
      firstPage: view?.["first"],
      lastPage: view?.["last"],
      nextPage: view?.["next"],
      previousPage: view?.["previous"],
    };
  },

  // Construire les paramètres de recherche API Platform
  buildSearchParams: (params: Record<string, any>): Record<string, any> => {
    const apiParams: Record<string, any> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Gestion des filtres de date
        if (key.endsWith("From")) {
          const property = key.replace("From", "");
          apiParams[`${property}[after]`] = value;
        } else if (key.endsWith("To")) {
          const property = key.replace("To", "");
          apiParams[`${property}[before]`] = value;
        } else if (key === "search") {
          // Recherche textuelle globale
          apiParams["search"] = value;
        } else if (key === "order") {
          // Tri
          apiParams["order"] = value;
        } else {
          // Filtres directs
          apiParams[key] = value;
        }
      }
    });

    return apiParams;
  },

  // Gestion des erreurs avec retry pour API Platform
  async withRetry<T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error as Error;

        // Ne pas retry sur les erreurs 4xx (sauf 429)
        if (
          error instanceof Error &&
          error.message.includes("4") &&
          !error.message.includes("429")
        ) {
          throw error;
        }

        if (i < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delay * Math.pow(2, i))
          );
        }
      }
    }

    throw lastError!;
  },

  // Upload de fichiers pour API Platform
  async uploadFile(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const response = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Download de fichiers depuis API Platform
  async downloadFile(url: string, filename: string): Promise<void> {
    const response = await api.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadUrl);
  },
};
