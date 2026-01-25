/**
 * useAnalyticsData Hook
 * Custom hook for fetching and managing analytics data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAnalyticsData,
  clearAnalyticsCache,
  calculateSummaryData,
  calculateReadinessDistribution,
  calculateSkillGaps,
  transformToStudentData,
} from '../services/analyticsApi';
import { Student, StudentResult, School } from '../../../types';
import {
  SummaryData,
  ReadinessDistribution,
  SkillGap,
  StudentData,
  FilterState,
} from '../types';

interface UseAnalyticsDataOptions {
  filters: FilterState;
  enabled?: boolean;
  refetchInterval?: number;
}

interface UseAnalyticsDataResult {
  // Data
  students: Student[];
  results: StudentResult[];
  schools: School[];
  summary: SummaryData | null;
  readiness: ReadinessDistribution | null;
  skillGaps: SkillGap[];
  studentData: StudentData[];

  // Status
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;

  // Actions
  refetch: () => Promise<void>;
  clearCache: () => void;
}

export const useAnalyticsData = ({
  filters,
  enabled = true,
  refetchInterval,
}: UseAnalyticsDataOptions): UseAnalyticsDataResult => {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [readiness, setReadiness] = useState<ReadinessDistribution | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [studentData, setStudentData] = useState<StudentData[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Refs for cleanup and tracking
  const abortControllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch data function
  const fetchData = useCallback(async (showLoading = true) => {
    if (!enabled) return;

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setIsFetching(true);
      setIsError(false);
      setError(null);

      const data = await fetchAnalyticsData({
        curriculum: filters.curriculum,
        schoolIds: filters.schools.length > 0 ? filters.schools : undefined,
        gradeIds: filters.grades.length > 0 ? filters.grades : undefined,
        subjectIds: filters.subjects.length > 0 ? filters.subjects : undefined,
        searchQuery: filters.searchQuery || undefined,
        page: 1,
        pageSize: 100,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      // Only update state if component is still mounted
      if (mountedRef.current) {
        setStudents(data.students);
        setResults(data.results);
        setSchools(data.schools);
        setSummary(data.summary);
        setReadiness(data.readiness);
        setSkillGaps(data.skillGaps);

        // Transform to student data format
        const transformed = transformToStudentData(
          data.students,
          data.results,
          data.schools
        );
        setStudentData(transformed);
      }
    } catch (err) {
      if (mountedRef.current && err instanceof Error && err.name !== 'AbortError') {
        setIsError(true);
        setError(err);
        console.error('Analytics data fetch error:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [enabled, filters]);

  // Initial fetch and filter changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Setup refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(false);
      }, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Manual refetch
  const refetch = useCallback(async () => {
    clearAnalyticsCache();
    await fetchData();
  }, [fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    clearAnalyticsCache();
  }, []);

  return {
    students,
    results,
    schools,
    summary,
    readiness,
    skillGaps,
    studentData,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    clearCache,
  };
};

export default useAnalyticsData;
