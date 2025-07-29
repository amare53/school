import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AppState } from "../types/store/AppState";
import { AppActions } from "../types/store/AppActions";
import type { Notification } from "../types";

const initialState: AppState = {
  // Authentication
  user: null,
  isAuthenticated: false,
  authToken: null,
  currentSchool: null,

  // Students cache
  students: [],
  studentsCache: {},
  studentDetails: {},

  // Payments cache
  payments: [],
  paymentsCache: {},

  // Expenses cache
  expenses: [],
  expensesCache: {},

  // Fee types cache
  feeTypes: [],
  feeTypesCache: {},

  // Academic structure cache
  academicYears: [],
  levels: [],
  sections: [],
  classes: [],
  academicCache: {},

  // Accounting entries cache
  accountingEntries: [],
  accountingCache: {},

  // Schools cache
  schools: [],
  schoolsCache: null,

  // Search cache
  searchCache: {},

  // UI State
  isLoading: false,
  loadingStates: {},
  searchQuery: "",
  searchResults: [],
  recentSearches: [],

  // Notifications
  notifications: [],
  unreadNotificationsCount: 0,

  // Sidebar
  sidebarOpen: true,

  // Cache settings (5 minutes TTL par défaut)
  cacheSettings: {
    ttl: 5 * 60 * 1000,
    maxCacheSize: 50,
  },

  // User preferences
  preferences: {
    currency: "CDF",
    language: "fr",
    theme: "light",
    itemsPerPage: 30,
    dateFormat: "dd/MM/yyyy",
  },

  // Error handling
  errors: {},
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Auth actions
      setUser: (user) =>
        set((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
        }),

      setAuthToken: (token) =>
        set((state) => {
          state.authToken = token;
        }),

      setCurrentSchool: (school) =>
        set((state) => {
          state.currentSchool = school;
        }),

      login: (user, token, school) =>
        set((state) => {
          state.user = user;
          state.authToken = token;
          state.isAuthenticated = true;
          if (school) {
            state.currentSchool = school;
          }
        }),

      logout: () =>
        set((state) => {
          state.user = null;
          state.authToken = null;
          state.isAuthenticated = false;
          state.currentSchool = null;
          // Garder le cache mais vider les données sensibles
          state.students = [];
          state.payments = [];
          state.expenses = [];
        }),

      // Students actions avec cache intelligent
      setStudents: (students, cacheKey = "default", filters = {}) =>
        set((state) => {
          const now = Date.now();

          // Nettoyer le cache si trop d'entrées
          const cacheKeys = Object.keys(state.studentsCache);
          if (cacheKeys.length >= state.cacheSettings.maxCacheSize) {
            const sortedKeys = cacheKeys.sort(
              (a, b) =>
                state.studentsCache[a].timestamp -
                state.studentsCache[b].timestamp
            );
            const keysToRemove = sortedKeys.slice(
              0,
              Math.floor(state.cacheSettings.maxCacheSize / 2)
            );
            keysToRemove.forEach((key) => delete state.studentsCache[key]);
          }

          state.students = students;
          state.studentsCache[cacheKey] = {
            data: students,
            timestamp: now,
            filters,
          };
        }),

      getStudentsFromCache: (cacheKey = "default", filters = {}) => {
        const state = get();
        const cached = state.studentsCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        // Vérifier si les filtres correspondent
        const filtersMatch =
          JSON.stringify(cached.filters || {}) === JSON.stringify(filters);
        if (!filtersMatch) {
          return null;
        }

        return cached.data;
      },

      setStudentDetails: (student) =>
        set((state) => {
          const now = Date.now();
          state.studentDetails[student.id] = {
            data: student,
            timestamp: now,
          };
        }),

      getStudentFromCache: (studentId) => {
        const state = get();
        const cached = state.studentDetails[studentId];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        return cached.data;
      },

      addStudent: (student) =>
        set((state) => {
          state.students.push(student);
          // Invalider le cache pour forcer le rechargement
          state.studentsCache = {};
        }),

      updateStudent: (studentId, updates) =>
        set((state) => {
          const index = state.students.findIndex((s) => s.id === studentId);
          if (index !== -1) {
            Object.assign(state.students[index], updates);
          }
          // Mettre à jour le cache des détails
          if (state.studentDetails[studentId]) {
            Object.assign(state.studentDetails[studentId].data, updates);
          }
        }),

      removeStudent: (studentId) =>
        set((state) => {
          state.students = state.students.filter((s) => s.id !== studentId);
          delete state.studentDetails[studentId];
          // Invalider le cache
          state.studentsCache = {};
        }),

      // Payments actions avec cache intelligent
      setPayments: (payments, cacheKey = "default", filters = {}) =>
        set((state) => {
          const now = Date.now();

          // Nettoyer le cache si nécessaire
          const cacheKeys = Object.keys(state.paymentsCache);
          if (cacheKeys.length >= state.cacheSettings.maxCacheSize) {
            const sortedKeys = cacheKeys.sort(
              (a, b) =>
                state.paymentsCache[a].timestamp -
                state.paymentsCache[b].timestamp
            );
            const keysToRemove = sortedKeys.slice(
              0,
              Math.floor(state.cacheSettings.maxCacheSize / 2)
            );
            keysToRemove.forEach((key) => delete state.paymentsCache[key]);
          }

          state.payments = payments;
          state.paymentsCache[cacheKey] = {
            data: payments,
            timestamp: now,
            filters,
          };
        }),

      getPaymentsFromCache: (cacheKey = "default", filters = {}) => {
        const state = get();
        const cached = state.paymentsCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        const filtersMatch =
          JSON.stringify(cached.filters || {}) === JSON.stringify(filters);
        if (!filtersMatch) {
          return null;
        }

        return cached.data;
      },

      addPayment: (payment) =>
        set((state) => {
          state.payments.unshift(payment); // Ajouter au début pour les plus récents
          // Invalider le cache
          state.paymentsCache = {};
        }),

      updatePayment: (paymentId, updates) =>
        set((state) => {
          const index = state.payments.findIndex((p) => p.id === paymentId);
          if (index !== -1) {
            Object.assign(state.payments[index], updates);
          }
        }),

      removePayment: (paymentId) =>
        set((state) => {
          state.payments = state.payments.filter((p) => p.id !== paymentId);
          state.paymentsCache = {};
        }),

      // Expenses actions avec cache intelligent
      setExpenses: (expenses, cacheKey = "default", filters = {}) =>
        set((state) => {
          const now = Date.now();

          const cacheKeys = Object.keys(state.expensesCache);
          if (cacheKeys.length >= state.cacheSettings.maxCacheSize) {
            const sortedKeys = cacheKeys.sort(
              (a, b) =>
                state.expensesCache[a].timestamp -
                state.expensesCache[b].timestamp
            );
            const keysToRemove = sortedKeys.slice(
              0,
              Math.floor(state.cacheSettings.maxCacheSize / 2)
            );
            keysToRemove.forEach((key) => delete state.expensesCache[key]);
          }

          state.expenses = expenses;
          state.expensesCache[cacheKey] = {
            data: expenses,
            timestamp: now,
            filters,
          };
        }),

      getExpensesFromCache: (cacheKey = "default", filters = {}) => {
        const state = get();
        const cached = state.expensesCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        const filtersMatch =
          JSON.stringify(cached.filters || {}) === JSON.stringify(filters);
        if (!filtersMatch) {
          return null;
        }

        return cached.data;
      },

      addExpense: (expense) =>
        set((state) => {
          state.expenses.unshift(expense);
          state.expensesCache = {};
        }),

      updateExpense: (expenseId, updates) =>
        set((state) => {
          const index = state.expenses.findIndex((e) => e.id === expenseId);
          if (index !== -1) {
            Object.assign(state.expenses[index], updates);
          }
        }),

      removeExpense: (expenseId) =>
        set((state) => {
          state.expenses = state.expenses.filter((e) => e.id !== expenseId);
          state.expensesCache = {};
        }),

      // Fee types actions
      setFeeTypes: (feeTypes, schoolId) =>
        set((state) => {
          const now = Date.now();
          state.feeTypes = feeTypes;
          state.feeTypesCache[schoolId] = {
            data: feeTypes,
            timestamp: now,
          };
        }),

      getFeeTypesFromCache: (schoolId) => {
        const state = get();
        const cached = state.feeTypesCache[schoolId];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        return cached.data;
      },

      addFeeType: (feeType) =>
        set((state) => {
          state.feeTypes.push(feeType);
          // Invalider le cache pour cette école
          if (feeType.schoolId && state.feeTypesCache[feeType.schoolId]) {
            delete state.feeTypesCache[feeType.schoolId];
          }
        }),

      updateFeeType: (feeTypeId, updates) =>
        set((state) => {
          const index = state.feeTypes.findIndex((f) => f.id === feeTypeId);
          if (index !== -1) {
            Object.assign(state.feeTypes[index], updates);
          }
        }),

      removeFeeType: (feeTypeId) =>
        set((state) => {
          const feeType = state.feeTypes.find((f) => f.id === feeTypeId);
          state.feeTypes = state.feeTypes.filter((f) => f.id !== feeTypeId);
          // Invalider le cache
          if (feeType?.schoolId && state.feeTypesCache[feeType.schoolId]) {
            delete state.feeTypesCache[feeType.schoolId];
          }
        }),

      // Academic structure actions
      setAcademicYears: (years, schoolId) =>
        set((state) => {
          const now = Date.now();
          state.academicYears = years;
          state.academicCache[`years_${schoolId}`] = {
            data: years,
            timestamp: now,
          };
        }),

      setLevels: (levels, schoolId) =>
        set((state) => {
          const now = Date.now();
          state.levels = levels;
          state.academicCache[`levels_${schoolId}`] = {
            data: levels,
            timestamp: now,
          };
        }),

      setSections: (sections, schoolId) =>
        set((state) => {
          const now = Date.now();
          state.sections = sections;
          state.academicCache[`sections_${schoolId}`] = {
            data: sections,
            timestamp: now,
          };
        }),

      setClasses: (classes, schoolId) =>
        set((state) => {
          const now = Date.now();
          state.classes = classes;
          state.academicCache[`classes_${schoolId}`] = {
            data: classes,
            timestamp: now,
          };
        }),

      getAcademicDataFromCache: (type, schoolId) => {
        const state = get();
        const cacheKey = `${type}_${schoolId}`;
        const cached = state.academicCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        return cached.data;
      },

      // Accounting actions
      setAccountingEntries: (entries, cacheKey = "default", filters = {}) =>
        set((state) => {
          const now = Date.now();
          state.accountingEntries = entries;
          state.accountingCache[cacheKey] = {
            data: entries,
            timestamp: now,
            filters,
          };
        }),

      getAccountingEntriesFromCache: (cacheKey = "default", filters = {}) => {
        const state = get();
        const cached = state.accountingCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        const filtersMatch =
          JSON.stringify(cached.filters || {}) === JSON.stringify(filters);
        if (!filtersMatch) {
          return null;
        }

        return cached.data;
      },

      addAccountingEntry: (entry) =>
        set((state) => {
          state.accountingEntries.unshift(entry);
          state.accountingCache = {};
        }),

      // Schools actions (platform admin)
      setSchools: (schools) =>
        set((state) => {
          const now = Date.now();
          state.schools = schools;
          state.schoolsCache = {
            data: schools,
            timestamp: now,
          };
        }),

      getSchoolsFromCache: () => {
        const state = get();
        const cached = state.schoolsCache;

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        return cached.data;
      },

      addSchool: (school) =>
        set((state) => {
          state.schools.push(school);
          state.schoolsCache = null; // Invalider le cache
        }),

      updateSchool: (schoolId, updates) =>
        set((state) => {
          const index = state.schools.findIndex((s) => s.id === schoolId);
          if (index !== -1) {
            Object.assign(state.schools[index], updates);
          }
          // Mettre à jour l'école courante si c'est celle-ci
          if (state.currentSchool?.id === schoolId) {
            Object.assign(state.currentSchool, updates);
          }
        }),

      removeSchool: (schoolId) =>
        set((state) => {
          state.schools = state.schools.filter((s) => s.id !== schoolId);
          state.schoolsCache = null;
        }),

      // Search actions
      setSearchResults: (results, query, filters = {}) =>
        set((state) => {
          const now = Date.now();
          const cacheKey = `${query}_${JSON.stringify(filters)}`;

          // Nettoyer le cache de recherche si trop d'entrées
          const cacheKeys = Object.keys(state.searchCache);
          if (cacheKeys.length >= state.cacheSettings.maxCacheSize) {
            const sortedKeys = cacheKeys.sort(
              (a, b) =>
                state.searchCache[a].timestamp - state.searchCache[b].timestamp
            );
            const keysToRemove = sortedKeys.slice(
              0,
              Math.floor(state.cacheSettings.maxCacheSize / 2)
            );
            keysToRemove.forEach((key) => delete state.searchCache[key]);
          }

          state.searchResults = results;
          state.searchCache[cacheKey] = {
            data: results,
            timestamp: now,
            filters,
          };
        }),

      getSearchResultsFromCache: (query, filters = {}) => {
        const state = get();
        const cacheKey = `${query}_${JSON.stringify(filters)}`;
        const cached = state.searchCache[cacheKey];

        if (!cached || !state.isCacheValid(cached.timestamp)) {
          return null;
        }

        return cached.data;
      },

      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query;
        }),

      addRecentSearch: (query) =>
        set((state) => {
          if (query.trim() && !state.recentSearches.includes(query)) {
            state.recentSearches = [query, ...state.recentSearches.slice(0, 9)];
          }
        }),

      clearRecentSearches: () =>
        set((state) => {
          state.recentSearches = [];
        }),

      // Cache management
      isCacheValid: (timestamp) => {
        const now = Date.now();
        const { ttl } = get().cacheSettings;
        return now - timestamp < ttl;
      },

      clearExpiredCache: () =>
        set((state) => {
          const now = Date.now();
          const { ttl } = state.cacheSettings;

          // Nettoyer le cache des élèves
          Object.keys(state.studentsCache).forEach((key) => {
            if (now - state.studentsCache[key].timestamp >= ttl) {
              delete state.studentsCache[key];
            }
          });

          // Nettoyer le cache des détails élèves
          Object.keys(state.studentDetails).forEach((key) => {
            if (now - state.studentDetails[key].timestamp >= ttl) {
              delete state.studentDetails[key];
            }
          });

          // Nettoyer le cache des paiements
          Object.keys(state.paymentsCache).forEach((key) => {
            if (now - state.paymentsCache[key].timestamp >= ttl) {
              delete state.paymentsCache[key];
            }
          });

          // Nettoyer le cache des dépenses
          Object.keys(state.expensesCache).forEach((key) => {
            if (now - state.expensesCache[key].timestamp >= ttl) {
              delete state.expensesCache[key];
            }
          });

          // Nettoyer le cache de recherche
          Object.keys(state.searchCache).forEach((key) => {
            if (now - state.searchCache[key].timestamp >= ttl) {
              delete state.searchCache[key];
            }
          });

          // Nettoyer le cache des écoles
          if (state.schoolsCache && now - state.schoolsCache.timestamp >= ttl) {
            state.schoolsCache = null;
          }

          // Nettoyer le cache académique
          Object.keys(state.academicCache).forEach((key) => {
            if (now - state.academicCache[key].timestamp >= ttl) {
              delete state.academicCache[key];
            }
          });
        }),

      clearAllCache: () =>
        set((state) => {
          state.studentsCache = {};
          state.studentDetails = {};
          state.paymentsCache = {};
          state.expensesCache = {};
          state.searchCache = {};
          state.schoolsCache = null;
          state.academicCache = {};
          state.accountingCache = {};
          state.feeTypesCache = {};
        }),

      clearCacheByKey: (key) =>
        set((state) => {
          delete state.studentsCache[key];
          delete state.paymentsCache[key];
          delete state.expensesCache[key];
          delete state.searchCache[key];
          delete state.accountingCache[key];
        }),

      getCacheStats: () => {
        const state = get();
        return {
          studentsCount: Object.keys(state.studentsCache).length,
          paymentsCount: Object.keys(state.paymentsCache).length,
          expensesCount: Object.keys(state.expensesCache).length,
          totalSize:
            Object.keys(state.studentsCache).length +
            Object.keys(state.paymentsCache).length +
            Object.keys(state.expensesCache).length +
            Object.keys(state.searchCache).length +
            Object.keys(state.academicCache).length +
            (state.schoolsCache ? 1 : 0),
        };
      },

      // UI actions
      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),

      setLoadingState: (key, loading) =>
        set((state) => {
          if (loading) {
            state.loadingStates[key] = true;
          } else {
            delete state.loadingStates[key];
          }
        }),

      getLoadingState: (key) => {
        return get().loadingStates[key] || false;
      },

      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),

      // Notifications avec mise à jour automatique du compteur
      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            read: false,
          };
          state.notifications.unshift(newNotification);

          // Auto-remove après 5 secondes pour les notifications temporaires
          if (notification.type !== "error") {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, 5000);
          }

          if (notification.duration !== 0) {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, notification.duration || 5000);
          }
        }),

      removeNotification: (id) =>
        set((state) => {
          const index = state.notifications.findIndex((n) => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadNotificationsCount -= 1;
            }
            state.notifications.splice(index, 1);
          }
        }),

      markNotificationAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadNotificationsCount -= 1;
          }
        }),

      markAllNotificationsAsRead: () =>
        set((state) => {
          state.notifications.forEach((notification) => {
            notification.read = true;
          });
          state.unreadNotificationsCount = 0;
        }),

      clearNotifications: () =>
        set((state) => {
          state.notifications = [];
          state.unreadNotificationsCount = 0;
        }),

      // Error handling
      setError: (key, error) =>
        set((state) => {
          if (error) {
            state.errors[key] = error;
          } else {
            delete state.errors[key];
          }
        }),

      clearErrors: () =>
        set((state) => {
          state.errors = {};
        }),

      getError: (key) => {
        return get().errors[key] || null;
      },

      // Preferences
      updatePreferences: (newPreferences) =>
        set((state) => {
          state.preferences = { ...state.preferences, ...newPreferences };
        }),

      // Utility
      reset: () => set(() => ({ ...initialState })),

      hydrate: () => {
        // Nettoyer le cache expiré au démarrage
        get().clearExpiredCache();
      },
    })),
    {
      name: "school-manager-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Persister les données d'authentification
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
        currentSchool: state.currentSchool,

        // Persister les préférences utilisateur
        preferences: state.preferences,
        sidebarOpen: state.sidebarOpen,
        recentSearches: state.recentSearches,

        // Persister le cache pour éviter les rechargements
        studentsCache: state.studentsCache,
        studentDetails: state.studentDetails,
        paymentsCache: state.paymentsCache,
        expensesCache: state.expensesCache,
        feeTypesCache: state.feeTypesCache,
        academicCache: state.academicCache,
        accountingCache: state.accountingCache,
        schoolsCache: state.schoolsCache,
        searchCache: state.searchCache,

        // Persister les notifications non lues
        notifications: state.notifications,
        unreadNotificationsCount: state.unreadNotificationsCount,
      }),
      onRehydrateStorage: () => (state) => {
        // Nettoyer le cache expiré après la réhydratation
        if (state) {
          state.hydrate();
        }
      },
    }
  )
);

