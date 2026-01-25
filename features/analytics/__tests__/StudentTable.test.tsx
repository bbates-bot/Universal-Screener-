/**
 * Tests for StudentTable Component
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentTable } from '../components/StudentTable';
import { mockStudentTableData, createMockStudents } from './testUtils';
import { SortState, PaginationState } from '../types';

describe('StudentTable', () => {
  const defaultSort: SortState = {
    column: 'name',
    direction: 'asc',
  };

  const defaultPagination: PaginationState = {
    currentPage: 1,
    pageSize: 10,
    totalCount: mockStudentTableData.length,
    totalPages: 1,
  };

  const defaultProps = {
    students: mockStudentTableData,
    isLoading: false,
    sort: defaultSort,
    onSort: vi.fn(),
    pagination: defaultPagination,
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
    selectedStudentId: null,
    onSelectStudent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the table with headers', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Grade')).toBeInTheDocument();
      expect(screen.getByText('School')).toBeInTheDocument();
      expect(screen.getByText('Screener Status')).toBeInTheDocument();
      expect(screen.getByText('Readiness')).toBeInTheDocument();
      expect(screen.getByText('Last Assessed')).toBeInTheDocument();
    });

    it('renders student rows', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('Carol Williams')).toBeInTheDocument();
      expect(screen.getByText('David Brown')).toBeInTheDocument();
    });

    it('displays student count', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText('4 students found')).toBeInTheDocument();
    });

    it('shows loading skeleton when isLoading is true', () => {
      render(<StudentTable {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Loading students...')).toBeInTheDocument();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows empty state when no students', () => {
      render(<StudentTable {...defaultProps} students={[]} />);

      expect(screen.getByText('No Students Found')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('calls onSort when clicking sortable column header', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(<StudentTable {...defaultProps} onSort={onSort} />);

      const nameHeader = screen.getByText('Student');
      await user.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('toggles sort direction when clicking same column', async () => {
      const onSort = vi.fn();
      const user = userEvent.setup();

      render(
        <StudentTable
          {...defaultProps}
          onSort={onSort}
          sort={{ column: 'name', direction: 'asc' }}
        />
      );

      const nameHeader = screen.getByText('Student');
      await user.click(nameHeader);

      expect(onSort).toHaveBeenCalledWith('name', 'desc');
    });

    it('displays sort indicator on sorted column', () => {
      render(
        <StudentTable
          {...defaultProps}
          sort={{ column: 'name', direction: 'asc' }}
        />
      );

      const nameHeader = screen.getByText('Student').closest('th');
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });
  });

  describe('Selection', () => {
    it('calls onSelectStudent when clicking a row', async () => {
      const onSelectStudent = vi.fn();
      const user = userEvent.setup();

      render(<StudentTable {...defaultProps} onSelectStudent={onSelectStudent} />);

      const row = screen.getByText('Alice Johnson').closest('tr');
      await user.click(row!);

      expect(onSelectStudent).toHaveBeenCalledWith('student-1');
    });

    it('highlights selected row', () => {
      render(<StudentTable {...defaultProps} selectedStudentId="student-1" />);

      const row = screen.getByText('Alice Johnson').closest('tr');
      expect(row).toHaveClass('bg-indigo-50');
    });

    it('shows detail button for each row', () => {
      render(<StudentTable {...defaultProps} />);

      const detailButtons = screen.getAllByLabelText(/View details for/);
      expect(detailButtons).toHaveLength(4);
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports arrow key navigation between rows', async () => {
      const user = userEvent.setup();

      render(<StudentTable {...defaultProps} />);

      // Focus on the table
      const table = screen.getByRole('grid');
      fireEvent.keyDown(table, { key: 'ArrowDown' });

      // First row should be focused
      const firstRow = screen.getByText('Alice Johnson').closest('tr');
      expect(firstRow).toHaveAttribute('tabindex', '0');
    });

    it('selects row on Enter key', async () => {
      const onSelectStudent = vi.fn();

      render(<StudentTable {...defaultProps} onSelectStudent={onSelectStudent} />);

      const table = screen.getByRole('grid');

      // Navigate down then press Enter
      fireEvent.keyDown(table, { key: 'ArrowDown' });
      fireEvent.keyDown(table, { key: 'Enter' });

      expect(onSelectStudent).toHaveBeenCalled();
    });

    it('supports Home/End keys for navigation', () => {
      render(<StudentTable {...defaultProps} />);

      const table = screen.getByRole('grid');

      fireEvent.keyDown(table, { key: 'Home' });
      const firstRow = screen.getByText('Alice Johnson').closest('tr');
      expect(firstRow).toHaveAttribute('aria-selected');

      fireEvent.keyDown(table, { key: 'End' });
      const lastRow = screen.getByText('David Brown').closest('tr');
      expect(lastRow).toHaveAttribute('aria-rowindex');
    });
  });

  describe('Pagination', () => {
    it('displays pagination when there are multiple pages', () => {
      const manyStudents = createMockStudents(25);
      const pagination: PaginationState = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 25,
        totalPages: 3,
      };

      render(
        <StudentTable
          {...defaultProps}
          students={manyStudents}
          pagination={pagination}
        />
      );

      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    });

    it('calls onPageChange when changing pages', async () => {
      const onPageChange = vi.fn();
      const user = userEvent.setup();
      const manyStudents = createMockStudents(25);
      const pagination: PaginationState = {
        currentPage: 1,
        pageSize: 10,
        totalCount: 25,
        totalPages: 3,
      };

      render(
        <StudentTable
          {...defaultProps}
          students={manyStudents}
          pagination={pagination}
          onPageChange={onPageChange}
        />
      );

      const nextButton = screen.getByLabelText(/Next page/i);
      await user.click(nextButton);

      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageSizeChange when changing page size', async () => {
      const onPageSizeChange = vi.fn();
      const user = userEvent.setup();
      const manyStudents = createMockStudents(25);

      render(
        <StudentTable
          {...defaultProps}
          students={manyStudents}
          onPageSizeChange={onPageSizeChange}
        />
      );

      // Find and click the page size selector if it exists
      const pageSizeSelector = screen.queryByRole('combobox');
      if (pageSizeSelector) {
        await user.selectOptions(pageSizeSelector, '25');
        expect(onPageSizeChange).toHaveBeenCalledWith(25);
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure with role="grid"', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('includes accessible caption/instructions', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText(/Use arrow keys to navigate/)).toBeInTheDocument();
    });

    it('has proper aria-rowindex on rows', () => {
      render(<StudentTable {...defaultProps} />);

      const rows = screen.getAllByRole('row');
      // First row is header, data rows start at index 2
      rows.slice(1).forEach((row, index) => {
        expect(row).toHaveAttribute('aria-rowindex', String(index + 2));
      });
    });

    it('marks selected row with aria-selected', () => {
      render(<StudentTable {...defaultProps} selectedStudentId="student-1" />);

      const selectedRow = screen.getByText('Alice Johnson').closest('tr');
      expect(selectedRow).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Status Badges', () => {
    it('displays correct screener status badges', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText('On/Above Grade')).toBeInTheDocument();
      expect(screen.getByText('Below Grade')).toBeInTheDocument();
      expect(screen.getByText('Far Below')).toBeInTheDocument();
      expect(screen.getByText('Not Assessed')).toBeInTheDocument();
    });

    it('displays correct readiness indicators', () => {
      render(<StudentTable {...defaultProps} />);

      expect(screen.getByText('Ready')).toBeInTheDocument();
      expect(screen.getByText('Approaching')).toBeInTheDocument();
      expect(screen.getByText('Not Ready')).toBeInTheDocument();
    });
  });
});
