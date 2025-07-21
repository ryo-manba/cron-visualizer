import React, { useState, useEffect, useRef } from 'react';
import { FaSun, FaMoon, FaDesktop } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  onReset?: () => void;
  isUserPreference?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, onToggle, onReset, isUserPreference }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleToggle = () => {
    onToggle();
    setShowMenu(false);
  };

  const handleReset = () => {
    onReset?.();
    setShowMenu(false);
  };

  return (
    <div className="fixed top-4 right-4" ref={menuRef}>
      <button
        onClick={handleToggle}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowMenu(!showMenu);
        }}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        data-tooltip-id="dark-mode-tooltip"
        data-tooltip-content={isUserPreference ? 'Right-click to use system setting' : 'Following system preference'}
        className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors relative"
      >
        {isDarkMode ? <FaSun className="text-yellow-500" size={20} /> : <FaMoon className="text-gray-700" size={20} />}
        {!isUserPreference && <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>}
      </button>
      <Tooltip id="dark-mode-tooltip" />

      {showMenu && onReset && (
        <div className="absolute top-14 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <FaDesktop size={14} />
            Use system setting
          </button>
        </div>
      )}
    </div>
  );
};
