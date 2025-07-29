// Types pour les actions du store
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

export interface AppActions {
  // Auth actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setCurrentSchool: (school: School | null) => void;
  login: (user: User, token: string, school?: School) => void;
  logout: () => void;

  // Students actions
  setStudents: (students: Student[], cacheKey?: string, filters?: Record<string, any>) => void;
  getStudentsFromCache: (cacheKey?: string, filters?: Record<string, any>) => Student[] | null;
  setStudentDetails: (student: Student) => void;
  getStudentFromCache: (studentId: string) => Student | null;
  addStudent: (student: Student) => void;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  removeStudent: (studentId: string) => void;

  // Payments actions
  setPayments: (payments: Payment[], cacheKey?: string, filters?: Record<string, any>) => void;
  getPaymentsFromCache: (cacheKey?: string, filters?: Record<string, any>) => Payment[] | null;
  addPayment: (payment: Payment) => void;
  updatePayment: (paymentId: string, updates: Partial<Payment>) => void;
  removePayment: (paymentId: string) => void;

  // Expenses actions
  setExpenses: (expenses: Expense[], cacheKey?: string, filters?: Record<string, any>) => void;
  getExpensesFromCache: (cacheKey?: string, filters?: Record<string, any>) => Expense[] | null;
  addExpense: (expense: Expense) => void;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  removeExpense: (expenseId: string) => void;

  // Fee types actions
  setFeeTypes: (feeTypes: FeeType[], schoolId: string) => void;
  getFeeTypesFromCache: (schoolId: string) => FeeType[] | null;
  addFeeType: (feeType: FeeType) => void;
  updateFeeType: (feeTypeId: string, updates: Partial<FeeType>) => void;
  removeFeeType: (feeTypeId: string) => void;

  // Academic structure actions
  setAcademicYears: (years: AcademicYear[], schoolId: string) => void;
  setLevels: (levels: Level[], schoolId: string) => void;
  setSections: (sections: Section[], schoolId: string) => void;
  setClasses: (classes: Class[], schoolId: string) => void;
  getAcademicDataFromCache: (type: string, schoolId: string) => any[] | null;

  // Accounting actions
  setAccountingEntries: (entries: AccountingEntry[], cacheKey?: string, filters?: Record<string, any>) => void;
  getAccountingEntriesFromCache: (cacheKey?: string, filters?: Record<string, any>) => AccountingEntry[] | null;
  addAccountingEntry: (entry: AccountingEntry) => void;

  // Schools actions (platform admin)
  setSchools: (schools: School[]) => void;
  getSchoolsFromCache: () => School[] | null;
  addSchool: (school: School) => void;
  updateSchool: (schoolId: string, updates: Partial<School>) => void;
  removeSchool: (schoolId: string) => void;

  // Search actions
  setSearchResults: (results: any[], query: string, filters?: Record<string, any>) => void;
  getSearchResultsFromCache: (query: string, filters?: Record<string, any>) => any[] | null;
  setSearchQuery: (query: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;

  // Cache management
  isCacheValid: (timestamp: number) => boolean;
  clearExpiredCache: () => void;
  clearAllCache: () => void;
  clearCacheByKey: (key: string) => void;
  getCacheStats: () => {
    studentsCount: number;
    paymentsCount: number;
    expensesCount: number;
    totalSize: number;
  };

  // UI actions
  setLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  getLoadingState: (key: string) => boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Error handling
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  getError: (key: string) => string | null;

  // Preferences
  updatePreferences: (newPreferences: Partial<AppState['preferences']>) => void;

  // Utility
  reset: () => void;
  hydrate: () => void;
}