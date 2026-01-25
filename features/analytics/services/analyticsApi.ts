/**
 * Analytics API Service
 * Handles data fetching and caching for the analytics dashboard
 */

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Student, StudentResult, School, ScreenerLevel } from '../../../types';
import { CurriculumSystem } from '../../../types/curriculum';
import {
  SummaryData,
  ReadinessDistribution,
  SkillGap,
  StudentData,
  GradeCategory,
  ReadinessStatus,
  AnalyticsQueryParams,
} from '../types';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

/**
 * Generate cache key from query params
 */
const getCacheKey = (prefix: string, params: Record<string, any>): string => {
  return `${prefix}:${JSON.stringify(params)}`;
};

/**
 * Check if cached data is still valid
 */
const isCacheValid = (key: string): boolean => {
  const cached = cache.get(key);
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_TTL;
};

/**
 * Get data from cache
 */
const getFromCache = <T>(key: string): T | null => {
  if (!isCacheValid(key)) {
    cache.delete(key);
    return null;
  }
  return cache.get(key)?.data as T;
};

/**
 * Set data in cache
 */
const setInCache = <T>(key: string, data: T): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Clear all cached data
 */
export const clearAnalyticsCache = (): void => {
  cache.clear();
};

/**
 * Clear specific cache entries by prefix
 */
export const clearCacheByPrefix = (prefix: string): void => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

// ============================================
// Data Fetching Functions
// ============================================

/**
 * Fetch all schools
 */
export const fetchSchools = async (): Promise<School[]> => {
  const cacheKey = 'schools:all';
  const cached = getFromCache<School[]>(cacheKey);
  if (cached) return cached;

  try {
    const schoolsRef = collection(db, 'schools');
    const snapshot = await getDocs(schoolsRef);

    const schools: School[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as School));

    setInCache(cacheKey, schools);
    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw new Error('Failed to fetch schools');
  }
};

/**
 * Fetch students with optional filters
 */
export const fetchStudents = async (params: {
  schoolIds?: string[];
  gradeIds?: string[];
  searchQuery?: string;
}): Promise<Student[]> => {
  const cacheKey = getCacheKey('students', params);
  const cached = getFromCache<Student[]>(cacheKey);
  if (cached) return cached;

  try {
    const studentsRef = collection(db, 'students');
    const constraints: QueryConstraint[] = [];

    // Apply school filter
    if (params.schoolIds && params.schoolIds.length > 0) {
      constraints.push(where('schoolId', 'in', params.schoolIds.slice(0, 10))); // Firestore limit
    }

    const q = constraints.length > 0
      ? query(studentsRef, ...constraints)
      : query(studentsRef);

    const snapshot = await getDocs(q);

    let students: Student[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Student));

    // Apply grade filter (client-side for flexibility)
    if (params.gradeIds && params.gradeIds.length > 0) {
      students = students.filter((s) => params.gradeIds!.includes(s.grade));
    }

    // Apply search filter (client-side)
    if (params.searchQuery) {
      const searchLower = params.searchQuery.toLowerCase();
      students = students.filter((s) => {
        const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
        return fullName.includes(searchLower) || s.username.toLowerCase().includes(searchLower);
      });
    }

    setInCache(cacheKey, students);
    return students;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to fetch students');
  }
};

/**
 * Fetch screener results with optional filters
 */
export const fetchResults = async (params: {
  curriculum?: CurriculumSystem;
  subjectIds?: string[];
  studentIds?: string[];
}): Promise<StudentResult[]> => {
  const cacheKey = getCacheKey('results', params);
  const cached = getFromCache<StudentResult[]>(cacheKey);
  if (cached) return cached;

  try {
    // Fetch from both general and Edexcel collections
    const generalResultsRef = collection(db, 'generalScreenerResults');
    const edexcelResultsRef = collection(db, 'edexcelScreenerResults');

    const [generalSnapshot, edexcelSnapshot] = await Promise.all([
      getDocs(generalResultsRef),
      getDocs(edexcelResultsRef),
    ]);

    let results: StudentResult[] = [
      ...generalSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as StudentResult)),
      ...edexcelSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as StudentResult)),
    ];

    // Filter by curriculum
    if (params.curriculum) {
      const isEdexcel = params.curriculum === 'EDEXCEL_INTERNATIONAL';
      results = results.filter((r) => {
        const isEdexcelSubject = r.subject.includes('Edexcel');
        return isEdexcel ? isEdexcelSubject : !isEdexcelSubject;
      });
    }

    // Filter by subjects
    if (params.subjectIds && params.subjectIds.length > 0) {
      results = results.filter((r) => {
        const subjectId = r.subject.toLowerCase().replace(/\s+/g, '-');
        return params.subjectIds!.some(
          (s) => s.includes(subjectId) || subjectId.includes(s)
        );
      });
    }

    // Filter by student IDs
    if (params.studentIds && params.studentIds.length > 0) {
      results = results.filter((r) =>
        params.studentIds!.includes((r as any).studentId)
      );
    }

    setInCache(cacheKey, results);
    return results;
  } catch (error) {
    console.error('Error fetching results:', error);
    throw new Error('Failed to fetch results');
  }
};

