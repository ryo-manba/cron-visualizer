import React from 'react';

type TimeFormatSelectorProps = {
  selected: string;
  onSelect: (value: string) => void;
};

export const TimeFormatSelector: React.FC<TimeFormatSelectorProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div>
      <label>
        <input
          type="radio"
          value="JST"
          checked={selected === 'JST'}
          onChange={(e) => onSelect(e.target.value)}
        />
        JST
      </label>
      <label>
        <input
          type="radio"
          value="UTCtoJST"
          checked={selected === 'UTCtoJST'}
          onChange={(e) => onSelect(e.target.value)}
        />
        UTC to JST
      </label>
    </div>
  );
};
