/**
 * Tests for SummaryMetrics Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SummaryMetrics } from '../components/SummaryMetrics';
import { mockSummaryData } from './testUtils';

describe('SummaryMetrics', () => {
  const defaultProps = {
    data: mockSummaryData,
    isLoading: false,
    onMetricClick: vi.fn(),
    activeMetric: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all metric cards', () => {
    render(<SummaryMetrics {...defaultProps} />);

    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('On/Above Grade')).toBeInTheDocument();
    expect(screen.getByText('Below Grade')).toBeInTheDocument();
    expect(screen.getByText('Far Below Grade')).toBeInTheDocument();
  });

  it('displays correct values from data', () => {
    render(<SummaryMetrics {...defaultProps} />);

    expect(screen.getByText('150')).toBeInTheDocument(); // total
    expect(screen.getByText('75')).toBeInTheDocument(); // onOrAboveGrade
    expect(screen.getByText('45')).toBeInTheDocument(); // belowGrade
    expect(screen.getByText('20')).toBeInTheDocument(); // farBelowGrade
  });

  it('shows loading skeleton when isLoading is true', () => {
    render(<SummaryMetrics {...defaultProps} isLoading={true} />);

    // Should show animated skeleton elements
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('calls onMetricClick when a metric card is clicked', async () => {
    const onMetricClick = vi.fn();
    const user = userEvent.setup();

    render(<SummaryMetrics {...defaultProps} onMetricClick={onMetricClick} />);

    const onAboveCard = screen.getByText('On/Above Grade').closest('button');
    await user.click(onAboveCard!);

    expect(onMetricClick).toHaveBeenCalledWith('onOrAbove');
  });

  it('highlights the active metric card', () => {
    render(<SummaryMetrics {...defaultProps} activeMetric="onOrAbove" />);

    const onAboveCard = screen.getByText('On/Above Grade').closest('button');
    expect(onAboveCard).toHaveClass('ring-2');
  });

  it('calculates and displays percentages correctly', () => {
    render(<SummaryMetrics {...defaultProps} />);

    // Percentages are shown in the quick stats section as "X% on track" / "X% need support"
    // 75/150 = 50% on track
    expect(screen.getByText(/50%/)).toBeInTheDocument();
    // 45/150 = 30% need support
    expect(screen.getByText(/30%/)).toBeInTheDocument();
  });

  it('handles zero total gracefully', () => {
    const zeroData = {
      ...mockSummaryData,
      total: 0,
      onOrAboveGrade: 0,
      belowGrade: 0,
      farBelowGrade: 0,
      nonApplicable: 0,
    };

    render(<SummaryMetrics {...defaultProps} data={zeroData} />);

    // Should show 0 for total and empty state message
    expect(screen.getByText('No Students Found')).toBeInTheDocument();
  });

  it('has accessible button roles for interactive cards', () => {
    render(<SummaryMetrics {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('deselects metric when clicking the active metric again', async () => {
    const onMetricClick = vi.fn();
    const user = userEvent.setup();

    render(
      <SummaryMetrics
        {...defaultProps}
        onMetricClick={onMetricClick}
        activeMetric="onOrAbove"
      />
    );

    const onAboveCard = screen.getByText('On/Above Grade').closest('button');
    await user.click(onAboveCard!);

    expect(onMetricClick).toHaveBeenCalledWith(null);
  });
});
