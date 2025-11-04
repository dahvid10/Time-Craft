import React from 'react';
import { MoonIcon } from './icons/MoonIcon';
import { SunIcon } from './icons/SunIcon';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  return (
    <header className="relative text-center py-8 px-4 border-b border-gray-200 dark:border-slate-700">
      <h1 className="text-4xl md:text-5xl font-extrabold">
        <span className="bg-gradient-to-r from-sky-500 to-indigo-600 text-transparent bg-clip-text">
          Time Craft
        </span>
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mt-2 text-lg">
        Craft your schedule with the power of AI.
      </p>
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
      </button>
    </header>
  );
};