// ============================================
// Analytics Calculation Functions
// ============================================

/**
 * Calculate summary metrics from students and results
 */
export const calculateSummaryData = (
  students: Student[],
  results: StudentResult[]
): SummaryData => {
  const summary: SummaryData = {
    total: students.length,
    onOrAboveGrade: 0,
    belowGrade: 0,
    farBelowGrade: 0,
    nonApplicable: 0,
  };

  students.forEach((student) => {
    const category = getStudentCategory(student, results);

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
};

/**
 * Calculate readiness distribution from students and results
 */
export const calculateReadinessDistribution = (
  students: Student[],
  results: StudentResult[]
): ReadinessDistribution => {
  let ready = 0;
  let approaching = 0;
  let notYetReady = 0;

  students.forEach((student) => {
    const category = getStudentCategory(student, results);

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
};

/**
 * Calculate skill gaps from results
 */
export const calculateSkillGaps = (
  results: StudentResult[],
  summaryData: SummaryData
): SkillGap[] => {
  if (summaryData.belowGrade + summaryData.farBelowGrade === 0) {
    return [];
  }

  // Aggregate domain-level data from results
  const domainGaps = new Map<string, { count: number; total: number; description: string }>();

  results.forEach((result) => {
    const resultWithDomains = result as any;
    if (resultWithDomains.domains) {
      resultWithDomains.domains.forEach((domain: any) => {
        const domainName = domain.name || domain.domain;
        const existing = domainGaps.get(domainName) || { count: 0, total: 0, description: '' };

        const percentage = ((domain.correct || domain.score) / (domain.total || domain.maxScore)) * 100;
        if (percentage < 70) {
          existing.count++;
        }
        existing.total++;
        existing.description = domain.description || `Skills related to ${domainName}`;

        domainGaps.set(domainName, existing);
      });
    }
  });

  // Convert to SkillGap array
  const gaps: SkillGap[] = Array.from(domainGaps.entries())
    .map(([domain, data]) => ({
      domain,
      code: domain.split(' ').map((w) => w[0]).join('').toUpperCase(),
      description: data.description,
      percentage: data.total > 0 ? Math.round((data.count / data.total) * 100) : 0,
      studentCount: data.count,
    }))
    .filter((gap) => gap.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 8);

  return gaps;
};

/**
 * Get student's grade category based on their latest result
 */
export const getStudentCategory = (
  student: Student,
  results: StudentResult[]
): GradeCategory => {
  const studentResults = results.filter(
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

/**
 * Get readiness status from grade category
 */
export const getReadinessStatus = (category: GradeCategory): ReadinessStatus | null => {
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

/**
 * Transform students to table data format
 */
export const transformToStudentData = (
  students: Student[],
  results: StudentResult[],
  schools: School[]
): StudentData[] => {
  return students.map((student) => {
    const category = getStudentCategory(student, results);
    const school = schools.find((s) => s.id === student.schoolId);

    const studentResults = results.filter(
      (r) =>
        (r as any).studentId === student.id ||
        r.username === student.username
    );

    const latestResult = studentResults.length > 0
      ? studentResults.sort(
          (a, b) => new Date(b.testDate).getTime() - new Date(a.testDate).getTime()
        )[0]
      : null;

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      username: student.username,
      grade: student.grade,
      gradeLabel: `Grade ${student.grade}`,
      schoolId: student.schoolId,
      schoolName: school?.name || 'Unknown School',
      screenerStatus: category,
      readinessStatus: getReadinessStatus(category),
      readinessScore: category === 'on-or-above' ? 85 : category === 'below' ? 65 : category === 'far-below' ? 45 : null,
      lastAssessmentDate: latestResult?.testDate || null,
    };
  });
};

// ============================================
// Aggregated Data Fetching
// ============================================

/**
 * Fetch all analytics data in one call
 */
export const fetchAnalyticsData = async (params: AnalyticsQueryParams): Promise<{
  students: Student[];
  results: StudentResult[];
  schools: School[];
  summary: SummaryData;
  readiness: ReadinessDistribution;
  skillGaps: SkillGap[];
}> => {
  try {
    // Fetch base data in parallel
    const [schools, students, results] = await Promise.all([
      fetchSchools(),
      fetchStudents({
        schoolIds: params.schoolIds,
        gradeIds: params.gradeIds,
        searchQuery: params.searchQuery,
      }),
      fetchResults({
        curriculum: params.curriculum,
        subjectIds: params.subjectIds,
      }),
    ]);

    // Calculate derived data
    const summary = calculateSummaryData(students, results);
    const readiness = calculateReadinessDistribution(students, results);
    const skillGaps = calculateSkillGaps(results, summary);

    return {
      students,
      results,
      schools,
      summary,
      readiness,
      skillGaps,
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export default {
  fetchSchools,
  fetchStudents,
  fetchResults,
  fetchAnalyticsData,
  calculateSummaryData,
  calculateReadinessDistribution,
  calculateSkillGaps,
  getStudentCategory,
  getReadinessStatus,
  transformToStudentData,
  clearAnalyticsCache,
  clearCacheByPrefix,
};
