import React, { useState, useMemo } from 'react';
import type { Plan } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PencilIcon } from './icons/PencilIcon';

interface SavedPlansProps {
  plans: Plan[];
  onLoad: (planId: string) => void;
  onDelete: (planId: string) => void;
  onEdit: (planId: string) => void;
  onTogglePreview: (planId: string) => void;
  activePlanId: string | null;
  previewPlanIds: Set<string>;
}

export const SavedPlans: React.FC<SavedPlansProps> = ({ plans, onLoad, onDelete, onEdit, onTogglePreview, activePlanId, previewPlanIds }) => {
  const [showAll, setShowAll] = useState(false);

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [plans]);

  const plansToShow = showAll ? sortedPlans : sortedPlans.slice(0, 5);

  return (
    <div>
      <h2 className="text-2xl font-bold text-sky-500 dark:text-sky-400 mb-4">Saved Plans</h2>
      <div className="bg-white/50 dark:bg-slate-800/50 p-4 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
        <div className="max-h-80 overflow-y-auto pr-2">
            {sortedPlans.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-400 text-center py-4">No plans saved yet. Generate and save a plan to see it here.</p>
            ) : (
            <ul className="space-y-3">
                {plansToShow.map(plan => {
                const isActive = plan.id === activePlanId && previewPlanIds.size === 0;
                const isPreviewing = previewPlanIds.has(plan.id);

                return (
                    <li 
                    key={plan.id} 
                    className={`p-3 rounded-lg flex items-center gap-3 transition-colors duration-200 ${isActive ? 'bg-sky-100 dark:bg-sky-900/50' : 'bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'}`}
                    >
                        <input
                            type="checkbox"
                            checked={isPreviewing}
                            onChange={() => onTogglePreview(plan.id)}
                            className="h-5 w-5 rounded bg-gray-200 dark:bg-slate-600 border-gray-300 dark:border-slate-500 text-indigo-500 focus:ring-indigo-600 cursor-pointer flex-shrink-0"
                            aria-label={`Select ${plan.name} for preview`}
                        />
                    <div className="flex-grow cursor-pointer" onClick={() => onLoad(plan.id)}>
                        <p className={`font-semibold ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-gray-800 dark:text-slate-100'}`}>{plan.name}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                         Created: {new Date(plan.createdAt).toLocaleDateString()}
                         {plan.budget && ` | Budget: $${plan.budget.toLocaleString()}`}
                        </p>
                    </div>
                     <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(plan.id);
                        }}
                        className="text-gray-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
                        aria-label={`Edit ${plan.name}`}
                    >
                        <PencilIcon />
                    </button>
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        onDelete(plan.id);
                        }}
                        className="text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-2 rounded-full transition-colors duration-200 flex-shrink-0"
                        aria-label={`Delete ${plan.name}`}
                    >
                        <TrashIcon />
                    </button>
                    </li>
                );
                })}
            </ul>
            )}
        </div>
        {sortedPlans.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center text-sky-600 dark:text-sky-400 hover:text-sky-500 font-semibold text-sm focus:outline-none"
                >
                    {showAll ? 'Show Less' : `Show ${sortedPlans.length - 5} More`}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};