
import React from 'react';

interface PriorityBadgeProps {
  priority: 'High' | 'Medium' | 'Low' | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const lowerPriority = priority.toLowerCase();
  let colorClasses = 'bg-slate-700 text-slate-300';
  if (lowerPriority === 'high') {
    colorClasses = 'bg-red-500/20 text-red-400';
  } else if (lowerPriority === 'medium') {
    colorClasses = 'bg-yellow-500/20 text-yellow-400';
  } else if (lowerPriority === 'low') {
    colorClasses = 'bg-green-500/20 text-green-400';
  }
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses}`}>
      {priority}
    </span>
  );
};
