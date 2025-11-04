import React from 'react';
import type { ScheduleItem } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { XIcon } from './icons/XIcon';
import { ClockIcon } from './icons/ClockIcon';
import { DollarIcon } from './icons/DollarIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PlannerIcon } from './icons/PlannerIcon';

interface TaskDetailModalProps {
  task: ScheduleItem;
  planName: string | null;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, planName, onClose, onToggleTask }) => {

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleTask(task.id);
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 w-full max-w-lg relative animate-fade-in-down flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white p-1 rounded-full transition-colors z-10"
                    aria-label="Close modal"
                >
                    <XIcon />
                </button>

                <div className={`p-6 border-b-4 ${task.completed ? 'border-green-500' : 'border-sky-500'} flex-shrink-0`}>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 pr-8">{task.task}</h2>
                    <div className="mt-2">
                        <PriorityBadge priority={task.priority} />
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                           <CalendarIcon className="h-6 w-6 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Date</p>
                                <p className="font-bold text-gray-800 dark:text-slate-200">{new Date(task.date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                           <ClockIcon className="h-6 w-6 text-sky-500 dark:text-sky-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Time</p>
                                <p className="font-bold text-gray-800 dark:text-slate-200">{task.startTime} - {task.endTime} ({task.duration})</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                           <PlannerIcon />
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Plan</p>
                                <p className="font-bold text-gray-800 dark:text-slate-200">{planName || 'Unsaved Plan'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                           <DollarIcon className="h-6 w-6 text-green-500 dark:text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Estimated Cost</p>
                                <p className="font-bold text-gray-800 dark:text-slate-200">${task.cost.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button 
                            onClick={handleToggle}
                            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${task.completed ? 'bg-green-100 dark:bg-green-900/50 hover:bg-green-200 dark:hover:bg-green-800/50' : 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
                        >
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-green-500' : 'border-2 border-gray-400 dark:border-slate-500'}`}>
                                {task.completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <span className={`font-semibold ${task.completed ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-slate-200'}`}>
                                {task.completed ? 'Status: Completed' : 'Mark as Complete'}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};