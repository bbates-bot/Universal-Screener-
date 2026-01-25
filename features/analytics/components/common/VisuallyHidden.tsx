/**
 * VisuallyHidden Component
 * Hides content visually but keeps it accessible to screen readers
 */

import React, { ElementType } from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: ElementType;
}

export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({
  children,
  as: Component = 'span',
}) => {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
};

export default VisuallyHidden;
