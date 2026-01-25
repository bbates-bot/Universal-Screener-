/**
 * UnifiedAnalyticsPage Component
 * Main page component for the Unified Analytics Dashboard
 * Combines Screener Dashboard and Readiness Analytics into a single view
 * Enhanced with accessibility: skip links, live regions, and keyboard navigation
 */

import React, { useMemo, useState, useEffect } from 'react';
import { AnalyticsProvider, useAnalytics } from '../context';
import { FilterBar } from './FilterBar';
import { SummaryMetrics } from './SummaryMetrics';
import { ReadinessSection } from './ReadinessSection';
import { StudentTable, StudentTableData } from './StudentTable';
import { StudentDetailPanel, StudentDetailData } from './StudentDetailPanel';
import { ErrorMessage } from './ErrorBoundary';
import { SkipLink, LiveRegion, useAnnouncer } from './common';
import { School, Student, StudentResult, ScreenerLevel } from '../../../types';
import { SummaryData, MetricType, GradeCategory, ReadinessDistribution, SkillGap, ReadinessStatus } from '../types';

interface UnifiedAnalyticsPageProps {
  students: Student[];
  results: StudentResult[];
  schools: School[];
  isLoading?: boolean;
}

// Inner component that uses analytics context
const UnifiedAnalyticsContent: React.FC<UnifiedAnalyticsPageProps> = ({
  students,
  results,
  schools,
  isLoading: externalLoading = false,
}) => {
  const { state, actions } = useAnalytics();
  const { filters, viewMode, selectedStudentId, activeMetricFilter, isReadinessSectionCollapsed, pagination, sort } = state;

  // Announcer for screen reader updates
  const { announce, Announcer } = useAnnouncer();

  // Internal loading state for data processing
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate processing delay when filters change
  useEffect(() => {
    setIsProcessing(true);
    const timer = setTimeout(() => setIsProcessing(false), 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const isLoading = externalLoading || isProcessing;

  // Announce filter changes to screen readers
  useEffect(() => {
    if (!isProcessing) {
      const activeFilters = [
        filters.schools.length > 0 ? `${filters.schools.length} school${filters.schools.length > 1 ? 's' : ''}` : null,
        filters.grades.length > 0 ? `${filters.grades.length} grade${filters.grades.length > 1 ? 's' : ''}` : null,
        filters.subjects.length > 0 ? `${filters.subjects.length} subject${filters.subjects.length > 1 ? 's' : ''}` : null,
        filters.searchQuery ? 'search query' : null,
      ].filter(Boolean);

      if (activeFilters.length > 0) {
        announce(`Filters applied: ${activeFilters.join(', ')}.`);
      }
    }
  }, [filters, isProcessing, announce]);

  // Filter students based on current filters
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Filter by school
      if (filters.schools.length > 0 && !filters.schools.includes(student.schoolId)) {
        return false;
      }

      // Filter by grade
      if (filters.grades.length > 0 && !filters.grades.includes(student.grade)) {
        return false;
      }

      // Filter by search query
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const username = student.username.toLowerCase();

        if (!fullName.includes(searchLower) && !username.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [students, filters]);

  // Filter results based on current filters
  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      // Filter by curriculum (Edexcel vs US subjects)
      const isEdexcel = filters.curriculum === 'EDEXCEL_INTERNATIONAL';
      const isEdexcelSubject = result.subject.includes('Edexcel');

      if (isEdexcel && !isEdexcelSubject) return false;
      if (!isEdexcel && isEdexcelSubject) return false;

      // Filter by subject if specified
      if (filters.subjects.length > 0) {
        const subjectId = result.subject.toLowerCase().replace(/\s+/g, '-');
        if (!filters.subjects.some((s) => s.includes(subjectId) || subjectId.includes(s))) {
          return false;
        }
      }

      return true;
    });
  }, [results, filters]);

  // Get student's grade category based on their latest result
  const getStudentGradeCategory = (student: Student): GradeCategory => {
    const studentResults = filteredResults.filter(
      (r) =>
        (r as any).studentId === student.id ||
        r.username === student.username ||
        (r.firstName.toLowerCase() === student.firstName.toLowerCase() &&
          r.lastName.toLowerCase() === student.lastName.toLowerCase())
    );

    if (studentResults.length === 0) {
      return 'non-applicable';
    }

    const latestResult = studentResults.sort(
      (a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    )[0];

    switch (latestResult.overallLevel) {
      case ScreenerLevel.ON_ABOVE:
        return 'on-or-above';
      case ScreenerLevel.BELOW:
        return 'below';
      case ScreenerLevel.FAR_BELOW:
        return 'far-below';
      default:
        return 'non-applicable';
    }
  };

  // Calculate summary metrics
  const summaryData = useMemo((): SummaryData => {
    const summary = {
      total: filteredStudents.length,
      onOrAboveGrade: 0,
      belowGrade: 0,
      farBelowGrade: 0,
      nonApplicable: 0,
    };

    filteredStudents.forEach((student) => {
      const category = getStudentGradeCategory(student);

      switch (category) {
        case 'on-or-above':
          summary.onOrAboveGrade++;
          break;
        case 'below':
          summary.belowGrade++;
          break;
        case 'far-below':
          summary.farBelowGrade++;
          break;
        default:
          summary.nonApplicable++;
      }
    });

    return summary;
  }, [filteredStudents, filteredResults]);

  // Generate readiness distribution data based on filtered students
  const readinessData = useMemo((): ReadinessDistribution => {
    // Map screener levels to readiness status
    let ready = 0;
    let approaching = 0;
    let notYetReady = 0;

    filteredStudents.forEach((student) => {
      const category = getStudentGradeCategory(student);

      switch (category) {
        case 'on-or-above':
          ready++;
          break;
        case 'below':
          approaching++;
          break;
        case 'far-below':
        case 'non-applicable':
          notYetReady++;
          break;
      }
    });

    return { ready, approaching, notYetReady };
  }, [filteredStudents, filteredResults]);

  // Generate skill gaps data based on filtered results
  const skillGapsData = useMemo((): SkillGap[] => {
    // Mock skill gaps data - in production this would come from actual assessment data
    const mockGaps: SkillGap[] = [
      {
        domain: 'Number Operations',
        code: 'NBT.5',
        description: 'Fluently multiply multi-digit whole numbers',
        percentage: Math.min(100, Math.max(10, Math.round((summaryData.farBelowGrade / Math.max(1, summaryData.total)) * 200))),
        studentCount: summaryData.farBelowGrade,
      },
      {
        domain: 'Algebraic Expressions',
        code: 'EE.2',
        description: 'Write, read, and evaluate expressions',
        percentage: Math.min(100, Math.max(5, Math.round((summaryData.belowGrade / Math.max(1, summaryData.total)) * 150))),
        studentCount: summaryData.belowGrade,
      },
      {
        domain: 'Fractions & Decimals',
        code: 'NF.3',
        description: 'Add and subtract fractions with unlike denominators',
        percentage: Math.min(100, Math.max(5, Math.round(((summaryData.farBelowGrade + summaryData.belowGrade) / Math.max(1, summaryData.total)) * 100))),
        studentCount: summaryData.farBelowGrade + summaryData.belowGrade,
      },
      {
        domain: 'Ratios & Proportions',
        code: 'RP.1',
        description: 'Understand ratio concepts and use ratio reasoning',
        percentage: Math.min(100, Math.max(5, Math.round((summaryData.belowGrade / Math.max(1, summaryData.total)) * 120))),
        studentCount: Math.round(summaryData.belowGrade * 0.7),
      },
      {
        domain: 'Geometry',
        code: 'G.1',
        description: 'Solve problems involving area, surface area, and volume',
        percentage: Math.min(100, Math.max(5, Math.round((summaryData.farBelowGrade / Math.max(1, summaryData.total)) * 80))),
        studentCount: Math.round(summaryData.farBelowGrade * 0.6),
      },
      {
        domain: 'Statistics & Probability',
        code: 'SP.1',
        description: 'Develop understanding of statistical variability',
        percentage: Math.min(100, Math.max(5, Math.round((summaryData.belowGrade / Math.max(1, summaryData.total)) * 60))),
        studentCount: Math.round(summaryData.belowGrade * 0.4),
      },
    ];

    // Only return gaps if we have students with below-grade performance
    if (summaryData.belowGrade + summaryData.farBelowGrade === 0) {
      return [];
    }

    return mockGaps.filter((gap) => gap.percentage > 0);
  }, [summaryData]);

  // Get student's readiness status based on their screener category
  const getStudentReadinessStatus = (category: GradeCategory): ReadinessStatus | null => {
    switch (category) {
      case 'on-or-above':
        return 'ready';
      case 'below':
        return 'approaching';
      case 'far-below':
        return 'not-yet-ready';
      default:
        return null;
    }
  };

  // Get student's last assessment date
  const getStudentLastAssessmentDate = (student: Student): string | null => {
    const studentResults = filteredResults.filter(
      (r) =>
        (r as any).studentId === student.id ||
        r.username === student.username ||
        (r.firstName.toLowerCase() === student.firstName.toLowerCase() &&
          r.lastName.toLowerCase() === student.lastName.toLowerCase())
    );

    if (studentResults.length === 0) return null;

    const latestResult = studentResults.sort(
      (a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
    )[0];

    return latestResult.testDate;
  };

  // Filter students by active metric
  const displayStudents = useMemo(() => {
    if (!activeMetricFilter || activeMetricFilter === 'total') {
      return filteredStudents;
    }

    return filteredStudents.filter((student) => {
      const category = getStudentGradeCategory(student);

      switch (activeMetricFilter) {
        case 'onOrAbove':
          return category === 'on-or-above';
        case 'below':
          return category === 'below';
        case 'farBelow':
          return category === 'far-below';
        case 'nonApplicable':
          return category === 'non-applicable';
        default:
          return true;
      }
    });
  }, [filteredStudents, activeMetricFilter]);

  // Transform students to table data format
  const tableData = useMemo((): StudentTableData[] => {
    return displayStudents.map((student) => {
      const category = getStudentGradeCategory(student);
      const school = schools.find((s) => s.id === student.schoolId);

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        username: student.username,
        grade: student.grade,
        gradeLabel: `Grade ${student.grade}`,
        schoolName: school?.name || 'Unknown School',
        screenerStatus: category,
        readinessStatus: getStudentReadinessStatus(category),
        lastAssessmentDate: getStudentLastAssessmentDate(student),
      };
    });
  }, [displayStudents, schools, filteredResults]);

  // Build selected student detail data
  const selectedStudentDetail = useMemo((): StudentDetailData | null => {
    if (!selectedStudentId) return null;

    const student = students.find((s) => s.id === selectedStudentId);
    if (!student) return null;

    const category = getStudentGradeCategory(student);
    const school = schools.find((s) => s.id === student.schoolId);
    const readinessStatus = getStudentReadinessStatus(category);

    // Get student's screener results
    const studentResults = filteredResults.filter(
      (r) =>
        (r as any).studentId === student.id ||
        r.username === student.username ||
        (r.firstName.toLowerCase() === student.firstName.toLowerCase() &&
          r.lastName.toLowerCase() === student.lastName.toLowerCase())
    );

    const latestResult = studentResults.length > 0
      ? studentResults.sort(
          (a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
        )[0]
      : null;

    // Build screener data
    const screenerData = latestResult ? {
      subject: latestResult.subject,
      testDate: latestResult.testDate,
      overallScore: latestResult.totalCorrect,
      maxScore: latestResult.totalQuestions,
      overallPercentage: Math.round((latestResult.totalCorrect / latestResult.totalQuestions) * 100),
      domains: latestResult.domains?.map((d: any) => ({
        domain: d.name || d.domain,
        score: d.correct || d.score,
        maxScore: d.total || d.maxScore,
        percentage: Math.round(((d.correct || d.score) / (d.total || d.maxScore)) * 100),
        level: d.level === ScreenerLevel.ON_ABOVE ? 'on-or-above' as GradeCategory :
               d.level === ScreenerLevel.BELOW ? 'below' as GradeCategory :
               d.level === ScreenerLevel.FAR_BELOW ? 'far-below' as GradeCategory :
               'non-applicable' as GradeCategory,
      })) || [],
    } : null;

    // Build mock readiness data based on screener status
    const readinessData = readinessStatus ? {
      course: filters.curriculum === 'EDEXCEL_INTERNATIONAL' ? 'IGCSE Mathematics' : 'AP Calculus',
      courseLabel: filters.curriculum === 'EDEXCEL_INTERNATIONAL' ? 'IGCSE' : 'AP',
      status: readinessStatus,
      score: category === 'on-or-above' ? 85 : category === 'below' ? 65 : 45,
      assessmentDate: latestResult?.testDate || new Date().toISOString(),
      prerequisitesMet: category === 'on-or-above' ? 8 : category === 'below' ? 6 : 3,
      prerequisitesTotal: 10,
      gaps: category !== 'on-or-above' ? [
        {
          code: 'NBT.5',
          standard: 'Fluently multiply multi-digit whole numbers',
          description: 'Student needs practice with multi-digit multiplication strategies',
          domain: 'Number Operations',
        },
        ...(category === 'far-below' ? [
          {
            code: 'NF.3',
            standard: 'Add and subtract fractions with unlike denominators',
            description: 'Student requires intervention on fraction operations',
            domain: 'Fractions',
          },
        ] : []),
      ] : [],
    } : null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      username: student.username,
      grade: student.grade,
      gradeLabel: `Grade ${student.grade}`,
      schoolName: school?.name || 'Unknown School',
      screenerStatus: category,
      readinessStatus,
      screener: screenerData,
      readiness: readinessData,
      recommendations: [],
    };
  }, [selectedStudentId, students, schools, filteredResults, filters.curriculum]);

  // Handle metric card click
  const handleMetricClick = (metric: MetricType | null) => {
    actions.setActiveMetricFilter(metric);
  };

  // Handle closing the detail panel
  const handleCloseDetailPanel = () => {
    actions.selectStudent(null);
  };

  return (
    <>
      {/* Screen Reader Announcer */}
      <Announcer />

      {/* Skip Links for Keyboard Navigation */}
      <SkipLink href="#main-content" label="Skip to main content" />
      <SkipLink href="#student-table" label="Skip to student table" />
      <SkipLink href="#filters" label="Skip to filters" />

      <div className="space-y-8 animate-in fade-in duration-500" id="main-content" role="main">
        {/* Page Header */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Student Analytics</h1>
            <p className="text-slate-500">
              Unified view of screener results and readiness assessments
            </p>
          </div>

          {/* View mode indicator */}
          {viewMode === 'individual-student' && selectedStudentId && (
            <button
              onClick={() => actions.selectStudent(null)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              aria-label="Close student detail panel and return to all students view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Students
            </button>
          )}
        </header>

      {/* Filter Bar */}
      <section id="filters" aria-label="Student filters">
        <FilterBar schools={schools} />
      </section>

      {/* Summary Metrics */}
      <SummaryMetrics
        data={summaryData}
        isLoading={isLoading}
        onMetricClick={handleMetricClick}
        activeMetric={activeMetricFilter}
      />

      {/* Readiness Analytics Section */}
      <ReadinessSection
        readinessData={readinessData}
        skillGapsData={skillGapsData}
        curriculum={filters.curriculum}
        isLoading={isLoading}
        isCollapsed={isReadinessSectionCollapsed}
        onToggleCollapse={() => actions.toggleReadinessSection()}
      />

      {/* Student Table */}
      <section id="student-table" aria-label="Student results">
        <StudentTable
          students={tableData}
          isLoading={isLoading}
          sort={sort}
          onSort={actions.setSort}
          pagination={pagination}
          onPageChange={actions.setPage}
          onPageSizeChange={actions.setPageSize}
          selectedStudentId={selectedStudentId}
          onSelectStudent={actions.selectStudent}
        />
      </section>

      {/* Student Detail Panel */}
      <StudentDetailPanel
        student={selectedStudentDetail}
        isOpen={!!selectedStudentId}
        isLoading={isLoading}
        onClose={handleCloseDetailPanel}
      />
      </div>
    </>
  );
};

// Main component with provider
export const UnifiedAnalyticsPage: React.FC<UnifiedAnalyticsPageProps> = (props) => {
  return (
    <AnalyticsProvider>
      <UnifiedAnalyticsContent {...props} />
    </AnalyticsProvider>
  );
};

export default UnifiedAnalyticsPage;
