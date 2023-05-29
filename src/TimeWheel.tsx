import React from 'react';

interface TimeWheelProps {
  dates: string[];
}

const TimeWheel: React.FC<TimeWheelProps> = ({ dates }) => {
  return (
    <ul>
      {dates.map((date, index) => (
        <li key={index}>{date}</li>
      ))}
    </ul>
  );
}

export default TimeWheel;
