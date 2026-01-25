/**
 * TableHeader Component
 * Sortable column headers for the student table
 */

import React from 'react';
import { SortState } from '../../types';

export interface ColumnDef {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableHeaderProps {
  columns: ColumnDef[];
  sort: SortState;
  onSort: (column: string) => void;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  sort,
  onSort,
  className = '',
}) => {
  const handleSort = (column: ColumnDef) => {
    if (column.sortable !== false) {
      onSort(column.key);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sort.column !== columnKey) {
      return (
        <svg
          className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sort.direction === 'asc' ? (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="w-4 h-4 text-indigo-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  return (
    <thead className={`bg-slate-50 ${className}`}>
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className={`
              px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider
              ${column.sortable !== false ? 'cursor-pointer select-none group' : ''}
              ${column.width || ''}
            `}
            onClick={() => handleSort(column)}
          >
            <div className={`flex items-center gap-1.5 ${getAlignClass(column.align)}`}>
              <span>{column.label}</span>
              {column.sortable !== false && getSortIcon(column.key)}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
