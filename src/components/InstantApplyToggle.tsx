import React from 'react';

interface InstantApplyToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export const InstantApplyToggle: React.FC<InstantApplyToggleProps> = ({ isEnabled, onToggle }) => {
  return (
    <div className="flex items-center gap-2">
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-14 h-7 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
        <span className="ml-3 text-lg font-medium text-gray-900 dark:text-gray-100">Instant Apply</span>
      </label>
    </div>
  );
};
