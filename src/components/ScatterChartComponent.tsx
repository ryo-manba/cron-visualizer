import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

type ScatterData = {
  x: number;
  y: number;
  z: number;
  dayLabel: string;
  time: string;
};

const formatDay = (tick: number) => {
  return DAYS[tick];
};

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p>{`${data.dayLabel}: ${data.time}`}</p>
      </div>
    );
  }
  return null;
};

type Props = {
  parsedData: ScatterData[];
};

export const ScatterChartComponent = ({ parsedData }: Props) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ margin: '20px' }}>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="time"
            unit="h"
            domain={[0, 24]}
            ticks={hours}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="day"
            unit=""
            ticks={Array.from({ length: 7 }, (_, i) => i)}
            domain={[0, 6]}
            tickFormatter={formatDay}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<CustomTooltip />}
          />
          <Scatter name="A school" data={parsedData} fill="red" />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;
