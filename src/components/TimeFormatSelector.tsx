import React from 'react';
import { TimeFormat } from '../types/TimeFormat';

type TimeFormatSelectorProps = {
  selected: TimeFormat;
  onSelect: (value: TimeFormat) => void;
};

export const TimeFormatSelector: React.FC<TimeFormatSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="flex gap-4">
      <label className="inline-flex items-center">
        <input
          type="radio"
          value={TimeFormat.JST}
          checked={selected === TimeFormat.JST}
          onChange={(e) => onSelect(e.target.value as TimeFormat)}
          className="form-radio text-blue-600"
        />
        <span className="ml-2">JST</span>
      </label>
      <label className="inline-flex items-center">
        <input
          type="radio"
          value={TimeFormat.UTC}
          checked={selected === TimeFormat.UTC}
          onChange={(e) => onSelect(e.target.value as TimeFormat)}
          className="form-radio text-blue-600"
        />
        <span className="ml-2">UTC to JST</span>
      </label>
    </div>
  );
};
