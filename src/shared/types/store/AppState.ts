// Types pour l'état de l'application
import type { 
  User, 
  School, 
  Student,
  Payment,
  Expense,
  FeeType,
  AcademicYear,
  Level,
  Section,
  Class,
  AccountingEntry,
  Notification
} from '../index';

export interface AppState {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  currentSchool: School | null;

  // Students cache
  students: Student[];
  studentsCache: Record<string, {
    data: Student[];
    timestamp: number;
    filters: Record<string, any>;
  }>;
  studentDetails: Record<string, {
    data: Student;
    timestamp: number;
  }>;

  // Payments cache
  payments: Payment[];
  paymentsCache: Record<string, {
    data: Payment[];
    timestamp: number;
    filters: Record<string, any>;
  }>;

  // Expenses cache
  expenses: Expense[];
  expensesCache: Record<string, {
    data: Expense[];
    timestamp: number;
    filters: Record<string, any>;
  }>;

  // Fee types cache
  feeTypes: FeeType[];
  feeTypesCache: Record<string, {
    data: FeeType[];
    timestamp: number;
  }>;

  // Academic structure cache
  academicYears: AcademicYear[];
  levels: Level[];
  sections: Section[];
  classes: Class[];
  academicCache: Record<string, {
    data: any[];
    timestamp: number;
  }>;

  // Accounting entries cache
  accountingEntries: AccountingEntry[];
  accountingCache: Record<string, {
    data: AccountingEntry[];
    timestamp: number;
    filters: Record<string, any>;
  }>;

  // Schools cache (for platform admin)
  schools: School[];
  schoolsCache: {
    data: School[];
    timestamp: number;
  } | null;

  // Search cache
  searchCache: Record<string, {
    data: any[];
    timestamp: number;
    filters: Record<string, any>;
  }>;

  // UI State
  isLoading: boolean;
  loadingStates: Record<string, boolean>;
  searchQuery: string;
  searchResults: any[];
  recentSearches: string[];

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;

  // Sidebar
  sidebarOpen: boolean;

  // Cache settings
  cacheSettings: {
    ttl: number; // Time to live in milliseconds
    maxCacheSize: number;
  };

  // User preferences
  preferences: {
    currency: 'CDF' | 'USD';
    language: 'fr' | 'en';
    theme: 'light' | 'dark';
    itemsPerPage: number;
    dateFormat: string;
  };

  // Error handling
  errors: Record<string, string | null>;
}