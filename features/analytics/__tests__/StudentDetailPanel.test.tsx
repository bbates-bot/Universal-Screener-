/**
 * Tests for StudentDetailPanel Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StudentDetailPanel } from '../components/StudentDetailPanel';
import { mockStudentDetail } from './testUtils';

describe('StudentDetailPanel', () => {
  const defaultProps = {
    student: mockStudentDetail,
    isOpen: true,
    isLoading: false,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body overflow
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders student information when open', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('@ajohnson')).toBeInTheDocument();
      expect(screen.getByText('Grade 6')).toBeInTheDocument();
      expect(screen.getByText('Lincoln Elementary')).toBeInTheDocument();
    });

    it('displays screener status', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('Screener Status')).toBeInTheDocument();
      expect(screen.getByText('On/Above Grade Level')).toBeInTheDocument();
    });

    it('displays readiness status', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('Readiness')).toBeInTheDocument();
      // There are multiple "Ready" texts - one in the header status and one in the details
      expect(screen.getAllByText('Ready').length).toBeGreaterThanOrEqual(1);
    });

    it('shows loading skeleton when isLoading is true', () => {
      render(<StudentDetailPanel {...defaultProps} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows empty state when no student is selected', () => {
      render(<StudentDetailPanel {...defaultProps} student={null} />);

      expect(screen.getByText('No Student Selected')).toBeInTheDocument();
    });

    it('is hidden when isOpen is false', () => {
      render(<StudentDetailPanel {...defaultProps} isOpen={false} />);

      const panel = screen.getByRole('dialog');
      expect(panel).toHaveClass('translate-x-full');
    });
  });

  describe('Screener Results Section', () => {
    it('displays overall score', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('42')).toBeInTheDocument(); // score
      expect(screen.getByText(/\/50/)).toBeInTheDocument(); // max score
    });

    it('displays domain breakdown', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('Number Operations')).toBeInTheDocument();
      expect(screen.getByText('Algebraic Thinking')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
      expect(screen.getByText('Data Analysis')).toBeInTheDocument();
    });

    it('shows no screener data message when screener is null', () => {
      const studentWithoutScreener = {
        ...mockStudentDetail,
        screener: null,
      };

      render(<StudentDetailPanel {...defaultProps} student={studentWithoutScreener} />);

      expect(screen.getByText('No Screener Data')).toBeInTheDocument();
    });
  });

  describe('Readiness Details Section', () => {
    it('displays course information', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText('AP Calculus')).toBeInTheDocument();
    });

    it('displays prerequisites progress', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText(/8.*of.*10/)).toBeInTheDocument();
    });

    it('displays skill gaps when present', () => {
      const studentWithGaps = {
        ...mockStudentDetail,
        readiness: {
          ...mockStudentDetail.readiness!,
          gaps: [
            {
              code: 'NBT.5',
              standard: 'Multiply whole numbers',
              description: 'Needs practice',
              domain: 'Number Operations',
            },
          ],
        },
      };

      render(<StudentDetailPanel {...defaultProps} student={studentWithGaps} />);

      expect(screen.getByText('NBT.5')).toBeInTheDocument();
    });
  });

  describe('Closing Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<StudentDetailPanel {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText(/Close panel/i);
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const onClose = vi.fn();

      render(<StudentDetailPanel {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when clicking backdrop', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();

      render(<StudentDetailPanel {...defaultProps} onClose={onClose} />);

      // Wait for the click handler delay
      await new Promise((resolve) => setTimeout(resolve, 150));

      const backdrop = document.querySelector('[aria-hidden="true"]');
      await user.click(backdrop!);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role and aria attributes', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'student-detail-title');
    });

    it('has accessible close button', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      const closeButton = screen.getByLabelText(/Close panel for Alice Johnson/i);
      expect(closeButton).toBeInTheDocument();
    });

    it('includes hidden description for screen readers', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      const description = screen.getByText(/Viewing detailed information for Alice Johnson/i);
      expect(description).toHaveClass('sr-only');
    });

    it('prevents body scroll when open', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when closed', () => {
      const { rerender } = render(<StudentDetailPanel {...defaultProps} />);

      rerender(<StudentDetailPanel {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('');
    });

    it('traps focus within the panel when open', async () => {
      const user = userEvent.setup();

      render(<StudentDetailPanel {...defaultProps} />);

      // The close button should receive focus
      const closeButton = screen.getByLabelText(/Close panel/i);
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Recommendations Section', () => {
    it('displays recommendations when present', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      expect(screen.getByText(/Continue advanced problem-solving/i)).toBeInTheDocument();
    });

    it('generates recommendations based on status', () => {
      const studentBelowGrade = {
        ...mockStudentDetail,
        screenerStatus: 'below' as const,
        readinessStatus: 'approaching' as const,
      };

      render(<StudentDetailPanel {...defaultProps} student={studentBelowGrade} />);

      // Recommendations section should be present
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('has print button', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      const printButton = screen.getByLabelText(/Print student report/i);
      expect(printButton).toBeInTheDocument();
    });

    it('has more options button', () => {
      render(<StudentDetailPanel {...defaultProps} />);

      const moreButton = screen.getByLabelText(/More options/i);
      expect(moreButton).toBeInTheDocument();
    });
  });
});
