/**
 * Analytics Dashboard Types
 * TypeScript interfaces for the Unified Analytics Dashboard
 */

import { CurriculumSystem, GradeDisplayRegion } from '../../../types/curriculum';
import { ScreenerLevel, Subject, School, Student, StudentResult } from '../../../types';

// ============================================
// Filter Types
// ============================================

export type MetricType = 'total' | 'onOrAbove' | 'below' | 'farBelow' | 'nonApplicable';

export type ViewMode = 'school-wide' | 'individual-student';

export type GradeCategory = 'on-or-above' | 'below' | 'far-below' | 'non-applicable';

export type ReadinessStatus = 'ready' | 'approaching' | 'not-yet-ready';

export interface FilterState {
  curriculum: CurriculumSystem;
  schools: string[];
  grades: string[];
  subjects: string[];
  searchQuery: string;
}

export interface GradeOption {
  value: string;
  label: string;
}

export interface SubjectOption {
  value: string;
  label: string;
  qualification?: string;
}

// ============================================
// Data Types
// ============================================

export interface SummaryData {
  total: number;
  onOrAboveGrade: number;
  belowGrade: number;
  farBelowGrade: number;
  nonApplicable: number;
}

export interface ReadinessDistribution {
  ready: number;
  approaching: number;
  notYetReady: number;
}

export interface SkillGap {
  domain: string;
  code: string;
  description: string;
  percentage: number; // 0-100
  studentCount: number;
}

export interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolId: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  readinessScore: number | null;
  lastAssessmentDate: string | null;
}

export interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  school: {
    id: string;
    name: string;
  };
  screener: {
    status: GradeCategory;
    score: number | null;
    date: string | null;
  };
  readiness: {
    course: string;
    courseLabel: string;
    status: ReadinessStatus;
    score: number;
    date: string;
    prerequisitesMet: number;
    prerequisitesTotal: number;
    gaps: Array<{
      code: string;
      standard: string;
      description: string;
      domain: string;
    }>;
    recommendations: string[];
  } | null;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================
// Analytics State
// ============================================

export interface AnalyticsState {
  // Filter State
  filters: FilterState;

  // View State
  viewMode: ViewMode;
  selectedStudentId: string | null;

  // UI State
  isReadinessSectionCollapsed: boolean;
  activeMetricFilter: MetricType | null;

  // Pagination State
  pagination: PaginationState;
  sort: SortState;
}

export interface AnalyticsData {
  summary: SummaryData | null;
  readiness: ReadinessDistribution | null;
  skillGaps: SkillGap[] | null;
  students: StudentData[] | null;
  selectedStudent: StudentDetail | null;
}

export interface AnalyticsStatus {
  isLoading: boolean;
  isFiltering: boolean;
  isPageLoading: boolean;
  isStudentLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// ============================================
// Context Types
// ============================================

export interface AnalyticsActions {
  // Filter actions
  setFilters: (filters: Partial<FilterState>) => void;
  setCurriculum: (curriculum: CurriculumSystem) => void;
  resetFilters: () => void;

  // View mode actions
  selectStudent: (studentId: string | null) => void;
  setViewMode: (mode: ViewMode) => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (column: string, direction: 'asc' | 'desc') => void;

  // UI actions
  toggleReadinessSection: () => void;
  setActiveMetricFilter: (metric: MetricType | null) => void;
}

export interface AnalyticsContextValue {
  state: AnalyticsState;
  actions: AnalyticsActions;
  data: AnalyticsData;
  status: AnalyticsStatus;
}

// ============================================
// Component Props Types
// ============================================

export interface FilterBarProps {
  className?: string;
}

export interface FilterDropdownProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string }>;
  multiSelect?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface StudentSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export interface SummaryMetricsProps {
  data: SummaryData;
  isLoading: boolean;
  onMetricClick: (metric: MetricType | null) => void;
  activeMetric: MetricType | null;
}

export interface MetricCardProps {
  label: string;
  value: number;
  type: MetricType;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

// ============================================
// Chart Types
// ============================================

export interface ReadinessChartConfig {
  type: 'donut';
  colors: {
    ready: string;
    approaching: string;
    notYetReady: string;
  };
  innerRadius: string;
  showLabels: boolean;
  showLegend: boolean;
  legendPosition: 'bottom' | 'right';
  animation: {
    duration: number;
    easing: string;
  };
}

export interface SkillGapsChartConfig {
  type: 'horizontalBar';
  color: string;
  showPercentages: boolean;
  showGridLines: boolean;
  maxValue: number;
  barHeight: number;
  sortOrder: 'ascending' | 'descending';
  animation: {
    duration: number;
    stagger: number;
  };
}

// ============================================
// Query Types
// ============================================

export interface AnalyticsQueryParams {
  curriculum: CurriculumSystem;
  schoolIds?: string[];
  gradeIds?: string[];
  subjectIds?: string[];
  searchQuery?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  metricFilter?: MetricType;
}
