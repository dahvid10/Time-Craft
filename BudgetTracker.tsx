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
  const { totalBudget, totalCost } = useMemo(() => {
    let budget = 0;
    let cost = 0;
    for (const plan of plans) {
      budget += plan.budget || 0;
      // Prioritize actual user-inputted spending, otherwise use AI-estimated cost.
      if (typeof plan.actualSpent === 'number') {
        cost += plan.actualSpent;
      } else {
        cost += plan.schedule.reduce((sum, item) => sum + (item.cost || 0), 0);
      }
    }
    return { totalBudget: budget, totalCost: cost };
  }, [plans]);

  if (plans.length === 0) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-sky-400 mb-4">Budget Tracker</h2>
            <div className="bg-slate-800/50 p-6 rounded-lg shadow-md text-center text-slate-400 h-full flex flex-col justify-center items-center">
                <PiggyBankIcon className="h-10 w-10 text-slate-600 mb-3" />
                <p className="font-semibold text-slate-300">Select plans to track.</p>
                <p className="text-sm">Check one or more saved plans from the "Planner" tab to see their combined budget here.</p>
            </div>
        </div>
    );
  }

  const hasBudget = totalBudget > 0;
  const percentage = hasBudget ? Math.min((totalCost / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalCost > totalBudget;
  const remaining = totalBudget - totalCost;

  return (
    <div>
        <h2 className="text-2xl font-bold text-sky-400 mb-4">Budget Tracker</h2>
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-md space-y-4">
            <div className="flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-full">
                    <PiggyBankIcon className="h-8 w-8 text-green-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-100">Financials for Selected Plans</h3>
                    <p className="text-sm text-slate-400">
                        {plans.length} {plans.length > 1 ? 'plans' : 'plan'} selected
                    </p>
                </div>
            </div>
            
            {hasBudget && (
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-slate-300">Spent: {formatCurrency(totalCost)}</span>
                        <span className="text-sm font-medium text-slate-400">Budget: {formatCurrency(totalBudget)}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4">
                        <div 
                            className={`h-4 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                     <div className={`text-right mt-1 font-bold text-lg ${isOverBudget ? 'text-red-400' : 'text-green-300'}`}>
                        {isOverBudget 
                            ? `${formatCurrency(Math.abs(remaining))} Over Budget` 
                            : `${formatCurrency(remaining)} Remaining`}
                    </div>
                </div>
            )}

            {!hasBudget && (
                 <div className="text-center border-t border-slate-700 pt-4">
                    <p className="text-slate-400">No budget set for the selected plan(s).</p>
                    <p className="font-bold text-xl text-slate-100 mt-1">Total Spent / Estimated: {formatCurrency(totalCost)}</p>
                </div>
            )}
        </div>
    </div>
  );
};