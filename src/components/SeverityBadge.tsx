import React from 'react';
import { SeverityLevel } from '../types';
import { getSeverityStyles } from '../utils/formatters';

interface SeverityBadgeProps {
  severity: SeverityLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  size = 'md',
  showDot = true,
}) => {
  const styles = getSeverityStyles(severity);

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-bold',
  }[size];

  const dotSize = {
    sm: 'w-1.5 h-1.5 mr-1',
    md: 'w-2 h-2 mr-1.5',
    lg: 'w-2.5 h-2.5 mr-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${styles.bg} ${styles.text} ${styles.border} ${sizeClasses}`}
    >
      {showDot && (
        <span
          className={`rounded-full ${styles.dot} ${dotSize} shrink-0`}
        />
      )}
      <span>{severity?.toUpperCase() || 'UNKNOWN'}</span>
    </span>
  );
};
