import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { SaveIcon } from './icons/SaveIcon';

interface ChatInterfaceProps {
  userInput: string;
  setUserInput: (userInput: string) => void;
  onUpdate: () => void;
  isLoading: boolean;
  onSuggest: () => void;
  isSuggesting: boolean;
  onSummarize: () => void;
  isSummarizing: boolean;
  hasSchedule: boolean;
  onSavePlan: () => void;
  activePlanId: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ userInput, setUserInput, onUpdate, isLoading, onSuggest, isSuggesting, onSummarize, isSummarizing, hasSchedule, onSavePlan, activePlanId }) => {
  const isAnyLoading = isLoading || isSuggesting || isSummarizing;

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md flex flex-col gap-4 border border-gray-200 dark:border-slate-700">
      <label htmlFor="user-input-textarea" className="text-gray-600 dark:text-slate-300 font-medium">
        Describe your goals, or ask for changes to the current plan.
      </label>
      <textarea
        id="user-input-textarea"
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder='e.g., "Plan my upcoming weekend", "Add a workout at 7pm on Friday", or "Delay the marketing campaign by one week"...'
        className="w-full h-40 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 rounded-md p-3 border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition"
      />
      <div className="flex flex-col gap-2">
        <button
          onClick={onUpdate}
          disabled={isAnyLoading}
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {hasSchedule ? 'Updating...' : 'Crafting...'}
            </>
          ) : (
            <>
              <SparklesIcon />
              {hasSchedule ? 'Update Schedule' : 'Generate Plan'}
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
         <button
          onClick={onSavePlan}
          disabled={isAnyLoading || !hasSchedule}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasSchedule ? "Generate a schedule first to save it" : "Save changes to this plan"}
        >
          <SaveIcon />
          {activePlanId ? 'Update Current Plan' : 'Save as New Plan'}
        </button>
         <button
          onClick={onSuggest}
          disabled={isAnyLoading || !hasSchedule}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasSchedule ? "Generate a schedule first to get suggestions" : "Get AI suggestions to optimize this schedule"}
        >
          {isSuggesting ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <LightBulbIcon />
          )}
          Suggest
        </button>
        <button
          onClick={onSummarize}
          disabled={isAnyLoading || !hasSchedule}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={!hasSchedule ? "Generate a schedule first to get a summary" : "Get an AI-powered summary of this plan"}
        >
          {isSummarizing ? (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <DocumentTextIcon />
          )}
          Summary
        </button>
      </div>
    </div>
  );
};