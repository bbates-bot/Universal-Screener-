# Analytics Component API Reference

## Components

### UnifiedAnalyticsPage

Main page component for the Unified Analytics Dashboard.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `students` | `Student[]` | Yes | - | Array of student records |
| `results` | `StudentResult[]` | Yes | - | Array of screener results |
| `schools` | `School[]` | Yes | - | Array of school records |
| `isLoading` | `boolean` | No | `false` | Loading state |

---

### SummaryMetrics

Displays summary metric cards for student grade-level categories.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `SummaryData` | Yes | - | Summary data object |
| `isLoading` | `boolean` | No | `false` | Show loading skeleton |
| `onMetricClick` | `(metric: MetricType \| null) => void` | No | - | Metric card click handler |
| `activeMetric` | `MetricType \| null` | No | `null` | Currently selected metric |
| `className` | `string` | No | `''` | Additional CSS classes |

#### SummaryData Type

```typescript
interface SummaryData {
  total: number;
  onOrAboveGrade: number;
  belowGrade: number;
  farBelowGrade: number;
  nonApplicable: number;
}
```

---

### ReadinessSection

Collapsible section containing readiness visualizations.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `readinessData` | `ReadinessDistribution` | Yes | - | Readiness distribution data |
| `skillGapsData` | `SkillGap[]` | Yes | - | Array of skill gaps |
| `curriculum` | `CurriculumSystem` | No | `'US_COMMON_CORE_AP'` | Curriculum system |
| `isLoading` | `boolean` | No | `false` | Show loading state |
| `isCollapsed` | `boolean` | No | `false` | Collapsed state |
| `onToggleCollapse` | `() => void` | No | - | Toggle collapse handler |

---

### StudentTable

Sortable, paginated data table for student results.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `students` | `StudentTableData[]` | Yes | - | Student data array |
| `isLoading` | `boolean` | No | `false` | Show loading skeleton |
| `sort` | `SortState` | Yes | - | Current sort state |
| `onSort` | `(column: string, direction: 'asc' \| 'desc') => void` | Yes | - | Sort change handler |
| `pagination` | `PaginationState` | Yes | - | Pagination state |
| `onPageChange` | `(page: number) => void` | Yes | - | Page change handler |
| `onPageSizeChange` | `(size: number) => void` | Yes | - | Page size change handler |
| `selectedStudentId` | `string \| null` | No | `null` | Selected student ID |
| `onSelectStudent` | `(id: string \| null) => void` | Yes | - | Selection handler |
| `className` | `string` | No | `''` | Additional CSS classes |

#### StudentTableData Type

```typescript
interface StudentTableData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  lastAssessmentDate: string | null;
}
```

---

### StudentDetailPanel

Slide-out panel showing detailed student information.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `student` | `StudentDetailData \| null` | Yes | - | Student detail data |
| `isOpen` | `boolean` | Yes | - | Panel visibility |
| `isLoading` | `boolean` | No | `false` | Show loading skeleton |
| `onClose` | `() => void` | Yes | - | Close handler |

#### StudentDetailData Type

```typescript
interface StudentDetailData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  grade: string;
  gradeLabel: string;
  schoolName: string;
  screenerStatus: GradeCategory;
  readinessStatus: ReadinessStatus | null;
  screener: ScreenerData | null;
  readiness: ReadinessData | null;
  recommendations: string[];
}
```

---

### FilterBar

Unified filter bar with curriculum selector, dropdowns, and search.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `schools` | `School[]` | Yes | - | Array of schools for dropdown |
| `className` | `string` | No | `''` | Additional CSS classes |

---

## Accessibility Components

### SkipLink

Skip navigation link for keyboard users.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `href` | `string` | No | - | Target element ID with # (e.g., `#main`) |
| `targetId` | `string` | No | - | Target element ID without # |
| `label` | `string` | No | `'Skip to main content'` | Link text |

---

### FocusTrap

Traps focus within a container for modal dialogs.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Content to trap focus within |
| `active` | `boolean` | No | `true` | Whether trap is active |
| `returnFocusOnDeactivate` | `boolean` | No | `true` | Return focus when deactivated |
| `initialFocusRef` | `RefObject<HTMLElement>` | No | - | Element to focus initially |

---

### LiveRegion

