import React from 'react';
import type { ScheduleItem } from '../types';
import { ClockIcon } from './icons/ClockIcon';

interface NotificationBannerProps {
  task: ScheduleItem;
  onDismiss: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ task, onDismiss }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-sky-900/80 backdrop-blur-sm border-b border-sky-700 p-3 rounded-t-lg shadow-lg flex items-center justify-between animate-fade-in-down">
      <div className="flex items-center gap-3">
        <ClockIcon className="text-sky-400 h-6 w-6 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-sky-300">UPCOMING TASK</p>
          <p className="text-slate-100 font-bold">{task.task} at {task.startTime}</p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-full transition-colors"
        aria-label="Dismiss notification"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};