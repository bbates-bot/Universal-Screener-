/**
 * StudentTable Component
 * Main sortable, filterable data table for students
 * Enhanced with keyboard navigation and accessibility
 */

import React, { useMemo, useCallback, useRef, useState } from 'react';
import { TableHeader, ColumnDef } from './TableHeader';
import { StudentRow } from './StudentRow';
import { Pagination } from './Pagination';
import { GradeCategory, ReadinessStatus, SortState, PaginationState } from '../../types';

export interface StudentTableData {
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

interface StudentTableProps {
  students: StudentTableData[];
  isLoading?: boolean;
  sort: SortState;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string | null) => void;
  className?: string;
}

// Table column definitions
const columns: ColumnDef[] = [
  { key: 'name', label: 'Student', sortable: true, width: 'w-[220px]' },
  { key: 'grade', label: 'Grade', sortable: true, width: 'w-[100px]' },
  { key: 'school', label: 'School', sortable: true, width: 'w-[150px]' },
  { key: 'screenerStatus', label: 'Screener Status', sortable: true, width: 'w-[140px]' },
  { key: 'readinessStatus', label: 'Readiness', sortable: true, width: 'w-[120px]' },
  { key: 'lastAssessmentDate', label: 'Last Assessed', sortable: true, width: 'w-[120px]' },
  { key: 'actions', label: '', sortable: false, width: 'w-[50px]' },
];

// Loading skeleton
const TableSkeleton: React.FC = () => (
  <div className="divide-y divide-slate-100">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
        <div className="flex items-center gap-3 w-[220px]">
          <div className="w-9 h-9 bg-slate-200 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-4 w-16 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-200 rounded" />
        <div className="h-6 w-24 bg-slate-200 rounded-full" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="w-8" />
      </div>
    ))}
  </div>
);

// Empty state
const TableEmpty: React.FC<{ hasFilters: boolean }> = ({ hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
      <svg
        className="w-10 h-10 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </div>
    <h3 className="font-bold text-slate-600 mb-1">
      {hasFilters ? 'No Students Match Your Filters' : 'No Students Found'}
    </h3>
    <p className="text-sm text-slate-400 max-w-xs">
      {hasFilters
        ? 'Try adjusting your filters to see more students'
        : 'Add students to see them listed here'
      }
    </p>
  </div>
);

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  isLoading = false,
  sort,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  selectedStudentId,
  onSelectStudent,
  className = '',
}) => {
  const tableRef = useRef<HTMLTableElement>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);

  // Handle column sort
  const handleSort = useCallback((column: string) => {
    const newDirection =
      sort.column === column && sort.direction === 'asc' ? 'desc' : 'asc';
    onSort(column, newDirection);
  }, [sort, onSort]);

  // Keyboard navigation handler
  const handleTableKeyDown = useCallback((e: React.KeyboardEvent) => {
    const paginatedStudentsList = students.slice(
      (pagination.currentPage - 1) * pagination.pageSize,
      pagination.currentPage * pagination.pageSize
    );

    if (paginatedStudentsList.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedRowIndex((prev) => {
          const next = prev < paginatedStudentsList.length - 1 ? prev + 1 : prev;
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedRowIndex((prev) => {
          const next = prev > 0 ? prev - 1 : 0;
          return next;
        });
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedRowIndex >= 0 && focusedRowIndex < paginatedStudentsList.length) {
          onSelectStudent(paginatedStudentsList[focusedRowIndex].id);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedRowIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedRowIndex(paginatedStudentsList.length - 1);
        break;
      case 'Escape':
        if (selectedStudentId) {
          e.preventDefault();
          onSelectStudent(null);
        }
        break;
    }
  }, [students, pagination, focusedRowIndex, onSelectStudent, selectedStudentId]);

  // Sort students
  const sortedStudents = useMemo(() => {
    const sorted = [...students];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sort.column) {
        case 'name':
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
          break;
        case 'grade':
          comparison = a.grade.localeCompare(b.grade);
          break;
        case 'school':
          comparison = a.schoolName.localeCompare(b.schoolName);
          break;
        case 'screenerStatus':
          const statusOrder = { 'on-or-above': 0, 'below': 1, 'far-below': 2, 'non-applicable': 3 };
          comparison = statusOrder[a.screenerStatus] - statusOrder[b.screenerStatus];
          break;
        case 'readinessStatus':
          const readinessOrder = { 'ready': 0, 'approaching': 1, 'not-yet-ready': 2 };
          const aOrder = a.readinessStatus ? readinessOrder[a.readinessStatus] : 3;
          const bOrder = b.readinessStatus ? readinessOrder[b.readinessStatus] : 3;
          comparison = aOrder - bOrder;
          break;
        case 'lastAssessmentDate':
          const aDate = a.lastAssessmentDate ? new Date(a.lastAssessmentDate).getTime() : 0;
          const bDate = b.lastAssessmentDate ? new Date(b.lastAssessmentDate).getTime() : 0;
          comparison = aDate - bDate;
          break;
        default:
          comparison = 0;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [students, sort]);

  // Paginate students
  const paginatedStudents = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    return sortedStudents.slice(startIndex, startIndex + pagination.pageSize);
  }, [sortedStudents, pagination]);

  // Calculate total pages
  const totalPages = Math.ceil(students.length / pagination.pageSize);

  const paginationState: PaginationState = {
    ...pagination,
    totalCount: students.length,
    totalPages,
  };

  const isEmpty = students.length === 0;

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
      {/* Table header with title */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-800">Student Results</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isLoading
                ? 'Loading students...'
                : `${students.length} student${students.length !== 1 ? 's' : ''} found`
              }
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => {
                // Export functionality placeholder
                console.log('Export clicked');
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table
          ref={tableRef}
          className="w-full min-w-[800px]"
          role="grid"
          aria-label="Student results table"
          aria-rowcount={students.length}
          aria-describedby="table-instructions"
          onKeyDown={handleTableKeyDown}
        >
          {/* Hidden instructions for screen readers */}
          <caption id="table-instructions" className="sr-only">
            Student results. Use arrow keys to navigate rows, Enter or Space to select a student, Escape to deselect.
          </caption>

          <TableHeader
            columns={columns}
            sort={sort}
            onSort={handleSort}
          />

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableSkeleton />
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableEmpty hasFilters={false} />
                </td>
              </tr>
            ) : (
              paginatedStudents.map((student, index) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onClick={onSelectStudent}
                  isSelected={selectedStudentId === student.id}
                  isFocused={focusedRowIndex === index}
                  rowIndex={index}
                  onFocus={() => setFocusedRowIndex(index)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!isLoading && !isEmpty && (
        <div className="px-6 py-4 border-t border-slate-100">
          <Pagination
            pagination={paginationState}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default StudentTable;
