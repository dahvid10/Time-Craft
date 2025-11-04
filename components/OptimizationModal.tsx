import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface OptimizationModalProps {
  suggestions: string | null;
  isLoading: boolean;
  onClose: () => void;
}

export const OptimizationModal: React.FC<OptimizationModalProps> = ({ suggestions, isLoading, onClose }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (suggestions) {
      const parsedHtml = marked.parse(suggestions, { gfm: true, breaks: true });
      setHtmlContent(parsedHtml as string);
    }
  }, [suggestions]);
  
  const handleCopy = () => {
    if (suggestions) {
        navigator.clipboard.writeText(suggestions);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
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
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
                <div className='flex items-center gap-3'>
                    <div className="bg-amber-500/20 p-2 rounded-full">
                        <LightBulbIcon className="h-6 w-6 text-amber-500" />
                    </div>
                    <h2 className="text-xl font-bold text-amber-600">Optimization Suggestions</h2>
                </div>
                {suggestions && !isLoading && (
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 text-sm bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-200 font-semibold py-1 px-3 rounded-md transition-colors"
                    >
                        {isCopied ? <CheckIcon /> : <CopyIcon />}
                        {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                )}
            </div>
        </div>
        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="min-h-[150px] flex flex-col items-center justify-center text-center animate-pulse">
                <div className="text-sky-600 dark:text-sky-400 font-semibold">Analyzing your schedule...</div>
                <div className="text-gray-500 dark:text-slate-400 mt-2">The AI is looking for ways to improve your plan.</div>
            </div>
          )}

          {suggestions && (
             <div 
                className="prose prose-sm max-w-none text-gray-700 dark:text-slate-300 prose-ul:list-disc prose-ul:ml-4 prose-p:my-2 prose-li:my-2 prose-ul:my-4"
                dangerouslySetInnerHTML={{ __html: htmlContent }} 
            />
          )}
        </div>
      </div>
    </div>
  );
};