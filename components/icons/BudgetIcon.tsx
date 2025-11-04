import React from 'react';

interface BudgetIconProps {
  className?: string;
}

export const BudgetIcon: React.FC<BudgetIconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A3.375 3.375 0 006.375 8.25H17.625A3.375 3.375 0 0012 4.875z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25a.75.75 0 000-1.5h-.75a.75.75 0 000 1.5h.75z" />
    </svg>
);
