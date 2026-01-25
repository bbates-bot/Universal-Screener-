/**
 * Tests for Common Accessibility Components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  SkipLink,
  VisuallyHidden,
  FocusTrap,
  LiveRegion,
  LoadingSpinner,
  LoadingOverlay,
  useAnnouncer,
} from '../components/common';

describe('SkipLink', () => {
  beforeEach(() => {
    // Create a target element for skip links
    const target = document.createElement('div');
    target.id = 'main-content';
    document.body.appendChild(target);
  });

  it('renders with default label', () => {
    render(<SkipLink href="#main-content" />);
    expect(screen.getByText('Skip to main content')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<SkipLink href="#main-content" label="Jump to content" />);
    expect(screen.getByText('Jump to content')).toBeInTheDocument();
  });

  it('supports targetId prop format', () => {
    render(<SkipLink targetId="main-content" label="Skip" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('focuses target element on click', async () => {
    const user = userEvent.setup();
    render(<SkipLink href="#main-content" label="Skip" />);

    const link = screen.getByRole('link');
    await user.click(link);

    const target = document.getElementById('main-content');
    expect(target).toHaveFocus();
  });

  it('is visually hidden until focused', () => {
    render(<SkipLink href="#main-content" />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('sr-only');
  });
});

describe('VisuallyHidden', () => {
  it('renders children with sr-only class', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const element = screen.getByText('Hidden text');
    expect(element).toHaveClass('sr-only');
  });

  it('renders as span by default', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const element = screen.getByText('Hidden');
    expect(element.tagName).toBe('SPAN');
  });

  it('renders as custom element type', () => {
    render(<VisuallyHidden as="div">Hidden</VisuallyHidden>);
    const element = screen.getByText('Hidden');
    expect(element.tagName).toBe('DIV');
  });
});

describe('FocusTrap', () => {
  it('traps focus within container when active', async () => {
    const user = userEvent.setup();

    render(
      <FocusTrap active={true}>
        <button>First</button>
        <button>Second</button>
        <button>Third</button>
      </FocusTrap>
    );

    const firstButton = screen.getByText('First');
    const thirdButton = screen.getByText('Third');

    // Focus should start on first focusable element
    expect(firstButton).toHaveFocus();

    // Tab to third button
    await user.tab();
    await user.tab();
    expect(thirdButton).toHaveFocus();

    // Tab again should wrap to first
    await user.tab();
    expect(firstButton).toHaveFocus();
  });

  it('does not trap focus when inactive', async () => {
    const user = userEvent.setup();

    render(
      <>
        <button>Outside</button>
        <FocusTrap active={false}>
          <button>Inside</button>
        </FocusTrap>
      </>
    );

    const outsideButton = screen.getByText('Outside');
    outsideButton.focus();

    // Should be able to tab normally
    await user.tab();
    // Focus should not be trapped
  });

  it('restores focus on deactivation', () => {
    const previousElement = document.createElement('button');
    document.body.appendChild(previousElement);
    previousElement.focus();

    const { rerender } = render(
      <FocusTrap active={true} returnFocusOnDeactivate={true}>
        <button>Trapped</button>
      </FocusTrap>
    );

    // Deactivate the trap
    rerender(
      <FocusTrap active={false} returnFocusOnDeactivate={true}>
        <button>Trapped</button>
      </FocusTrap>
    );

    // Focus should return to previous element
    expect(previousElement).toHaveFocus();
  });
});

describe('LiveRegion', () => {
  it('renders with polite politeness by default', () => {
    render(<LiveRegion message="Update" />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('renders with assertive politeness when specified', () => {
    render(<LiveRegion message="Alert" politeness="assertive" />);
    const region = screen.getByRole('status');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('is visually hidden', () => {
    render(<LiveRegion message="Hidden" />);
    const region = screen.getByRole('status');
    expect(region).toHaveClass('sr-only');
  });

  it('announces message after delay', async () => {
    vi.useFakeTimers();

    render(<LiveRegion message="Test announcement" />);

    // Fast-forward past the announce delay
    vi.advanceTimersByTime(150);

    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Test announcement');

    vi.useRealTimers();
  });
});

describe('LoadingSpinner', () => {
  it('renders with default size and label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('renders with custom label', () => {
    render(<LoadingSpinner label="Processing data..." />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing data...');
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinnerElement = screen.getByRole('status').querySelector('[aria-hidden="true"]');
    expect(spinnerElement).toHaveClass('w-4', 'h-4');

    rerender(<LoadingSpinner size="lg" />);
    spinnerElement = screen.getByRole('status').querySelector('[aria-hidden="true"]');
    expect(spinnerElement).toHaveClass('w-8', 'h-8');
  });

  it('includes screen reader text', () => {
    render(<LoadingSpinner label="Loading students..." />);
    expect(screen.getByText('Loading students...')).toHaveClass('sr-only');
  });
});

describe('LoadingOverlay', () => {
  it('renders when visible', () => {
    render(<LoadingOverlay isVisible={true} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when not visible', () => {
    render(<LoadingOverlay isVisible={false} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays custom label', () => {
    render(<LoadingOverlay isVisible={true} label="Fetching data..." />);
    expect(screen.getByText('Fetching data...')).toBeInTheDocument();
  });

  it('has aria-busy attribute', () => {
    render(<LoadingOverlay isVisible={true} />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('useAnnouncer', () => {
  const TestComponent: React.FC = () => {
    const { announce, Announcer } = useAnnouncer();

    return (
      <div>
        <button onClick={() => announce('Test message')}>Announce</button>
        <button onClick={() => announce('Urgent!', 'assertive')}>Urgent</button>
        <Announcer />
      </div>
    );
  };

  it('announces messages when triggered', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<TestComponent />);

    await user.click(screen.getByText('Announce'));
    vi.advanceTimersByTime(200);

    const region = screen.getByRole('status');
    expect(region).toHaveTextContent('Test message');

    vi.useRealTimers();
  });
});
