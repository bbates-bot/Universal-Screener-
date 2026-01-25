/**
 * Analytics Context Provider
 * Manages state for the Unified Analytics Dashboard
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { CurriculumSystem } from '../../../types/curriculum';
import {
  AnalyticsState,
  AnalyticsContextValue,
  AnalyticsData,
  AnalyticsStatus,
  FilterState,
  MetricType,
  ViewMode,
  SummaryData,
} from '../types';

// ============================================
// Initial State
// ============================================

const initialFilters: FilterState = {
  curriculum: 'EDEXCEL_INTERNATIONAL',
  schools: [],
  grades: [],
  subjects: [],
  searchQuery: '',
};

const initialState: AnalyticsState = {
  filters: initialFilters,
  viewMode: 'school-wide',
  selectedStudentId: null,
  isReadinessSectionCollapsed: false,
  activeMetricFilter: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  },
  sort: {
    column: 'lastName',
    direction: 'asc',
  },
};

// ============================================
// Action Types
// ============================================

type AnalyticsAction =
  | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
  | { type: 'SET_CURRICULUM'; payload: CurriculumSystem }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SELECT_STUDENT'; payload: string | null }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_PAGE_SIZE'; payload: number }
  | { type: 'SET_SORT'; payload: { column: string; direction: 'asc' | 'desc' } }
  | { type: 'TOGGLE_READINESS_SECTION' }
  | { type: 'SET_ACTIVE_METRIC_FILTER'; payload: MetricType | null }
  | { type: 'SET_PAGINATION_TOTAL'; payload: { totalCount: number; totalPages: number } };

// ============================================
// Reducer
// ============================================

function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 }, // Reset to first page on filter change
      };

    case 'SET_CURRICULUM':
      return {
        ...state,
        filters: {
          ...state.filters,
          curriculum: action.payload,
          grades: [], // Reset grade filter
          subjects: [], // Reset subject filter
        },
        viewMode: 'school-wide',
        selectedStudentId: null,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: {
          ...initialFilters,
          curriculum: state.filters.curriculum, // Keep current curriculum
        },
        activeMetricFilter: null,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.payload,
      };

    case 'SELECT_STUDENT':
      return {
        ...state,
        selectedStudentId: action.payload,
        viewMode: action.payload ? 'individual-student' : 'school-wide',
      };

    case 'SET_PAGE':
      return {
        ...state,
        pagination: { ...state.pagination, currentPage: action.payload },
      };

    case 'SET_PAGE_SIZE':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          pageSize: action.payload,
          currentPage: 1, // Reset to first page
        },
      };

    case 'SET_SORT':
      return {
        ...state,
        sort: action.payload,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'TOGGLE_READINESS_SECTION':
      return {
        ...state,
        isReadinessSectionCollapsed: !state.isReadinessSectionCollapsed,
      };

    case 'SET_ACTIVE_METRIC_FILTER':
      return {
        ...state,
        activeMetricFilter: action.payload,
        pagination: { ...state.pagination, currentPage: 1 },
      };

    case 'SET_PAGINATION_TOTAL':
      return {
        ...state,
        pagination: {
          ...state.pagination,
          totalCount: action.payload.totalCount,
          totalPages: action.payload.totalPages,
        },
      };

    default:
      return state;
  }
}

// ============================================
// URL State Sync Helpers
// ============================================

const STORAGE_KEY = 'analytics-filters';

function getFiltersFromURL(): Partial<FilterState> {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const filters: Partial<FilterState> = {};

  const curriculum = params.get('curriculum');
  if (curriculum && ['US_COMMON_CORE_AP', 'EDEXCEL_INTERNATIONAL'].includes(curriculum)) {
    filters.curriculum = curriculum as CurriculumSystem;
  }

  const schools = params.get('schools');
  if (schools) {
    filters.schools = schools.split(',').filter(Boolean);
  }

  const grades = params.get('grades');
  if (grades) {
    filters.grades = grades.split(',').filter(Boolean);
  }

  const subjects = params.get('subjects');
  if (subjects) {
    filters.subjects = subjects.split(',').filter(Boolean);
  }

  const search = params.get('search');
  if (search) {
    filters.searchQuery = search;
  }

  return filters;
}

function updateURL(filters: FilterState) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();

  params.set('curriculum', filters.curriculum);

  if (filters.schools.length > 0) {
    params.set('schools', filters.schools.join(','));
  }

  if (filters.grades.length > 0) {
    params.set('grades', filters.grades.join(','));
  }

  if (filters.subjects.length > 0) {
    params.set('subjects', filters.subjects.join(','));
  }

  if (filters.searchQuery) {
    params.set('search', filters.searchQuery);
  }

  const newURL = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, '', newURL);
}

function saveFiltersToStorage(filters: FilterState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

function getFiltersFromStorage(): Partial<FilterState> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {};
}

// ============================================
// Context
// ============================================

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

// ============================================
// Provider
// ============================================

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  // Initialize state with URL params or localStorage
  const getInitialState = (): AnalyticsState => {
    const urlFilters = getFiltersFromURL();
    const storedFilters = getFiltersFromStorage();

    // URL params take precedence over localStorage
    const mergedFilters = {
      ...initialFilters,
      ...storedFilters,
      ...urlFilters,
    };

    return {
      ...initialState,
      filters: mergedFilters,
    };
  };

  const [state, dispatch] = useReducer(analyticsReducer, undefined, getInitialState);

  // Sync filters to URL and localStorage
  useEffect(() => {
    updateURL(state.filters);
    saveFiltersToStorage(state.filters);
  }, [state.filters]);

  // Actions
  const actions = useMemo(
    () => ({
      setFilters: (filters: Partial<FilterState>) => {
        dispatch({ type: 'SET_FILTERS', payload: filters });
      },

      setCurriculum: (curriculum: CurriculumSystem) => {
        dispatch({ type: 'SET_CURRICULUM', payload: curriculum });
      },

      resetFilters: () => {
        dispatch({ type: 'RESET_FILTERS' });
      },

      selectStudent: (studentId: string | null) => {
        dispatch({ type: 'SELECT_STUDENT', payload: studentId });
      },

      setViewMode: (mode: ViewMode) => {
        dispatch({ type: 'SET_VIEW_MODE', payload: mode });
      },

      setPage: (page: number) => {
        dispatch({ type: 'SET_PAGE', payload: page });
      },

      setPageSize: (size: number) => {
        dispatch({ type: 'SET_PAGE_SIZE', payload: size });
      },

      setSort: (column: string, direction: 'asc' | 'desc') => {
        dispatch({ type: 'SET_SORT', payload: { column, direction } });
      },

      toggleReadinessSection: () => {
        dispatch({ type: 'TOGGLE_READINESS_SECTION' });
      },

      setActiveMetricFilter: (metric: MetricType | null) => {
        dispatch({ type: 'SET_ACTIVE_METRIC_FILTER', payload: metric });
      },
    }),
    []
  );

  // Data (will be populated by useAnalyticsData hook)
  const data: AnalyticsData = useMemo(
    () => ({
      summary: null,
      readiness: null,
      skillGaps: null,
      students: null,
      selectedStudent: null,
    }),
    []
  );

  // Status (will be updated by useAnalyticsData hook)
  const status: AnalyticsStatus = useMemo(
    () => ({
      isLoading: false,
      isFiltering: false,
      isPageLoading: false,
      isStudentLoading: false,
      isError: false,
      error: null,
    }),
    []
  );

  const contextValue: AnalyticsContextValue = useMemo(
    () => ({
      state,
      actions,
      data,
      status,
    }),
    [state, actions, data, status]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

export { AnalyticsContext };
