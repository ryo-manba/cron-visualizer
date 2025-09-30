import React from 'react';
import { TimeFormat } from '../types/TimeFormat';

type TimeFormatSelectorProps = {
  selected: TimeFormat;
  onSelect: (value: TimeFormat) => void;
};

export const TimeFormatSelector: React.FC<TimeFormatSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="flex gap-4">
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          value={TimeFormat.JST}
          checked={selected === TimeFormat.JST}
          onChange={(e) => onSelect(e.target.value as TimeFormat)}
          className="w-4 h-4 text-blue-600 cursor-pointer"
        />
        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">JST</span>
      </label>
      <label className="flex items-center cursor-pointer">
        <input
          type="radio"
          value={TimeFormat.UTC}
          checked={selected === TimeFormat.UTC}
          onChange={(e) => onSelect(e.target.value as TimeFormat)}
          className="w-4 h-4 text-blue-600 cursor-pointer"
        />
        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">UTC to JST</span>
      </label>
    </div>
  );
};
