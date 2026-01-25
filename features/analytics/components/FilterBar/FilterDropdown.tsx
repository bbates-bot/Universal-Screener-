/**
 * FilterDropdown Component
 * Reusable multi-select dropdown for filter bars
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface FilterDropdownProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string; group?: string }>;
  multiSelect?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  multiSelect = false,
  searchable = false,
  placeholder = 'All',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Group options by their group property
  type OptionItem = { value: string; label: string; group?: string };
  const groupedOptions: Record<string, OptionItem[]> = {};
  filteredOptions.forEach((opt) => {
    const group = opt.group || '';
    if (!groupedOptions[group]) {
      groupedOptions[group] = [];
    }
    groupedOptions[group].push(opt);
  });

  // Handle option selection
  const handleOptionClick = useCallback(
    (optionValue: string) => {
      if (multiSelect) {
        const newValue = value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue];
        onChange(newValue);
      } else {
        onChange(optionValue === '' ? [] : [optionValue]);
        setIsOpen(false);
        setSearchQuery('');
      }
    },
    [multiSelect, value, onChange]
  );

  // Clear all selections
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  // Get display text
  const displayText = value.length === 0
    ? placeholder
    : value.length === 1
    ? options.find((o) => o.value === value[0])?.label || value[0]
    : `${value.length} selected`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full min-w-[180px] bg-slate-50 border-none rounded-xl font-bold py-2.5 px-4
          text-left flex items-center justify-between gap-2
          transition-all outline-none
          ${isOpen ? 'ring-2 ring-indigo-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'}
        `}
      >
        <span className={value.length === 0 ? 'text-slate-500' : 'text-slate-800'}>
          {displayText}
        </span>

        <div className="flex items-center gap-1">
          {value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              aria-label="Clear selection"
            >
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-slate-50 border-none rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {/* All/None option */}
            {!multiSelect && (
              <button
                type="button"
                onClick={() => handleOptionClick('')}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center justify-between
                  transition-colors
                  ${value.length === 0 ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
                `}
              >
                {placeholder}
                {value.length === 0 && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}

            {/* Grouped Options */}
            {Object.entries(groupedOptions).map(([group, groupOptions]) => (
              <div key={group || 'default'}>
                {group && (
                  <div className="px-4 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                    {group}
                  </div>
                )}
                {groupOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionClick(option.value)}
                      className={`
                        w-full px-4 py-2.5 text-left text-sm font-medium
                        flex items-center justify-between
                        transition-colors
                        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
                      `}
                    >
                      <span className="flex items-center gap-2">
                        {multiSelect && (
                          <span
                            className={`
                              w-4 h-4 rounded border-2 flex items-center justify-center
                              ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}
                            `}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </span>
                        )}
                        {option.label}
                      </span>
                      {!multiSelect && isSelected && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* No results message */}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-slate-400">
                No options found
              </div>
            )}
          </div>

          {/* Multi-select footer */}
          {multiSelect && value.length > 0 && (
            <div className="p-2 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                {value.length} selected
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
