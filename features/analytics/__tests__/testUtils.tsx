/**
 * Test Utilities for Analytics Components
 * Provides mock data, render helpers, and common test utilities
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AnalyticsProvider } from '../context';
import { CurriculumProvider } from '../../../contexts/CurriculumContext';
import {
  SummaryData,
  ReadinessDistribution,
  SkillGap,
  GradeCategory,
  ReadinessStatus,
  AnalyticsFilters,
  CurriculumSystem,
} from '../types';
import { StudentTableData } from '../components/StudentTable';
import { StudentDetailData } from '../components/StudentDetailPanel';

// Mock Summary Data
export const mockSummaryData: SummaryData = {
  total: 150,
  onOrAboveGrade: 75,
  belowGrade: 45,
  farBelowGrade: 20,
  nonApplicable: 10,
};

// Mock Readiness Distribution
export const mockReadinessData: ReadinessDistribution = {
  ready: 75,
  approaching: 45,
  notYetReady: 30,
};

// Mock Skill Gaps
export const mockSkillGaps: SkillGap[] = [
  {
    domain: 'Number Operations',
    code: 'NBT.5',
    description: 'Fluently multiply multi-digit whole numbers',
    percentage: 45,
    studentCount: 68,
  },
  {
    domain: 'Algebraic Expressions',
    code: 'EE.2',
    description: 'Write, read, and evaluate expressions',
    percentage: 32,
    studentCount: 48,
  },
  {
    domain: 'Fractions & Decimals',
    code: 'NF.3',
    description: 'Add and subtract fractions with unlike denominators',
    percentage: 28,
    studentCount: 42,
  },
];

// Mock Student Table Data
export const mockStudentTableData: StudentTableData[] = [
  {
    id: 'student-1',
    firstName: 'Alice',
    lastName: 'Johnson',
    username: 'ajohnson',
    grade: '6',
    gradeLabel: 'Grade 6',
    schoolName: 'Lincoln Elementary',
    screenerStatus: 'on-or-above' as GradeCategory,
    readinessStatus: 'ready' as ReadinessStatus,
    lastAssessmentDate: '2024-01-15',
  },
  {
    id: 'student-2',
    firstName: 'Bob',
    lastName: 'Smith',
    username: 'bsmith',
    grade: '7',
    gradeLabel: 'Grade 7',
    schoolName: 'Lincoln Elementary',
    screenerStatus: 'below' as GradeCategory,
    readinessStatus: 'approaching' as ReadinessStatus,
    lastAssessmentDate: '2024-01-14',
  },
  {
    id: 'student-3',
    firstName: 'Carol',
    lastName: 'Williams',
    username: 'cwilliams',
    grade: '6',
    gradeLabel: 'Grade 6',
    schoolName: 'Washington Middle',
    screenerStatus: 'far-below' as GradeCategory,
    readinessStatus: 'not-yet-ready' as ReadinessStatus,
    lastAssessmentDate: '2024-01-13',
  },
  {
    id: 'student-4',
    firstName: 'David',
    lastName: 'Brown',
    username: 'dbrown',
    grade: '8',
    gradeLabel: 'Grade 8',
    schoolName: 'Washington Middle',
    screenerStatus: 'non-applicable' as GradeCategory,
    readinessStatus: null,
    lastAssessmentDate: null,
  },
];

// Mock Student Detail Data
export const mockStudentDetail: StudentDetailData = {
  id: 'student-1',
  firstName: 'Alice',
  lastName: 'Johnson',
  username: 'ajohnson',
  grade: '6',
  gradeLabel: 'Grade 6',
  schoolName: 'Lincoln Elementary',
  screenerStatus: 'on-or-above' as GradeCategory,
  readinessStatus: 'ready' as ReadinessStatus,
  screener: {
    subject: 'Mathematics',
    testDate: '2024-01-15',
    overallScore: 42,
    maxScore: 50,
    overallPercentage: 84,
    domains: [
      {
        domain: 'Number Operations',
        score: 14,
        maxScore: 16,
        percentage: 88,
        level: 'on-or-above' as GradeCategory,
      },
      {
        domain: 'Algebraic Thinking',
        score: 12,
        maxScore: 14,
        percentage: 86,
        level: 'on-or-above' as GradeCategory,
      },
      {
        domain: 'Geometry',
        score: 8,
        maxScore: 10,
        percentage: 80,
        level: 'below' as GradeCategory,
      },
      {
        domain: 'Data Analysis',
        score: 8,
        maxScore: 10,
        percentage: 80,
        level: 'on-or-above' as GradeCategory,
      },
    ],
  },
  readiness: {
    course: 'AP Calculus',
    courseLabel: 'AP',
    status: 'ready' as ReadinessStatus,
    score: 85,
    assessmentDate: '2024-01-15',
    prerequisitesMet: 8,
    prerequisitesTotal: 10,
    gaps: [],
  },
  recommendations: [
    'Continue advanced problem-solving activities',
    'Consider enrichment opportunities in mathematics',
  ],
};

// Mock Filters
export const mockFilters: AnalyticsFilters = {
  curriculum: 'US_COMMON_CORE_AP' as CurriculumSystem,
  schools: [],
  grades: [],
  subjects: [],
  searchQuery: '',
  dateRange: {
    start: null,
    end: null,
  },
};

// Custom render with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialFilters?: Partial<AnalyticsFilters>;
}

export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <CurriculumProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </CurriculumProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
};

// Helper to create mock students with specific statuses
export const createMockStudent = (
  overrides: Partial<StudentTableData> = {}
): StudentTableData => ({
  id: `student-${Math.random().toString(36).substr(2, 9)}`,
  firstName: 'Test',
  lastName: 'Student',
  username: 'tstudent',
  grade: '6',
  gradeLabel: 'Grade 6',
  schoolName: 'Test School',
  screenerStatus: 'on-or-above',
  readinessStatus: 'ready',
  lastAssessmentDate: new Date().toISOString(),
  ...overrides,
});

// Helper to create multiple mock students
export const createMockStudents = (count: number): StudentTableData[] => {
  const statuses: GradeCategory[] = ['on-or-above', 'below', 'far-below', 'non-applicable'];
  const readinessStatuses: (ReadinessStatus | null)[] = ['ready', 'approaching', 'not-yet-ready', null];

  return Array.from({ length: count }, (_, i) => ({
    id: `student-${i + 1}`,
    firstName: `Student${i + 1}`,
    lastName: `Test`,
    username: `student${i + 1}`,
    grade: String((i % 6) + 3), // Grades 3-8
    gradeLabel: `Grade ${(i % 6) + 3}`,
    schoolName: i % 2 === 0 ? 'Lincoln Elementary' : 'Washington Middle',
    screenerStatus: statuses[i % statuses.length],
    readinessStatus: readinessStatuses[i % readinessStatuses.length],
    lastAssessmentDate: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  }));
};

// Wait for animations to complete
export const waitForAnimations = () =>
  new Promise((resolve) => setTimeout(resolve, 350));

// Mock keyboard event helpers
export const createKeyboardEvent = (key: string, options: Partial<KeyboardEvent> = {}) => ({
  key,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  ...options,
});
