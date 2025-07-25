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
import { ScatterData } from '../types/ScatterData';
import { formatDay } from '../helpers/date';

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-gray-900 dark:text-white">{`${data.dayLabel}: ${data.time}`}</p>
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
    <div className="m-5">
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
            tick={{ fontSize: 14 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="day"
            unit=""
            ticks={Array.from({ length: 7 }, (_, i) => i)}
            domain={[0, 6]}
            tickFormatter={formatDay}
            tick={{ fontSize: 14 }}
          />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Scatter data={parsedData} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScatterChartComponent;
