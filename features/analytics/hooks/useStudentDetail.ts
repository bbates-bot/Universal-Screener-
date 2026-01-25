/**
 * useStudentDetail Hook
 * Custom hook for fetching and managing individual student detail data
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Student, StudentResult, School, ScreenerLevel } from '../../../types';
import { GradeCategory, ReadinessStatus } from '../types';
import { StudentDetailData } from '../components/StudentDetailPanel';
import { getStudentCategory, getReadinessStatus } from '../services/analyticsApi';
import { CurriculumSystem } from '../../../types/curriculum';

interface UseStudentDetailOptions {
  studentId: string | null;
  students: Student[];
  results: StudentResult[];
  schools: School[];
  curriculum: CurriculumSystem;
}

interface UseStudentDetailResult {
  studentDetail: StudentDetailData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useStudentDetail = ({
  studentId,
  students,
  results,
  schools,
  curriculum,
}: UseStudentDetailOptions): UseStudentDetailResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Build student detail data
  const studentDetail = useMemo((): StudentDetailData | null => {
    if (!studentId) return null;

    setIsLoading(true);

    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        setIsLoading(false);
        return null;
      }

      const category = getStudentCategory(student, results);
      const school = schools.find((s) => s.id === student.schoolId);
      const readinessStatus = getReadinessStatus(category);

      // Get student's screener results
      const studentResults = results.filter(
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

      // Build screener data (cast to any for dynamic property access)
      const resultData = latestResult as any;
      const screenerData = latestResult ? {
        subject: latestResult.subject,
        testDate: latestResult.testDate,
        overallScore: resultData.totalCorrect || 0,
        maxScore: resultData.totalQuestions || 1,
        overallPercentage: Math.round(((resultData.totalCorrect || 0) / (resultData.totalQuestions || 1)) * 100),
        domains: resultData.domains?.map((d: any) => ({
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

      // Build readiness data based on screener status
      const readinessData = readinessStatus ? {
        course: curriculum === 'EDEXCEL_INTERNATIONAL' ? 'IGCSE Mathematics' : 'AP Calculus',
        courseLabel: curriculum === 'EDEXCEL_INTERNATIONAL' ? 'IGCSE' : 'AP',
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
            {
              code: 'EE.2',
              standard: 'Write and evaluate numerical expressions',
              description: 'Student needs support with expression evaluation',
              domain: 'Expressions & Equations',
            },
          ] : []),
        ] : [],
      } : null;

      setIsLoading(false);
      setIsError(false);
      setError(null);

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
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Failed to load student detail'));
      return null;
    }
  }, [studentId, students, results, schools, curriculum]);

  return {
    studentDetail,
    isLoading,
    isError,
    error,
  };
};

export default useStudentDetail;
