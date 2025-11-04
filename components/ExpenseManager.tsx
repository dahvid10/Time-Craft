import React, { useState, useMemo } from 'react';
import type { Plan } from '../types';

interface PlanExpenseRowProps {
    plan: Plan;
    onAddTransaction: (plan: Plan, type: 'expense' | 'credit') => void;
}

const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '$--.--';
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PlanExpenseRow: React.FC<PlanExpenseRowProps> = ({ plan, onAddTransaction }) => {

    const { estimatedCost, actualSpent } = useMemo(() => {
        const estCost = plan.schedule.reduce((sum, item) => sum + (item.cost || 0), 0);
        const actSpent = plan.transactions
            ?.filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0) || 0;
        return { estimatedCost: estCost, actualSpent: actSpent };
    }, [plan.schedule, plan.transactions]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="md:col-span-2">
                <p className="font-bold text-gray-800 dark:text-slate-100">{plan.name}</p>
                <p className="text-sm text-gray-500 dark:text-slate-400">Budget: {formatCurrency(plan.budget)}</p>
            </div>
            <div className="text-gray-700 dark:text-slate-300">
                <span className="md:hidden font-semibold">Est. Cost: </span>
                {formatCurrency(estimatedCost)}
            </div>
            <div className="text-gray-700 dark:text-slate-300">
                <span className="md:hidden font-semibold">Actual Spent: </span>
                {formatCurrency(actualSpent)}
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
                <button 
                    onClick={() => onAddTransaction(plan, 'expense')}
                    className="w-full text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md transition-colors"
                    title="Add an expense"
                >
                    - Expense
                </button>
                <button 
                    onClick={() => onAddTransaction(plan, 'credit')}
                    className="w-full text-sm font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md transition-colors"
                    title="Add a credit to budget"
                >
                    + Credit
                </button>
            </div>
        </div>
    );
};

interface ExpenseManagerProps {
    plans: Plan[];
    onAddTransaction: (plan: Plan, type: 'expense' | 'credit') => void;
}

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({ plans, onAddTransaction }) => {
    const sortedPlans = useMemo(() => {
        return [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [plans]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Expense Manager</h2>
            <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
                <div className="hidden md:grid grid-cols-6 gap-4 px-4 pb-2 text-sm font-semibold text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                    <div className="col-span-2">Plan Name</div>
                    <div>Estimated Cost</div>
                    <div>Actual Spent</div>
                    <div className="col-span-2 text-center">Add Transaction</div>
                </div>
                <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                    {sortedPlans.length === 0 ? (
                        <p className="text-gray-500 dark:text-slate-400 text-center py-4">No plans saved yet. Create a plan to manage its expenses here.</p>
                    ) : (
                        sortedPlans.map(plan => (
                            <PlanExpenseRow key={plan.id} plan={plan} onAddTransaction={onAddTransaction} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};