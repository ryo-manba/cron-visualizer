import React, { useState } from 'react';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';
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

const formatDay = (tick: number) => {
  return DAYS[tick];
};

type ScatterData = {
  x: number;
  y: number;
  z: number;
  dayLabel: string;
  time: string;
};

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Time : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('* * * * *');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);

  const handleCronExpressionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCronExpression(e.target.value);
  };

  const visualizeCron = () => {
    console.log('Start calculation');
    const data: ScatterData[] = [];

    const options = {
      currentDate: moment().startOf('week').toDate(),
      endDate: moment().endOf('week').toDate(),
      iterator: true,
      tz: 'Asia/Tokyo',
    };

    try {
      const interval = cronParser.parseExpression(cronExpression, options);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const obj = interval.next();
          if ('done' in obj) {
            const date = moment(obj.value.toString());
            const day = date.day();
            const hour = date.hour();
            const minute = date.minute();
            data.push({
              x: hour + minute / 60,
              y: day,
              z: 100,
              dayLabel: DAYS[day],
              time: `JST: ${date.format('YYYY-MM-DD HH:mm')}`,
            });
          }
        } catch (e) {
          break;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        console.log('Error: ' + err.message);
      }
    }
    setParsedData(data);
    console.log('Finish calculation: ', data);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div style={{ margin: '20px' }}>
        <h1>Cron Visualizer</h1>
      </div>
      <div>
        <div style={{ margin: '20px' }}>
          <input
            value={cronExpression}
            onChange={handleCronExpressionChange}
            placeholder="Enter cron expression (in JST)"
            aria-label="Enter cron expression (in JST)"
          />
          <button onClick={visualizeCron}>Visualize</button>
        </div>
      </div>
      <div style={{ margin: '20px' }}>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
    </div>
  );
};

export default App;
