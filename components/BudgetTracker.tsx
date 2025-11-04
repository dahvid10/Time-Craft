import React, { useMemo } from 'react';
import type { Plan } from '../types';
import { PiggyBankIcon } from './icons/PiggyBankIcon';

interface BudgetTrackerProps {
  plans: Plan[];
}

const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ plans }) => {
  const { totalBudget, totalSpent } = useMemo(() => {
    let budget = 0;
    let spent = 0;

    for (const plan of plans) {
      const initialBudget = plan.budget || 0;
      const credits = plan.transactions?.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0) || 0;
      const expenses = plan.transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) || 0;
      
      budget += (initialBudget + credits);
      spent += expenses;
    }
    return { totalBudget: budget, totalSpent: spent };
  }, [plans]);

  if (plans.length === 0) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Budget Tracker</h2>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md text-center text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700">
                <p>Select one or more saved plans from the "Planner" tab to track their budget here.</p>
            </div>
        </div>
    );
  }

  const hasBudget = totalBudget > 0;
  const percentage = hasBudget ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudget;
  const remaining = totalBudget - totalSpent;

  return (
    <div>
        <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Budget Tracker</h2>
        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg shadow-md space-y-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <PiggyBankIcon className="h-8 w-8 text-green-500 dark:text-green-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Plan Financials</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                        {plans.length} {plans.length > 1 ? 'plans' : 'plan'} selected
                    </p>
                </div>
            </div>
            
            {hasBudget && (
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Spent: {formatCurrency(totalSpent)}</span>
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Budget: {formatCurrency(totalBudget)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-4">
                        <div 
                            className={`h-4 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                     <div className={`text-right mt-1 font-bold text-lg ${isOverBudget ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                        {isOverBudget 
                            ? `${formatCurrency(Math.abs(remaining))} Over Budget` 
                            : `${formatCurrency(remaining)} Remaining`}
                    </div>
                </div>
            )}

            {!hasBudget && (
                 <div className="text-center border-t border-gray-200 dark:border-slate-700 pt-4">
                    <p className="text-gray-500 dark:text-slate-400">No budget set for the selected plan(s).</p>
                    <p className="font-bold text-xl text-gray-800 dark:text-slate-100 mt-1">Total Spent: {formatCurrency(totalSpent)}</p>
                </div>
            )}
        </div>
    </div>
  );
};