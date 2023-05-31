import React, { useState } from 'react';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';
import {
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
} from 'recharts';

type BarData = {
  minute: number;
  hour: number;
  day: number;
  dayLabel: string;
  cronApplied: boolean;
  time: string;
};

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('* * * * *');
  const [parsedData, setParsedData] = useState<BarData[]>([]);

  const handleCronExpressionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCronExpression(e.target.value);
  };

  const visualizeCron = () => {
    console.log('Start calculation');
    const data: BarData[] = [];

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
              minute,
              day,
              dayLabel: DAYS[day],
              hour,
              cronApplied: true,
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

    // DEBUG:
    data.map((entry, index) => {
      if (entry.cronApplied) {
        console.log('entry: ', entry);
      }
    });

    setParsedData(data);
    console.log('Finish calculation: ', data);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <div>
        <input
          value={cronExpression}
          onChange={handleCronExpressionChange}
          placeholder="Enter cron expression (in JST)"
          aria-label="Enter cron expression (in JST)"
        />
        <button onClick={visualizeCron}>Visualize</button>
      </div>
      <CartesianGrid strokeDasharray="10 10" />
      <XAxis dataKey="hour" type="number" ticks={hours} domain={[0, 23]} />
      <YAxis dataKey="dayLabel" type="category" />
      <Tooltip />
      <ScatterChart
        width={1200}
        height={500}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="10 10" />
        <XAxis dataKey="hour" type="number" ticks={hours} domain={[0, 23]} />
        <YAxis dataKey="dayLabel" type="category" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter
          data={parsedData.filter((entry) => entry.cronApplied)}
          fill="red"
        />
      </ScatterChart>
    </div>
  );
};

export default App;
