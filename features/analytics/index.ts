// Main exports for analytics feature

// Components
export { UnifiedAnalyticsPage } from './components/UnifiedAnalyticsPage';
export { FilterBar, FilterDropdown, StudentSearch, CurriculumSelector } from './components/FilterBar';
export { SummaryMetrics, MetricCard } from './components/SummaryMetrics';
export { ReadinessSection, ReadinessDonutChart, SkillGapsChart } from './components/ReadinessSection';
export { StudentTable, StudentRow, TableHeader, Pagination } from './components/StudentTable';
export { StudentDetailPanel } from './components/StudentDetailPanel';
export { ErrorMessage } from './components/ErrorBoundary';

// Context
export { AnalyticsProvider, useAnalytics } from './context';

// Hooks
export { useAnalyticsFilters, useAnalyticsData, useStudentDetail, useRetry } from './hooks';

// Services
export * from './services';

// Types
export * from './types';
