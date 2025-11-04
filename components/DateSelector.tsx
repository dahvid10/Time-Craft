import React from 'react';

interface DateSelectorProps {
  dates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00'); // Ensure correct timezone handling
    return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

export const DateSelector: React.FC<DateSelectorProps> = ({ dates, selectedDate, onSelectDate }) => {
  if (dates.length <= 1) {
    return null;
  }
  
  const renderButton = (date: string, text: string) => {
    const isActive = date === selectedDate;
    const baseClasses = "px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 flex-shrink-0";
    const activeClasses = "bg-sky-500 text-white";
    const inactiveClasses = "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600";
    
    return (
      <button
        key={date}
        onClick={() => onSelectDate(date)}
        className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        aria-pressed={isActive}
      >
        {text}
      </button>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
        <div className="flex items-center gap-2 pb-2 whitespace-nowrap">
            {renderButton('all', 'All Days')}
            {dates.map(date => renderButton(date, formatDate(date)))}
        </div>
    </div>
  );
};