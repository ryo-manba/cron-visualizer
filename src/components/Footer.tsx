import React from 'react';
import { FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="h-auto py-4 flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center justify-center gap-4">
        <a
          href="https://github.com/ryo-manba/cron-visualizer"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub Repository"
          className="text-gray-700 hover:text-gray-900"
        >
          <FaGithub size={28} />
        </a>
        <p className="text-sm text-gray-700">&copy; 2023 - 2025 ryo-manba</p>
      </div>
      <div className="flex items-center justify-center gap-4 text-sm">
        <a
          href="https://crontab.guru/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Cron Expression Reference
        </a>
        <span className="text-gray-400">|</span>
        <a
          href="https://github.com/ryo-manba/cron-visualizer/issues"
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Report an Issue
        </a>
      </div>
    </footer>
  );
};
