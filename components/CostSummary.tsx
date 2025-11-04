import React, { useMemo } from 'react';
import type { ScheduleItem } from '../types';
import { DollarIcon } from './icons/DollarIcon';

interface CostSummaryProps {
  fullSchedule: ScheduleItem[];
  dailySchedule: ScheduleItem[];
}

export const CostSummary: React.FC<CostSummaryProps> = ({ fullSchedule, dailySchedule }) => {
  const dailyTotal = useMemo(() => {
    return dailySchedule.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [dailySchedule]);

  const grandTotal = useMemo(() => {
    return fullSchedule.reduce((sum, item) => sum + (item.cost || 0), 0);
  }, [fullSchedule]);

  if (grandTotal === 0) {
    return null; // Don't show the component if there are no costs
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex flex-col sm:flex-row justify-around items-center gap-4 text-center">
      <div className="flex items-center gap-3">
        <DollarIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
        <div>
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Cost for Today</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(dailyTotal)}</div>
        </div>
      </div>
      <div className="w-full sm:w-px h-px sm:h-12 bg-gray-200 dark:bg-slate-600"></div>
      <div className="flex items-center gap-3">
        <DollarIcon className="h-8 w-8 text-sky-500 dark:text-sky-400" />
        <div>
          <div className="text-sm text-gray-500 dark:text-slate-400">Total Cost for Plan</div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">{formatCurrency(grandTotal)}</div>
        </div>
      </div>
    </div>
  );
};