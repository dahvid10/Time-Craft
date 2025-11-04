import React from 'react';

interface DollarIconProps {
  className?: string;
}

export const DollarIcon: React.FC<DollarIconProps> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-4a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);