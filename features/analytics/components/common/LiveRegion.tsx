/**
 * LiveRegion Component
 * Announces dynamic content changes to screen readers
 */

import React, { useState, useEffect, useCallback } from 'react';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  message,
  politeness = 'polite',
  clearAfter = 5000,
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      // Clear first to ensure re-announcement
      setAnnouncement('');

      // Small delay to ensure screen reader picks up the change
      const announceTimer = setTimeout(() => {
        setAnnouncement(message);
      }, 100);

      // Clear after specified time
      const clearTimer = setTimeout(() => {
        setAnnouncement('');
      }, clearAfter);

      return () => {
        clearTimeout(announceTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

// Hook for programmatic announcements
export const useAnnouncer = () => {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(priority);
    setMessage('');
    // Small delay to ensure announcement
    setTimeout(() => setMessage(text), 50);
  }, []);

  const Announcer = useCallback(() => (
    <LiveRegion message={message} politeness={politeness} />
  ), [message, politeness]);

  return { announce, Announcer };
};

export default LiveRegion;
