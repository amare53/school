// Constantes globales de l'application

export const USER_ROLES = {
  PLATFORM_ADMIN: "ROLE_PLATFORM_ADMIN",
  SCHOOL_MANAGER: "ROLE_SCHOOL_MANAGER",
  CASHIER: "ROLE_CASHIER",
  ACCOUNTANT: "ROLE_ACCOUNTANT",
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.PLATFORM_ADMIN]: "Administrateur Plateforme",
  [USER_ROLES.SCHOOL_MANAGER]: "Admin d'École / Responsable",
  [USER_ROLES.CASHIER]: "Caissier",
  [USER_ROLES.ACCOUNTANT]: "Comptable",
};

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export const STUDENT_STATUS = {
  ACTIVE: "active",
  GRADUATED: "graduated",
  TRANSFERRED: "transferred",
  DROPPED_OUT: "dropped_out",
  ARCHIVED: "archived",
} as const;

export const STUDENT_STATUS_LABELS = {
  [STUDENT_STATUS.ACTIVE]: "Actif",
  [STUDENT_STATUS.GRADUATED]: "Diplômé",
  [STUDENT_STATUS.TRANSFERRED]: "Transféré",
  [STUDENT_STATUS.DROPPED_OUT]: "Abandonné",
  [STUDENT_STATUS.ARCHIVED]: "Archivé",
};

export const INVOICE_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
} as const;

export const INVOICE_STATUS_LABELS = {
  [INVOICE_STATUS.DRAFT]: "Brouillon",
  [INVOICE_STATUS.PENDING]: "En attente",
  [INVOICE_STATUS.PAID]: "Payée",
  [INVOICE_STATUS.OVERDUE]: "En retard",
  [INVOICE_STATUS.CANCELLED]: "Annulée",
};

export const PAYMENT_METHODS = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  CHECK: "check",
  MOBILE_MONEY: "mobile_money",
} as const;

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: "Espèces",
  [PAYMENT_METHODS.BANK_TRANSFER]: "Virement bancaire",
  [PAYMENT_METHODS.CHECK]: "Chèque",
  [PAYMENT_METHODS.MOBILE_MONEY]: "Mobile Money",
};

export const GENDER = {
  MALE: "male",
  FEMALE: "female",
} as const;

export const GENDER_LABELS = {
  [GENDER.MALE]: "Masculin",
  [GENDER.FEMALE]: "Féminin",
};

// Configuration de l'application
export const APP_CONFIG = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  APP_NAME: "SchoolManager Pro",
  VERSION: "1.0.0",
  ITEMS_PER_PAGE: 30,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FILE_TYPES: ["image/jpeg", "image/png", "application/pdf"],
  // Configuration API Platform
  API_PLATFORM_PAGINATION_ENABLED: true,
  API_PLATFORM_PAGINATION_CLIENT_ENABLED: true,
  API_PLATFORM_PAGINATION_ITEMS_PER_PAGE: 30,
  API_PLATFORM_PAGINATION_MAXIMUM_ITEMS_PER_PAGE: 100,
};

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    "Erreur de connexion. Veuillez vérifier votre connexion internet.",
  UNAUTHORIZED: "Vous n'êtes pas autorisé à effectuer cette action.",
  FORBIDDEN: "Accès refusé.",
  NOT_FOUND: "Ressource non trouvée.",
  VALIDATION_ERROR: "Erreur de validation des données.",
  SERVER_ERROR: "Erreur serveur. Veuillez réessayer plus tard.",
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite.",
};

// Messages de succès
export const SUCCESS_MESSAGES = {
  CREATED: "Élément créé avec succès.",
  UPDATED: "Élément mis à jour avec succès.",
  DELETED: "Élément supprimé avec succès.",
  ARCHIVED: "Élément archivé avec succès.",
  RESTORED: "Élément restauré avec succès.",
  SAVED: "Données sauvegardées avec succès.",
};

// Permissions par rôle
export const PERMISSIONS = {
  [USER_ROLES.PLATFORM_ADMIN]: [
    "platform:manage", // Gestion de la plateforme
    "schools:create",
    "schools:read",
    "schools:update",
    "schools:delete",
    "school_managers:create",
    "school_managers:read",
    "school_managers:update",
    "school_managers:delete",
    "reports:platform",
  ],
  [USER_ROLES.SCHOOL_MANAGER]: [
    "schools:read", // Peut voir ses écoles assignées
    "schools:update", // Peut modifier ses écoles assignées
    "academic:manage",
    "students:manage",
    "cashiers:create",
    "cashiers:read",
    "cashiers:update",
    "cashiers:delete",
    "accountants:create",
    "accountants:read",
    "accountants:update",
    "accountants:delete",
    "billing:configure",
    "reports:school",
    "settings:manage",
  ],
  [USER_ROLES.CASHIER]: [
    "school:read", // Peut voir son école uniquement
    "students:create",
    "students:read",
    "students:update",
    "invoices:create",
    "invoices:read",
    "invoices:update",
    "payments:create",
    "payments:read",
    "expenses:create",
    "expenses:read",
    "reports:financial",
  ],
  [USER_ROLES.ACCOUNTANT]: [
    "school:read", // Peut voir son école uniquement
    "accounting:read",
    "reports:accounting",
    "payments:read",
    "invoices:read",
    "expenses:read",
  ],
  [USER_ROLES.STUDENT]: [
    "profile:read",
    "invoices:read:own",
    "payments:read:own",
    "documents:read:own",
  ],
};

// Configuration des couleurs pour les statuts
export const STATUS_COLORS = {
  INVOICE: {
    [INVOICE_STATUS.DRAFT]: "bg-gray-100 text-gray-800",
    [INVOICE_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
    [INVOICE_STATUS.PAID]: "bg-green-100 text-green-800",
    [INVOICE_STATUS.OVERDUE]: "bg-red-100 text-red-800",
    [INVOICE_STATUS.CANCELLED]: "bg-gray-100 text-gray-800",
  },
  STUDENT: {
    [STUDENT_STATUS.ACTIVE]: "bg-green-100 text-green-800",
    [STUDENT_STATUS.GRADUATED]: "bg-blue-100 text-blue-800",
    [STUDENT_STATUS.TRANSFERRED]: "bg-orange-100 text-orange-800",
    [STUDENT_STATUS.DROPPED_OUT]: "bg-red-100 text-red-800",
    [STUDENT_STATUS.ARCHIVED]: "bg-gray-100 text-gray-800",
  },
  USER: {
    [USER_STATUS.ACTIVE]: "bg-green-100 text-green-800",
    [USER_STATUS.INACTIVE]: "bg-yellow-100 text-yellow-800",
    [USER_STATUS.ARCHIVED]: "bg-gray-100 text-gray-800",
  },
};
