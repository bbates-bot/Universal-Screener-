/**
 * Tests for Analytics Context
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsProvider, useAnalytics } from '../context';
import { CurriculumSystem } from '../types';

describe('AnalyticsContext', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AnalyticsProvider>{children}</AnalyticsProvider>
  );

  describe('Initial State', () => {
    it('provides initial state values', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      expect(result.current.state.filters.curriculum).toBe('EDEXCEL_INTERNATIONAL');
      expect(result.current.state.filters.schools).toEqual([]);
      expect(result.current.state.filters.grades).toEqual([]);
      expect(result.current.state.filters.subjects).toEqual([]);
      expect(result.current.state.filters.searchQuery).toBe('');
      expect(result.current.state.selectedStudentId).toBeNull();
      expect(result.current.state.viewMode).toBe('school-wide');
    });

    it('provides initial pagination state', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      expect(result.current.state.pagination.currentPage).toBe(1);
      expect(result.current.state.pagination.pageSize).toBe(20);
    });

    it('provides initial sort state', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      expect(result.current.state.sort.column).toBe('lastName');
      expect(result.current.state.sort.direction).toBe('asc');
    });
  });

  describe('Filter Actions', () => {
    it('updates curriculum filter', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setCurriculum('EDEXCEL_INTERNATIONAL' as CurriculumSystem);
      });

      expect(result.current.state.filters.curriculum).toBe('EDEXCEL_INTERNATIONAL');
    });

    it('updates schools filter', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setFilters({ schools: ['school-1', 'school-2'] });
      });

      expect(result.current.state.filters.schools).toEqual(['school-1', 'school-2']);
    });

    it('updates grades filter', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setFilters({ grades: ['6', '7', '8'] });
      });

      expect(result.current.state.filters.grades).toEqual(['6', '7', '8']);
    });

    it('updates subjects filter', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setFilters({ subjects: ['math', 'ela'] });
      });

      expect(result.current.state.filters.subjects).toEqual(['math', 'ela']);
    });

    it('updates search query', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setFilters({ searchQuery: 'alice' });
      });

      expect(result.current.state.filters.searchQuery).toBe('alice');
    });

    it('resets filters to initial state', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      // Set some filters
      act(() => {
        result.current.actions.setFilters({
          schools: ['school-1'],
          grades: ['6'],
          searchQuery: 'test',
        });
      });

      // Reset
      act(() => {
        result.current.actions.resetFilters();
      });

      expect(result.current.state.filters.schools).toEqual([]);
      expect(result.current.state.filters.grades).toEqual([]);
      expect(result.current.state.filters.searchQuery).toBe('');
    });
  });

  describe('Student Selection', () => {
    it('selects a student', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.selectStudent('student-123');
      });

      expect(result.current.state.selectedStudentId).toBe('student-123');
      expect(result.current.state.viewMode).toBe('individual-student');
    });

    it('deselects student when selecting null', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.selectStudent('student-123');
      });

      act(() => {
        result.current.actions.selectStudent(null);
      });

      expect(result.current.state.selectedStudentId).toBeNull();
      expect(result.current.state.viewMode).toBe('school-wide');
    });
  });

  describe('Pagination Actions', () => {
    it('updates current page', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setPage(3);
      });

      expect(result.current.state.pagination.currentPage).toBe(3);
    });

    it('updates page size and resets to page 1', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setPage(5);
      });

      act(() => {
        result.current.actions.setPageSize(25);
      });

      expect(result.current.state.pagination.pageSize).toBe(25);
      expect(result.current.state.pagination.currentPage).toBe(1);
    });
  });

  describe('Sort Actions', () => {
    it('updates sort column and direction', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setSort('grade', 'desc');
      });

      expect(result.current.state.sort.column).toBe('grade');
      expect(result.current.state.sort.direction).toBe('desc');
    });

    it('resets page when sorting changes', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setPage(5);
      });

      act(() => {
        result.current.actions.setSort('name', 'asc');
      });

      expect(result.current.state.pagination.currentPage).toBe(1);
    });
  });

  describe('Metric Filter', () => {
    it('sets active metric filter', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setActiveMetricFilter('onOrAbove');
      });

      expect(result.current.state.activeMetricFilter).toBe('onOrAbove');
    });

    it('clears metric filter when set to null', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      act(() => {
        result.current.actions.setActiveMetricFilter('below');
      });

      act(() => {
        result.current.actions.setActiveMetricFilter(null);
      });

      expect(result.current.state.activeMetricFilter).toBeNull();
    });
  });

  describe('Readiness Section Toggle', () => {
    it('toggles readiness section collapsed state', () => {
      const { result } = renderHook(() => useAnalytics(), { wrapper });

      const initial = result.current.state.isReadinessSectionCollapsed;

      act(() => {
        result.current.actions.toggleReadinessSection();
      });

      expect(result.current.state.isReadinessSectionCollapsed).toBe(!initial);

      act(() => {
        result.current.actions.toggleReadinessSection();
      });

      expect(result.current.state.isReadinessSectionCollapsed).toBe(initial);
    });
  });

  describe('Error Handling', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAnalytics());
      }).toThrow('useAnalytics must be used within an AnalyticsProvider');

      consoleSpy.mockRestore();
    });
  });
});
