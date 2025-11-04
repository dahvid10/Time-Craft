import React, { useMemo } from 'react';
import type { ScheduleItem } from '../types';

interface ScheduleTimelineProps {
  schedule: ScheduleItem[];
  onToggleTask: (taskId: string) => void;
}

const timeToMinutes = (timeStr: string): number => {
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return -1;
  let [_, hours, minutes, period] = match;
  let h = parseInt(hours, 10);
  if (period.toUpperCase() === 'PM' && h < 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return h * 60 + parseInt(minutes, 10);
};

const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
        case 'high': return 'bg-red-500/80 border-red-400';
        case 'medium': return 'bg-yellow-500/80 border-yellow-400';
        case 'low': return 'bg-green-500/80 border-green-400';
        default: return 'bg-slate-600 border-slate-500';
    }
}

const calculateLayout = (tasks: (ScheduleItem & { startMinutes: number; endMinutes: number })[]) => {
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

const formatHour = (hour: number): string => {
    const h = hour % 24;
    if (h === 0) return '12am';
    if (h === 12) return '12pm';
    if (h < 12) return `${h}am`;
    return `${h - 12}pm`;
};


export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({ schedule, onToggleTask }) => {
    const tasksWithMinutes = useMemo(() => {
        return schedule
            .map((item) => {
                const startMinutes = timeToMinutes(item.startTime);
                const endMinutes = timeToMinutes(item.endTime);
                return { ...item, startMinutes, endMinutes };
            })
            .filter(item => item.startMinutes !== -1 && item.endMinutes > item.startMinutes);
    }, [schedule]);

    const { timelineStartMinutes, totalTimelineMinutes, hours } = useMemo(() => {
        if (tasksWithMinutes.length === 0) {
            const start = 8 * 60; // Default 8 AM
            const end = 18 * 60; // Default 6 PM
            return {
                timelineStartMinutes: start,
                totalTimelineMinutes: end - start,
                hours: Array.from({ length: 11 }, (_, i) => 8 + i),
            };
        }

        const minStart = Math.min(...tasksWithMinutes.map(t => t.startMinutes));
        const maxEnd = Math.max(...tasksWithMinutes.map(t => t.endMinutes));

        const startHour = Math.floor(minStart / 60);
        let endHour = Math.ceil(maxEnd / 60);
        
        if (endHour - startHour < 4) {
            endHour = startHour + 4;
        }
        if (endHour > 24) endHour = 24;

        const timelineStartMinutes = startHour * 60;
        const timelineEndMinutes = endHour * 60;

        return {
            timelineStartMinutes,
            totalTimelineMinutes: Math.max(1, timelineEndMinutes - timelineStartMinutes),
            hours: Array.from({ length: endHour - startHour }, (_, i) => startHour + i),
        };
    }, [tasksWithMinutes]);
  
  const { layoutMap, totalLanes } = calculateLayout(tasksWithMinutes);
  const contentHeight = Math.max(200, totalLanes * 50);

  return (
    <div className="relative">
      {/* Hour Markers */}
      <div className="flex border-b-2 border-gray-200 dark:border-slate-700 pb-2">
        {hours.map(hour => (
          <div key={hour} className="text-xs text-gray-500 dark:text-slate-400 text-center" style={{ width: `${(60 / totalTimelineMinutes) * 100}%` }}>
            {formatHour(hour)}
          </div>
        ))}
      </div>
      
      {/* Scrollable Task Container */}
      <div className="relative mt-4 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
        {/* Inner container that defines the full height for positioning */}
        <div className="relative" style={{ height: `${contentHeight}px`}}>
           {/* Hour Grid Lines */}
          <div className="absolute inset-0 flex" aria-hidden="true">
            {hours.map(hour => (
              <div key={`grid-${hour}`} className="h-full border-l border-gray-200 dark:border-slate-700" style={{ width: `${(60 / totalTimelineMinutes) * 100}%` }}></div>
            ))}
          </div>

          {tasksWithMinutes.map((item) => {
            const left = ((item.startMinutes - timelineStartMinutes) / totalTimelineMinutes) * 100;
            const width = ((item.endMinutes - item.startMinutes) / totalTimelineMinutes) * 100;
            const layout = layoutMap.get(item.id);

            if (left < 0 || left > 100 || !layout) return null;
            
            const { laneIndex } = layout;
            const top = laneIndex * 50;
            const height = 45;

            return (
              <div
                key={item.id}
                className={`absolute flex items-center p-2 rounded-lg border-l-4 text-white overflow-hidden shadow-lg transition-all duration-300 ${getPriorityClass(item.priority)} ${item.completed ? 'opacity-40' : 'opacity-95'}`}
                style={{
                  left: `${left}%`,
                  width: `${Math.min(width, 100 - left)}%`,
                  top: `${top}px`,
                  height: `${height}px`,
                }}
                title={`${item.task} (${item.startTime} - ${item.endTime})`}
              >
                <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleTask(item.id)}
                    className="h-4 w-4 rounded bg-slate-900/50 border-slate-500 text-sky-400 focus:ring-sky-500 cursor-pointer flex-shrink-0"
                    aria-label={`Mark ${item.task} as complete`}
                  />
                <div className="ml-2 overflow-hidden flex-grow">
                  <p className={`text-sm font-bold truncate ${item.completed ? 'line-through' : ''}`}>{item.task}</p>
                  <p className="text-xs opacity-80 truncate">{item.startTime} - {item.endTime}</p>
                </div>
                {item.cost > 0 && (
                  <div className="text-xs font-bold bg-slate-900/50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                    ${item.cost.toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};