// Hooks spécialisés pour faciliter l'utilisation
export const useAuth = () => {
  const store = useAppStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    authToken: store.authToken,
    currentSchool: store.currentSchool,
    setUser: store.setUser,
    setAuthToken: store.setAuthToken,
    setCurrentSchool: store.setCurrentSchool,
    login: store.login,
    logout: store.logout,
    hasPermission: (permission: string) => {
      // Logique de permissions basée sur le rôle
      if (!store.user) return false;
      if (store.user.role === "platform_admin") return true;
      // Ajouter la logique spécifique selon les besoins
      return true;
    },
    canAccess: (roles: string[]) => {
      if (!store.user) return false;
      return roles.includes(store.user.role);
    },
  };
};

export const useUI = () => {
  const store = useAppStore();
  return {
    isLoading: store.isLoading,
    loadingStates: store.loadingStates,
    sidebarOpen: store.sidebarOpen,
    notifications: store.notifications,
    unreadNotificationsCount: store.unreadNotificationsCount,
    errors: store.errors,
    setLoading: store.setLoading,
    setLoadingState: store.setLoadingState,
    getLoadingState: store.getLoadingState,
    setSidebarOpen: store.setSidebarOpen,
    toggleSidebar: store.toggleSidebar,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    markNotificationAsRead: store.markNotificationAsRead,
    markAllNotificationsAsRead: store.markAllNotificationsAsRead,
    clearNotifications: store.clearNotifications,
    setError: store.setError,
    clearErrors: store.clearErrors,
    getError: store.getError,
    showNotification: (
      message: string,
      type: "info" | "success" | "warning" | "error" = "info",
      title?: string,
      duration: number = 0
    ) => {
      store.addNotification({
        title: title || type.charAt(0).toUpperCase() + type.slice(1),
        message,
        type,
        duration,
      });
    },
  };
};

