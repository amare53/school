import { clsx, type ClassValue } from "clsx";
import { format, parseISO, isValid } from "date-fns";
import { fr } from "date-fns/locale";

// Utilitaire pour combiner les classes CSS
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Formatage des dates
export const formatDate = (
  date: string | Date,
  formatStr: string = "dd/MM/yyyy"
): string => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) return "";
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return "";
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, "dd/MM/yyyy HH:mm");
};

export const formatCurrency = (
  amount: number,
  currency: string = "CDF"
): string => {
  // Gestion des devises congolaises
  if (currency === "CDF") {
    return new Intl.NumberFormat("fr-CD", {
      style: "currency",
      currency: "CDF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Fallback pour XOF (Sénégal)
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utilitaires pour les chaînes de caractères
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Génération d'identifiants
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const generateStudentNumber = (
  schoolCode: string,
  year: number
): string => {
  const yearStr = year.toString().slice(-2);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `STD${schoolCode}${yearStr}${random}`;
};

export const generateInvoiceNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `FAC-${schoolCode}-${year}${month}-${random}`;
};

export const generatePaymentNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `PAY-${schoolCode}-${year}${month}-${random}`;
};

export const generateAccountingEntryNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ECR-${schoolCode}-${year}${month}-${random}`;
};

export const generateExpenseNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `DEP-${schoolCode}-${year}${month}-${random}`;
};

export const generateCashSessionNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const day = new Date().getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `CASH-${schoolCode}-${year}${month}${day}-${random}`;
};

export const generateCashMovementNumber = (schoolCode: string): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const day = new Date().getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `MOV-${schoolCode}-${year}${month}${day}-${random}`;
};

// Validation des données
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-()]{8,}$/;
  return phoneRegex.test(phone);
};

// Utilitaires pour les tableaux
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)];

  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};

// Utilitaires pour les objets
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) result[key] = obj[key];
  });
  return result;
};

// Utilitaires pour les fichiers
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
};

// Utilitaires pour les permissions
export const hasPermission = (
  userRole: string,
  permission: string,
  permissions: Record<string, string[]>
): boolean => {
  return permissions[userRole]?.includes(permission) || false;
};

export const canAccess = (
  userRole: string,
  requiredRoles: string[]
): boolean => {
  return requiredRoles.includes(userRole);
};

// Utilitaires pour les erreurs
export const getErrorMessage = (error: any): string => {
  if (typeof error === "string") return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return "Une erreur inattendue s'est produite";
};

// Utilitaires pour les URLs
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          searchParams.append(`${key}[]`, String(item));
        });
      } else if (typeof value === "object" && value !== null) {
        // Gestion des objets (comme order[property]=direction)
        Object.entries(value).forEach(([subKey, subValue]) => {
          searchParams.append(`${key}[${subKey}]`, String(subValue));
        });
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return searchParams.toString();
};

// Utilitaires spécifiques à API Platform
export const apiPlatformUtils = {
  // Extraire l'ID depuis l'IRI API Platform
  extractIdFromIri: (iri: string): string => {
    const parts = iri.split("/");
    return parts[parts.length - 1];
  },

  // Construire une IRI depuis un ID
  buildIri: (resource: string, id: string): string => {
    return `/api/${resource}/${id}`;
  },

  // Normaliser les données API Platform pour l'affichage
  normalizeApiPlatformData: <T>(data: any): T => {
    if (!data) return data;

    // Supprimer les propriétés API Platform pour l'affichage
    const {
      "@context": context,
      "@id": id,
      "@type": type,
      ...cleanData
    } = data;

    // Normaliser les relations (IRIs vers objets)
    Object.keys(cleanData).forEach((key) => {
      const value = cleanData[key];
      if (typeof value === "string" && value.startsWith("/api/")) {
        // C'est une IRI, extraire l'ID
        cleanData[key] = apiPlatformUtils.extractIdFromIri(value);
      } else if (Array.isArray(value)) {
        // Normaliser les tableaux
        cleanData[key] = value.map((item) =>
          typeof item === "object"
            ? apiPlatformUtils.normalizeApiPlatformData(item)
            : item
        );
      } else if (typeof value === "object" && value !== null) {
        // Normaliser les objets imbriqués
        cleanData[key] = apiPlatformUtils.normalizeApiPlatformData(value);
      }
    });

    return cleanData as T;
  },

  // Construire les paramètres de filtrage API Platform
  buildApiPlatformFilters: (
    filters: Record<string, any>
  ): Record<string, any> => {
    const apiFilters: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        // Gestion des filtres de date
        if (key.endsWith("From")) {
          const property = key.replace("From", "");
          apiFilters[`${property}[after]`] = value;
        } else if (key.endsWith("To")) {
          const property = key.replace("To", "");
          apiFilters[`${property}[before]`] = value;
        } else if (key === "search") {
          // Recherche textuelle globale
          apiFilters["search"] = value;
        } else if (key.includes(".")) {
          // Filtres sur relations (ex: student.status)
          apiFilters[key] = value;
        } else {
          // Filtres directs
          apiFilters[key] = value;
        }
      }
    });

    return apiFilters;
  },

  // Construire les paramètres de tri API Platform
  buildApiPlatformSort: (
    sortBy: string,
    direction: "asc" | "desc"
  ): Record<string, any> => {
    return {
      order: {
        [sortBy]: direction,
      },
    };
  },

  // Gérer les erreurs de validation API Platform
  handleApiPlatformValidationError: (error: any): Record<string, string> => {
    const fieldErrors: Record<string, string> = {};

    if (error.response?.data?.violations) {
      error.response.data.violations.forEach((violation: any) => {
        fieldErrors[violation.propertyPath] = violation.message;
      });
    }

    return fieldErrors;
  },
};

// Utilitaires pour le localStorage
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },

  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  },
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Fonction pour obtenir le nom complet du niveau depuis le code
export const getCongoSections = () => {
  return [
    {
      code: "MAT",
      name: "Maternel",
      description: "Petite, moyenne et grande section (3-6 ans)",
    },
    {
      code: "PRI",
      name: "Primaire",
      description: "CP, CE1, CE2, CM1, CM2 (6-11 ans)",
    },
    {
      code: "SEC",
      name: "Secondaire",
      description: "6ème à Terminale (12-18 ans)",
    },
  ];
};
