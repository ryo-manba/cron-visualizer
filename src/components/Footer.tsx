import React from 'react';
import { FaGithub } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="h-16 flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center justify-center">
        <a
          href="https://github.com/ryo-manba/cron-visualizer"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub Repository"
          className="mr-2 text-gray-700 hover:text-gray-900"
        >
          <FaGithub size={28} />
        </a>
        <p className="text-sm text-gray-700">&copy; 2023 ryo-manba</p>
      </div>
    </footer>
  );
};