ARIA live region for screen reader announcements.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | `string` | Yes | - | Message to announce |
| `politeness` | `'polite' \| 'assertive'` | No | `'polite'` | Announcement priority |
| `clearAfter` | `number` | No | `5000` | Clear message after ms |

---

### LoadingSpinner

Accessible loading indicator.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Spinner size |
| `label` | `string` | No | `'Loading...'` | Accessibility label |
| `className` | `string` | No | `''` | Additional CSS classes |

---

### LoadingOverlay

Full-page loading overlay.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `isVisible` | `boolean` | Yes | - | Visibility state |
| `label` | `string` | No | `'Loading content...'` | Loading message |

---

### VisuallyHidden

Hides content visually but keeps it accessible to screen readers.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `ReactNode` | Yes | - | Content to hide visually |
| `as` | `ElementType` | No | `'span'` | HTML element type |

---

## Hooks

### useAnalytics

Access analytics context state and actions.

```typescript
const { state, actions } = useAnalytics();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `state` | `AnalyticsState` | Current state |
| `actions` | `AnalyticsActions` | Action dispatchers |

---

### useAnalyticsFilters

Filter state management with URL sync.

```typescript
const filters = useAnalyticsFilters();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `filters` | `AnalyticsFilters` | Current filter values |
| `gradeLevelLabel` | `string` | "Grade" or "Year" based on curriculum |
| `curriculumOptions` | `Option[]` | Curriculum dropdown options |
| `gradeOptions` | `Option[]` | Grade/Year dropdown options |
| `subjectOptions` | `SubjectOption[]` | Subject dropdown options |
| `handleCurriculumChange` | `(value: CurriculumSystem) => void` | Curriculum change handler |
| `handleSchoolChange` | `(values: string[]) => void` | School change handler |
| `handleGradeChange` | `(values: string[]) => void` | Grade change handler |
| `handleSubjectChange` | `(values: string[]) => void` | Subject change handler |
| `handleSearchChange` | `(query: string) => void` | Search change handler |
| `handleResetFilters` | `() => void` | Reset all filters |
| `hasActiveFilters` | `boolean` | Whether any filters are active |

---

### useKeyboardNavigation

Keyboard navigation for lists and grids.

```typescript
const navigation = useKeyboardNavigation(options);
```

#### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `itemCount` | `number` | Yes | - | Total navigable items |
| `enabled` | `boolean` | No | `true` | Enable navigation |
| `loop` | `boolean` | No | `true` | Loop at ends |
| `initialIndex` | `number` | No | `-1` | Starting index |
| `onSelect` | `(index: number) => void` | No | - | Selection callback |
| `onEscape` | `() => void` | No | - | Escape key callback |
| `orientation` | `'vertical' \| 'horizontal' \| 'both'` | No | `'vertical'` | Arrow key orientation |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `focusedIndex` | `number` | Current focused index |
| `setFocusedIndex` | `(index: number) => void` | Set focus manually |
| `handleKeyDown` | `(e: KeyboardEvent) => void` | Keyboard event handler |
| `isFocused` | `(index: number) => boolean` | Check if index is focused |
| `resetFocus` | `() => void` | Reset to initial index |
| `focusFirst` | `() => void` | Focus first item |
| `focusLast` | `() => void` | Focus last item |

---

### useRetry

Retry logic with exponential backoff.

```typescript
const retry = useRetry(options);
```

#### Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `maxRetries` | `number` | No | `3` | Maximum retry attempts |
| `initialDelay` | `number` | No | `1000` | Initial delay in ms |
| `maxDelay` | `number` | No | `30000` | Maximum delay in ms |
| `backoffMultiplier` | `number` | No | `2` | Delay multiplier |
| `onRetry` | `(attempt: number, error: Error) => void` | No | - | Retry callback |
| `onMaxRetriesReached` | `(error: Error) => void` | No | - | Max retries callback |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `execute` | `<T>(fn: () => Promise<T>) => Promise<T>` | Execute with retry |
| `isRetrying` | `boolean` | Currently retrying |
| `retryCount` | `number` | Current retry count |
| `reset` | `() => void` | Reset retry state |
| `cancel` | `() => void` | Cancel pending retry |

---

### useAnnouncer

Screen reader announcements.

```typescript
const { announce, Announcer } = useAnnouncer();
```

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `announce` | `(text: string, priority?: 'polite' \| 'assertive') => void` | Announce message |
| `Announcer` | `React.FC` | Announcer component to render |
