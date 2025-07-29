import { useEffect, useState, useCallback, useRef } from "react";
import {
  useAppStore,
  useAuth as useAuthFromStore,
  useUI as useUIFromStore,
  useStudents,
  usePayments,
  useExpenses,
  useCache,
} from "../stores";
import { debounce } from "../utils";

// Réexporter les hooks du store
export const useAuth = useAuthFromStore;
export const useUI = useUIFromStore;
export { useStudents, usePayments, useExpenses, useCache };

// Hook pour les écoles (admin plateforme)
export const useSchools = () => {
  const store = useAppStore();
  return {
    schools: store.schools,
    setSchools: store.setSchools,
    getSchoolsFromCache: store.getSchoolsFromCache,
    addSchool: store.addSchool,
    updateSchool: store.updateSchool,
    removeSchool: store.removeSchool,
  };
};

// Hook pour la structure académique
export const useAcademic = () => {
  const store = useAppStore();
  return {
    academicYears: store.academicYears,
    levels: store.levels,
    sections: store.sections,
    classes: store.classes,
    setAcademicYears: store.setAcademicYears,
    setLevels: store.setLevels,
    setSections: store.setSections,
    setClasses: store.setClasses,
    getAcademicYearsFromCache: store.getAcademicDataFromCache,
    getLevelsFromCache: store.getAcademicDataFromCache,
    getSectionsFromCache: store.getAcademicDataFromCache,
    getClassesFromCache: store.getAcademicDataFromCache,
  };
};

// Hook pour les types de frais
export const useFeeTypes = () => {
  const store = useAppStore();
  return {
    feeTypes: store.feeTypes,
    setFeeTypes: store.setFeeTypes,
    getFeeTypesFromCache: store.getFeeTypesFromCache,
    addFeeType: store.addFeeType,
    updateFeeType: store.updateFeeType,
    removeFeeType: store.removeFeeType,
  };
};

// Hook pour les écritures comptables
export const useAccounting = () => {
  const store = useAppStore();
  return {
    accountingEntries: store.accountingEntries,
    setAccountingEntries: store.setAccountingEntries,
    getAccountingEntriesFromCache: store.getAccountingEntriesFromCache,
    addAccountingEntry: store.addAccountingEntry,
  };
};

// Hook pour les appels API avec cache et gestion d'état
export const useApiCall = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: {
    cacheKey?: string;
    cacheTTL?: number;
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { clearCacheByKey } = useCache();
  const { showNotification } = useUI();

  const {
    cacheKey,
    cacheTTL = 300000, // 5 minutes
    immediate = true,
    onSuccess,
    onError,
  } = options;

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiCall();
      setData(result);

      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      showNotification(error.message, "error");
      throw error;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, showNotification]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute,
  };
};

// Hook pour les collections API Platform avec pagination
export const useApiPlatformCollection = <T>(
  apiCall: (params: any) => Promise<any>,
  initialParams: any = {},
  options: {
    cacheKey?: string;
    cacheTTL?: number;
    immediate?: boolean;
    one?: boolean;
  } = {}
) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    hasNext: false,
    hasPrevious: false,
    currentPage: 1,
  });
  const [params, setParams] = useState(initialParams);

  const store = useAppStore();
  const { showNotification } = useUI();

  const { cacheKey, cacheTTL = 300000, immediate = true } = options;

  const execute = useCallback(
    async (newParams = params) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiCall(newParams);
        if (options.one) {
          setData(response);
          return { items: response };
        }
        const items = response["member"] || [];
        const totalItems = response["totalItems"] || 0;
        const view = response["view"];

        const paginationInfo = {
          totalItems,
          hasNext: !!view?.["next"],
          hasPrevious: !!view?.["previous"],
          currentPage: newParams.page || 1,
        };

        setData(items);
        setPagination(paginationInfo);

        return { items, pagination: paginationInfo };
      } catch (err) {
        const error = err as Error;
        setError(error);
        showNotification(error.message, "error", "", 5000);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [apiCall, params, showNotification]
  );

  const updateParams = useCallback(
    (newParams: any) => {
      const updatedParams = { ...params, ...newParams };
      setParams(updatedParams);
      execute(updatedParams);
    },
    [params, execute]
  );

  const goToPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams]
  );

  const search = useCallback(
    (searchTerm: string) => {
      updateParams({ search: searchTerm, page: 1 });
    },
    [updateParams]
  );

  const filter = useCallback(
    (filters: Record<string, any>) => {
      updateParams({ ...filters, page: 1 });
    },
    [updateParams]
  );

  const sort = useCallback(
    (property: string, direction: "asc" | "desc") => {
      updateParams({ order: { [property]: direction }, page: 1 });
    },
    [updateParams]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    params,
    execute,
    updateParams,
    goToPage,
    search,
    filter,
    sort,
    refetch: () => execute(params),
  };
};

// Hook pour la recherche avec debounce
export const useSearch = <T>(
  searchFunction: (query: string) => Promise<T[]>,
  delay: number = 300
) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err as Error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFunction, delay]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearResults: () => setResults([]),
  };
};

// Hook pour la pagination
export const usePagination = (
  totalItems: number,
  itemsPerPage: number = 20
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    reset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

// Hook pour les modales
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

// Hook pour les formulaires avec validation
export const useFormValidation = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: any
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Effacer l'erreur quand l'utilisateur modifie la valeur
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback(
    (name: keyof T, touched: boolean = true) => {
      setTouched((prev) => ({ ...prev, [name]: touched }));
    },
    []
  );

  const validate = useCallback(async () => {
    if (!validationSchema) return true;

    try {
      await validationSchema.parseAsync(values);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};

      if (error.errors) {
        error.errors.forEach((err: any) => {
          const field = err.path[0] as keyof T;
          fieldErrors[field] = err.message;
        });
      }

      setErrors(fieldErrors);
      return false;
    }
  }, [values, validationSchema]);

  const handleSubmit = useCallback(
    async (onSubmit: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);

      // Marquer tous les champs comme touchés
      const allTouched = Object.keys(values).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Partial<Record<keyof T, boolean>>);
      setTouched(allTouched);

      try {
        const isValid = await validate();
        if (isValid) {
          await onSubmit(values);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setFieldTouched,
    validate,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Hook pour le stockage local
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
};

// Hook pour détecter les clics en dehors d'un élément
export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
};

// Hook pour les raccourcis clavier
export const useKeyboardShortcut = (
  keys: string[],
  callback: () => void,
  options: { preventDefault?: boolean } = {}
) => {
  const { preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = [];

      if (event.ctrlKey) pressedKeys.push("ctrl");
      if (event.shiftKey) pressedKeys.push("shift");
      if (event.altKey) pressedKeys.push("alt");
      if (event.metaKey) pressedKeys.push("meta");

      pressedKeys.push(event.key.toLowerCase());

      const isMatch = keys.every((key) =>
        pressedKeys.includes(key.toLowerCase())
      );

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [keys, callback, preventDefault]);
};
