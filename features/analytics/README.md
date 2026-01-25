# Unified Analytics Dashboard

A comprehensive analytics dashboard for the OmniScreener K-12 Universal Assessment platform. This feature provides educators with a unified view of screener results and readiness assessments, enabling data-driven decisions about student support and intervention.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
- [Hooks](#hooks)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Usage](#usage)

## Overview

The Unified Analytics Dashboard combines:

- **Screener Dashboard**: Visual summary of student performance across grade-level categories
- **Readiness Analytics**: Course readiness visualization with skill gap analysis
- **Student Table**: Sortable, filterable data table with keyboard navigation
- **Student Detail Panel**: Comprehensive individual student view with recommendations

### Key Features

- Real-time filtering by curriculum, school, grade, and subject
- URL query parameter synchronization for shareable filter states
- Responsive design with mobile-first approach
- Full keyboard navigation support
- Screen reader accessibility (WCAG 2.1 compliant)
- Automatic retry logic for API calls
- In-memory caching with TTL

## Architecture

```
features/analytics/
├── components/           # React components
│   ├── common/          # Shared accessibility components
│   ├── FilterBar/       # Filter controls
│   ├── SummaryMetrics/  # Metric cards
│   ├── ReadinessSection/# Readiness visualizations
│   ├── StudentTable/    # Data table
│   ├── StudentDetailPanel/ # Detail panel
│   └── ErrorBoundary/   # Error handling
├── context/             # React Context + Reducer
├── hooks/               # Custom hooks
├── services/            # API layer
├── types/               # TypeScript definitions
├── utils/               # Utilities
└── __tests__/           # Test files
```

## Components

### UnifiedAnalyticsPage

Main page component that orchestrates all analytics features.

```tsx
import { UnifiedAnalyticsPage } from './features/analytics/components';

<UnifiedAnalyticsPage
  students={students}
  results={results}
  schools={schools}
  isLoading={isLoading}
/>
```

### SummaryMetrics

Displays summary cards for student categories with click-to-filter functionality.

```tsx
<SummaryMetrics
  data={summaryData}
  isLoading={isLoading}
  onMetricClick={handleMetricClick}
  activeMetric={activeMetric}
/>
```

### ReadinessSection

Collapsible section with readiness donut chart and skill gaps bar chart.

```tsx
<ReadinessSection
  readinessData={readinessDistribution}
  skillGapsData={skillGaps}
  curriculum="US_COMMON_CORE_AP"
  isLoading={isLoading}
  isCollapsed={isCollapsed}
  onToggleCollapse={handleToggle}
/>
```

### StudentTable

Full-featured data table with sorting, pagination, and keyboard navigation.

```tsx
<StudentTable
  students={tableData}
  isLoading={isLoading}
  sort={sortState}
  onSort={handleSort}
  pagination={paginationState}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
  selectedStudentId={selectedId}
  onSelectStudent={handleSelect}
/>
```

### StudentDetailPanel

Slide-out panel with comprehensive student information.

```tsx
<StudentDetailPanel
  student={studentDetail}
  isOpen={isOpen}
  isLoading={isLoading}
  onClose={handleClose}
/>
```

## Hooks

### useAnalyticsFilters

Manages filter state with URL synchronization.

```tsx
const {
  filters,
  gradeLevelLabel,
  curriculumOptions,
  gradeOptions,
  subjectOptions,
  handleCurriculumChange,
  handleSchoolChange,
  handleGradeChange,
  handleSubjectChange,
  handleSearchChange,
  handleResetFilters,
  hasActiveFilters,
} = useAnalyticsFilters();
```

### useKeyboardNavigation

Provides keyboard navigation for lists and tables.

```tsx
const {
  focusedIndex,
  setFocusedIndex,
  handleKeyDown,
  isFocused,
  resetFocus,
} = useKeyboardNavigation({
  itemCount: items.length,
  enabled: true,
  loop: true,
  onSelect: handleSelect,
  onEscape: handleClose,
});
```

### useRetry

Adds retry logic with exponential backoff.

```tsx
const { execute, isRetrying, retryCount, reset, cancel } = useRetry({
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  onRetry: (attempt, error) => console.log(`Retry ${attempt}`),
});

const data = await execute(fetchData);
```

### useAnnouncer

Screen reader announcement hook.

```tsx
const { announce, Announcer } = useAnnouncer();

announce('Filters updated', 'polite');

return (
  <>
    <Announcer />
    {/* ... */}
  </>
);
```

## State Management

The analytics dashboard uses React Context with useReducer for state management.

### State Shape

```typescript
interface AnalyticsState {
  filters: AnalyticsFilters;
  viewMode: ViewMode;
  selectedStudentId: string | null;
  activeMetricFilter: MetricType | null;
  isReadinessSectionCollapsed: boolean;
  pagination: PaginationState;
  sort: SortState;
}
```

### Actions

```typescript
// Filter actions
actions.setCurriculum(curriculum);
actions.setSchools(schoolIds);
actions.setGrades(gradeIds);
actions.setSubjects(subjectIds);
actions.setSearchQuery(query);
actions.resetFilters();

// Selection actions
actions.selectStudent(studentId);

// Pagination actions
actions.setPage(pageNumber);
actions.setPageSize(size);

// Sort actions
actions.setSort(column, direction);

// UI actions
actions.setActiveMetricFilter(metric);
actions.toggleReadinessSection();
```

## API Integration

### Analytics API Service

```typescript
import { fetchAnalyticsData, clearAnalyticsCache } from './services/analyticsApi';

const { students, results, summary, readiness, skillGaps } = await fetchAnalyticsData(filters);
```

### Caching

Data is cached in memory with a 5-minute TTL:

```typescript
// Clear all cache
clearAnalyticsCache();

// Clear specific cache entries
clearCacheByPrefix('students:');
```

## Accessibility

### Skip Links

The dashboard includes skip links for keyboard navigation:

- Skip to main content
- Skip to filters
- Skip to student table

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move between focusable elements |
| `↓` / `↑` | Navigate table rows |
| `Enter` / `Space` | Select row / activate button |
| `Home` / `End` | Jump to first / last row |
| `Escape` | Close panel / deselect |

### Screen Reader Support

- ARIA labels and descriptions on all interactive elements
- Live regions for dynamic content updates
- Proper heading hierarchy
- Status announcements for loading and filter changes

### Focus Management

- Focus trap in modal panels
- Focus restoration when panels close
- Visible focus indicators

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui
```

### Test Structure

```
__tests__/
├── common.test.tsx      # Accessibility components
├── SummaryMetrics.test.tsx
├── StudentTable.test.tsx
├── StudentDetailPanel.test.tsx
├── hooks.test.tsx       # Custom hooks
├── context.test.tsx     # Context and reducer
└── testUtils.tsx        # Test utilities and mocks
```

### Test Utilities

```typescript
import { renderWithProviders, mockStudentTableData } from './__tests__/testUtils';

const { getByText } = renderWithProviders(<MyComponent />);
```

## Usage

### Basic Setup

```tsx
import { UnifiedAnalyticsPage } from './features/analytics/components';

function AnalyticsDashboard() {
  const { data, isLoading } = useAnalyticsData();

  return (
    <UnifiedAnalyticsPage
      students={data.students}
      results={data.results}
      schools={data.schools}
      isLoading={isLoading}
    />
  );
}
```

### With Custom Data Fetching

```tsx
import { AnalyticsProvider, useAnalytics } from './features/analytics/context';
import { useAnalyticsData } from './features/analytics/hooks';

function App() {
  return (
    <AnalyticsProvider>
      <AnalyticsDashboardWithData />
    </AnalyticsProvider>
  );
}

function AnalyticsDashboardWithData() {
  const { state } = useAnalytics();
  const { data, isLoading, error, refetch } = useAnalyticsData(state.filters);

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <UnifiedAnalyticsContent
      students={data?.students ?? []}
      results={data?.results ?? []}
      schools={data?.schools ?? []}
      isLoading={isLoading}
    />
  );
}
```

### Curriculum Systems

The dashboard supports two curriculum systems:

```typescript
type CurriculumSystem = 'US_COMMON_CORE_AP' | 'EDEXCEL_INTERNATIONAL';
```

- **US_COMMON_CORE_AP**: US Common Core with AP courses, uses "Grade" terminology
- **EDEXCEL_INTERNATIONAL**: Edexcel international curriculum, uses "Year" terminology

## Types

### Core Types

```typescript
// Grade categories from screener
type GradeCategory = 'on-or-above' | 'below' | 'far-below' | 'non-applicable';

// Readiness status
type ReadinessStatus = 'ready' | 'approaching' | 'not-yet-ready';

// Metric filter types
type MetricType = 'total' | 'onOrAbove' | 'below' | 'farBelow' | 'nonApplicable';

// View modes
type ViewMode = 'overview' | 'school-wide' | 'individual-student';
```

### Data Types

```typescript
interface SummaryData {
  total: number;
  onOrAboveGrade: number;
  belowGrade: number;
  farBelowGrade: number;
  nonApplicable: number;
}

interface ReadinessDistribution {
  ready: number;
  approaching: number;
  notYetReady: number;
}

interface SkillGap {
  domain: string;
  code: string;
  description: string;
  percentage: number;
  studentCount: number;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 19
- TypeScript 5.8
- Recharts (visualizations)
- Tailwind CSS (styling)
- Firebase/Firestore (data storage)
- Vitest (testing)
- React Testing Library (component testing)
