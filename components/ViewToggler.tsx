import React from 'react';
import { ListIcon } from './icons/ListIcon';
import { TimelineIcon } from './icons/TimelineIcon';

interface ViewTogglerProps {
  viewMode: 'list' | 'timeline';
  setViewMode: (mode: 'list' | 'timeline') => void;
}

export const ViewToggler: React.FC<ViewTogglerProps> = ({ viewMode, setViewMode }) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200";
  const activeClasses = "bg-sky-500 text-white";
  const inactiveClasses = "bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600";

  return (
    <div className="flex justify-center bg-gray-100 dark:bg-slate-700 p-1 rounded-lg w-full sm:w-auto mx-auto">
      <button
        onClick={() => setViewMode('list')}
        className={`${baseClasses} ${viewMode === 'list' ? activeClasses : inactiveClasses}`}
        aria-pressed={viewMode === 'list'}
      >
        <ListIcon />
        List
      </button>
      <button
        onClick={() => setViewMode('timeline')}
        className={`${baseClasses} ${viewMode === 'timeline' ? activeClasses : inactiveClasses}`}
        aria-pressed={viewMode === 'timeline'}
      >
        <TimelineIcon />
        Timeline
      </button>
    </div>
  );
};