export const useStudents = () => {
  const store = useAppStore();
  return {
    students: store.students,
    setStudents: store.setStudents,
    getStudentsFromCache: store.getStudentsFromCache,
    setStudentDetails: store.setStudentDetails,
    getStudentFromCache: store.getStudentFromCache,
    addStudent: store.addStudent,
    updateStudent: store.updateStudent,
    removeStudent: store.removeStudent,
  };
};

export const usePayments = () => {
  const store = useAppStore();
  return {
    payments: store.payments,
    setPayments: store.setPayments,
    getPaymentsFromCache: store.getPaymentsFromCache,
    addPayment: store.addPayment,
    updatePayment: store.updatePayment,
    removePayment: store.removePayment,
  };
};

export const useExpenses = () => {
  const store = useAppStore();
  return {
    expenses: store.expenses,
    setExpenses: store.setExpenses,
    getExpensesFromCache: store.getExpensesFromCache,
    addExpense: store.addExpense,
    updateExpense: store.updateExpense,
    removeExpense: store.removeExpense,
  };
};

export const useCache = () => {
  const store = useAppStore();
  return {
    clearExpiredCache: store.clearExpiredCache,
    clearAllCache: store.clearAllCache,
    clearCacheByKey: store.clearCacheByKey,
    getCacheStats: store.getCacheStats,
    isCacheValid: store.isCacheValid,
  };
};
