import React, { useState, useMemo, useEffect } from 'react';
import type { ScheduleItem, Plan } from '../types';
import { ViewToggler } from './ViewToggler';
import { ScheduleTimeline } from './ScheduleTimeline';
import { DateSelector } from './DateSelector';
import { NotificationBanner } from './NotificationBanner';
import { CostSummary } from './CostSummary';
import { FullTimelineView } from './FullTimelineView';
import { PriorityBadge } from './PriorityBadge';

interface ScheduleDisplayProps {
  schedule: ScheduleItem[] | null;
  isLoading: boolean;
  error: string | null;
  onToggleTask: (taskId: string) => void;
  upcomingTask: ScheduleItem | null;
  onDismissNotification: () => void;
  plans: Plan[];
  isPreviewing: boolean;
}

export const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ schedule, isLoading, error, onToggleTask, upcomingTask, onDismissNotification, plans, isPreviewing }) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [selectedDate, setSelectedDate] = useState<string | null>('all');

  const uniqueDates = useMemo(() => {
    if (!schedule) return [];
    const dates = new Set(schedule.map(item => item.date));
    return Array.from(dates).sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
  }, [schedule]);

  useEffect(() => {
    if (uniqueDates.length > 0) {
        setSelectedDate('all');
    } else {
        setSelectedDate(null);
    }
  }, [schedule]);

  const filteredSchedule = useMemo(() => {
    if (!schedule) return [];
    if (!selectedDate || selectedDate === 'all') return schedule;
    return schedule.filter(item => item.date === selectedDate);
  }, [schedule, selectedDate]);
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-6 h-full flex flex-col items-center justify-center text-center animate-pulse">
          <div className="text-sky-500 dark:text-sky-400 text-lg font-semibold">Generating your personalized schedule...</div>
          <div className="text-gray-500 dark:text-slate-400 mt-2">The AI is weaving together your goals and ideas.</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-300 text-red-700 p-6 rounded-lg h-full flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-bold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      );
    }
    
    if (!schedule) {
      return (
         <div className="p-6 h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-700 dark:text-slate-300">Your Schedule Awaits</h3>
          <p className="text-gray-500 dark:text-slate-400">Add goals, share ideas, and click "Generate Plan" to see your schedule here.</p>
        </div>
      );
    }
    
    if (schedule.length === 0) {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <h3 className="text-xl font-bold">No Schedule Generated</h3>
                <p className="text-gray-500 dark:text-slate-400">The AI couldn't create a schedule from the provided info. Try adding more details.</p>
            </div>
        );
    }
    
    if (viewMode === 'timeline') {
        if (selectedDate === 'all') {
            return <FullTimelineView schedule={schedule!} plans={plans} onToggleTask={onToggleTask}/>
        }
      return <ScheduleTimeline schedule={filteredSchedule} onToggleTask={onToggleTask} />;
    }

    // List View
    return (
      <div className="space-y-2 pr-2">
        {filteredSchedule.map((item) => (
          <div key={item.id} className={`bg-white dark:bg-slate-700 p-2.5 rounded-lg shadow-md border-l-4 border-sky-500 transform hover:scale-[1.01] transition-all duration-200 ${item.completed ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleTask(item.id)}
                  className="mt-1 h-4 w-4 rounded bg-gray-200 dark:bg-slate-600 border-gray-300 dark:border-slate-500 text-sky-500 dark:text-sky-400 focus:ring-sky-600 dark:focus:ring-sky-500 cursor-pointer"
                  aria-label={`Mark ${item.task} as complete`}
                />
                <div className="flex-1">
                  <h4 className={`font-semibold text-sm text-gray-800 dark:text-slate-100 ${item.completed ? 'line-through' : ''}`}>{item.task}</h4>
                   <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-slate-400 mt-1">
                    {uniqueDates.length > 1 && selectedDate === 'all' && <span><strong>Date:</strong> {new Date(item.date + 'T00:00:00').toLocaleDateString()}</span>}
                    <span>{item.startTime} - {item.endTime}</span>
                    <span>({item.duration})</span>
                    {item.cost > 0 && <span><strong>${item.cost.toFixed(2)}</strong></span>}
                  </div>
                </div>
              </div>
              <div className='text-right flex-shrink-0'>
                  <PriorityBadge priority={item.priority} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white/50 dark:bg-slate-800/50 rounded-lg flex flex-col max-h-[80vh] border border-gray-200 dark:border-slate-700">
       {schedule && schedule.length > 0 && (
         <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex flex-col gap-4 flex-shrink-0">
            <CostSummary fullSchedule={schedule} dailySchedule={selectedDate === 'all' ? schedule : filteredSchedule} />
            <DateSelector dates={uniqueDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <ViewToggler viewMode={viewMode} setViewMode={setViewMode} />
        </div>
       )}
      <div className="p-4 overflow-y-auto flex-grow relative">
        {upcomingTask && <NotificationBanner task={upcomingTask} onDismiss={onDismissNotification} />}
        {renderContent()}
      </div>
    </div>
  );
};