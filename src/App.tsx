import React, { useState } from 'react';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

type BarData = {
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
    const data: BarData[] = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const date = moment().day(day).hour(hour);
        const utcDate = date.clone().utc();
        const cronSchedule = cronParser.parseExpression(cronExpression, {
          currentDate: utcDate.toDate(),
          tz: 'Asia/Tokyo',
        });
        const nextSchedule = moment(cronSchedule.next().toDate());
        const cronApplied = nextSchedule.isSame(date, 'hour');
        data.push({
          day,
          dayLabel: DAYS[day],
          hour,
          cronApplied,
          time: `UTC: ${utcDate.format('YYYY-MM-DD HH:mm')} JST: ${date.format(
            'YYYY-MM-DD HH:mm',
          )}`,
        });
      }
    }
    setParsedData(data);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div>
      <input
        value={cronExpression}
        onChange={handleCronExpressionChange}
        placeholder="Enter cron expression (in JST)"
      />
      <button onClick={visualizeCron}>Visualize</button>
      <BarChart
        width={1200}
        height={500}
        data={parsedData.filter((d) => d.cronApplied)}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" type="number" ticks={hours} domain={[0, 23]} />
        <YAxis dataKey="dayLabel" type="category" />
        <Tooltip />
        <Bar dataKey="cronApplied" fill="#8884d8">
          {parsedData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.cronApplied ? '#8884d8' : '#ffffff00'}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
};

export default App;
