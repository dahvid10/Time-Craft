import React, { useState, useEffect } from 'react';
import { PencilIcon } from './icons/PencilIcon';
import { XIcon } from './icons/XIcon';
import type { Plan } from '../types';

interface EditPlanModalProps {
  plan: Plan;
  onClose: () => void;
  onSave: (details: { planName: string, budget?: number }) => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ plan, onClose, onSave }) => {
    const [planName, setPlanName] = useState('');
    const [budget, setBudget] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (plan) {
            setPlanName(plan.name);
            setBudget(plan.budget?.toString() || '');
        }
    }, [plan]);

    const handleSaveClick = () => {
        if (!planName.trim()) {
            setError('Please enter a plan name.');
            return;
        }
        const budgetValue = budget ? parseFloat(budget) : undefined;
        if (budget && isNaN(budgetValue as number)) {
            setError('Please enter a valid number for the budget.');
            return;
        }
        onSave({ planName: planName.trim(), budget: budgetValue });
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-md relative animate-fade-in-down flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                >
                    <XIcon />
                </button>

                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className='flex items-center gap-3'>
                        <div className="bg-sky-500/20 p-2 rounded-full text-sky-600 dark:text-sky-400">
                            <PencilIcon />
                        </div>
                        <h2 className="text-xl font-bold text-sky-600 dark:text-sky-400">Edit Plan</h2>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="edit-plan-name" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Plan Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="edit-plan-name"
                            value={planName}
                            onChange={(e) => setPlanName(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 rounded-md p-2 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="edit-plan-budget" className="block text-sm font-medium text-gray-600 dark:text-slate-300 mb-1">Budget (Optional)</label>
                        <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-gray-400 dark:text-slate-400 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="edit-plan-budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="w-full bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 rounded-md p-2 pl-7 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                                placeholder="e.g., 5000"
                            />
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-800 dark:text-slate-100 font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveClick}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};