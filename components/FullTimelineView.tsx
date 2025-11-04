import React, { useMemo } from 'react';
import type { ScheduleItem, Plan } from '../types';

interface FullTimelineViewProps {
  schedule: ScheduleItem[];
  plans: Plan[];
  onToggleTask: (taskId: string) => void;
  onSelectTask: (task: ScheduleItem) => void;
}

const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return -1;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  if (period.toUpperCase() === 'PM' && h < 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0; // Midnight case
  return h * 60 + parseInt(minutes, 10);
};

const calculateTaskLayout = (tasks: (ScheduleItem & { startMinutes: number; endMinutes: number })[]) => {
  const sortedTasks = [...tasks].sort((a, b) => a.startMinutes - b.startMinutes);
  const lanes: (ScheduleItem & { startMinutes: number; endMinutes: number })[][] = [];

  for (const task of sortedTasks) {
    let placed = false;
    for (const lane of lanes) {
      const lastTaskInLane = lane[lane.length - 1];
      if (task.startMinutes >= lastTaskInLane.endMinutes) {
        lane.push(task);
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.push([task]);
    }
  }

  const layoutMap = new Map<string, { laneIndex: number; totalLanes: number }>();
  lanes.forEach((lane, laneIndex) => {
    lane.forEach(task => {
      layoutMap.set(task.id, { laneIndex, totalLanes: lanes.length });
    });
  });

  return { layoutMap, totalLanes: lanes.length };
};

const generateColor = (id: string, planIds: string[]) => {
    const colors = ['bg-red-500/80', 'bg-yellow-500/80', 'bg-green-500/80', 'bg-blue-500/80', 'bg-purple-500/80', 'bg-pink-500/80'];
    const index = planIds.indexOf(id);
    return colors[index % colors.length] || 'bg-slate-600';
};

const formatHour = (hour: number): string => {
    const h = hour % 24;
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
};

export const FullTimelineView: React.FC<FullTimelineViewProps> = ({ schedule, plans, onToggleTask, onSelectTask }) => {

  const {
    sortedDates,
    tasksByDate,
    planColors,
    dailyLayouts,
    maxLanes,
    timelineStartMinutes,
    totalTimelineMinutes,
    hours,
  } = useMemo(() => {
    const dates = new Set(schedule.map(item => item.date));
    const sorted = Array.from(dates).sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
    
    const groupedTasks = new Map<string, ScheduleItem[]>();
    sorted.forEach((date: string) => {
        groupedTasks.set(date, schedule.filter(item => item.date === date));
    });
    
    const uniquePlanIds = Array.from(new Set(schedule.map(s => s.planId).filter(Boolean) as string[]));
    const colors = new Map<string, string>();
    uniquePlanIds.forEach(id => {
      colors.set(id, generateColor(id, uniquePlanIds));
    });

    const allTasksWithMinutes = schedule
        .map(item => ({...item, startMinutes: timeToMinutes(item.startTime), endMinutes: timeToMinutes(item.endTime)}))
        .filter(item => item.startMinutes >= 0 && item.endMinutes > item.startMinutes);

    let timelineStartMinutes = 8 * 60;
    let timelineEndMinutes = 18 * 60;
    let hours = Array.from({ length: 11 }, (_, i) => 8 + i);

    if (allTasksWithMinutes.length > 0) {
        const minStart = Math.min(...allTasksWithMinutes.map(t => t.startMinutes));
        const maxEnd = Math.max(...allTasksWithMinutes.map(t => t.endMinutes));
        const startHour = Math.floor(minStart / 60);
        let endHour = Math.ceil(maxEnd / 60);

        if (endHour - startHour < 4) {
            endHour = startHour + 4;
        }
        if (endHour > 24) endHour = 24;

        timelineStartMinutes = startHour * 60;
        timelineEndMinutes = endHour * 60;
        hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
    }
    const totalTimelineMinutes = Math.max(1, timelineEndMinutes - timelineStartMinutes);

    const layouts = new Map<string, ReturnType<typeof calculateTaskLayout>>();
    let maxLanesAcrossDays = 1;
    sorted.forEach((date: string) => {
      const dailyTasksWithMinutes = (groupedTasks.get(date) || [])
        .map(item => ({...item, startMinutes: timeToMinutes(item.startTime), endMinutes: timeToMinutes(item.endTime)}))
        .filter(item => item.startMinutes >= 0 && item.endMinutes > item.startMinutes);
      const layoutResult = calculateTaskLayout(dailyTasksWithMinutes);
      layouts.set(date, layoutResult);
      if (layoutResult.totalLanes > maxLanesAcrossDays) {
        maxLanesAcrossDays = layoutResult.totalLanes;
      }
    });

    return { 
      sortedDates: sorted, 
      tasksByDate: groupedTasks, 
      planColors: colors,
      dailyLayouts: layouts,
      maxLanes: maxLanesAcrossDays,
      timelineStartMinutes,
      totalTimelineMinutes,
      hours,
    };
  }, [schedule]);
  
  const planNameMap = useMemo(() => {
      return new Map(plans.map(p => [p.id, p.name]));
  }, [plans]);

  const contentHeight = Math.max(200, maxLanes * 50);

  if (sortedDates.length === 0) {
    return <div className="text-center text-gray-500 dark:text-slate-400">No tasks to display in timeline.</div>;
  }

  return (
    <div className="overflow-x-auto p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
      <div className="flex" style={{ width: `${sortedDates.length * 350}px`}}>
        {sortedDates.map(date => {
          const dailyTasks = (tasksByDate.get(date) || [])
            .map(item => ({...item, startMinutes: timeToMinutes(item.startTime), endMinutes: timeToMinutes(item.endTime)}))
            .filter(item => item.startMinutes >= 0 && item.endMinutes > item.startMinutes);
            
          const layoutData = dailyLayouts.get(date);
          const dailyContentHeight = Math.max(200, (layoutData?.totalLanes || 1) * 50);

          return (
            <div key={date} className="w-full border-r border-gray-200 dark:border-slate-600 p-2 min-w-[350px]">
              <h3 className="font-bold text-center text-sky-600 dark:text-sky-400 mb-2">{new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</h3>
              
              <div className="flex border-b border-gray-200 dark:border-slate-700 pb-1 mb-2">
                {hours.map(hour => (
                  <div key={`label-${date}-${hour}`} className="text-xs text-gray-500 dark:text-slate-400 text-center" style={{ width: `${(60 / totalTimelineMinutes) * 100}%` }}>
                    {formatHour(hour)}
                  </div>
                ))}
              </div>

              <div className="relative bg-white dark:bg-slate-700 rounded-md overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
                <div className="relative" style={{ height: `${dailyContentHeight}px`}}>
                    <div className="absolute inset-0 flex" aria-hidden="true">
                        {hours.map(hour => (
                            <div key={`grid-${date}-${hour}`} className="h-full border-l border-gray-200 dark:border-slate-600" style={{ width: `${(60 / totalTimelineMinutes) * 100}%` }}></div>
                        ))}
                    </div>

                    {dailyTasks.map((item) => {
                      const left = Math.max(0, ((item.startMinutes - timelineStartMinutes) / totalTimelineMinutes) * 100);
                      const width = ((item.endMinutes - item.startMinutes) / totalTimelineMinutes) * 100;
                      const layout = layoutData?.layoutMap.get(item.id);

                      if (!layout) return null;

                      const { laneIndex } = layout;
                      const top = laneIndex * 50;
                      const height = 45;

                      const planColor = item.planId ? planColors.get(item.planId) : 'bg-slate-600';
                      const planName = item.planId ? planNameMap.get(item.planId) : 'Unsaved';

                      return (
                        <div
                          onClick={() => onSelectTask(item)}
                          key={item.id}
                          className={`absolute flex items-center p-1.5 rounded text-white overflow-hidden shadow-md transition-all duration-300 cursor-pointer ${planColor} ${item.completed ? 'opacity-40' : 'opacity-95'}`}
                          style={{
                            left: `${left}%`,
                            width: `${Math.min(width, 100 - left)}%`,
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                          title={`Click to view details for: ${planName}: ${item.task} (${item.startTime} - ${item.endTime})`}
                        >
                           <input
                                type="checkbox"
                                onClick={(e) => e.stopPropagation()}
                                checked={item.completed}
                                onChange={() => onToggleTask(item.id)}
                                className="h-4 w-4 rounded bg-slate-900/50 border-slate-500 text-sky-400 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                                aria-label={`Mark ${item.task} as complete`}
                            />
                           <div className="ml-2 overflow-hidden flex-grow">
                                <p className={`text-xs font-bold truncate ${item.completed ? 'line-through' : ''}`}>{item.task}</p>
                                <p className="text-[10px] opacity-80 truncate">{item.startTime} - {item.endTime}</p>
                           </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};