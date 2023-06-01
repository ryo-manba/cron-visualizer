import React, { useState } from 'react';
import moment from 'moment-timezone';
import cronParser from 'cron-parser';
import { TimeFormatSelector } from './TimeFormatSelector';
import { ScatterChartComponent } from './ScatterChartComponent';

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

/**
 * UTCの日時をJSTの日時に変換する関数
 * @param {string} utcTime - UTC形式の時間 ('ddd MMM D YYYY HH:mm:ss')
 * @returns {string} - JST形式の時間 ('YYYY-MM-DD HH:mm')
 */
const convertUTCtoJST = (utcTime: string): string => {
  const utcDate = moment.utc(utcTime, 'ddd MMM D YYYY HH:mm:ss');
  const jstDate = utcDate.clone().tz('Asia/Tokyo');
  return jstDate.format('YYYY-MM-DD HH:mm');
};

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('* * * * *');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);
  const [timeFormat, setTimeFormat] = useState('JST');

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
            const t = obj.value.toString();
            const time = timeFormat === 'JST' ? convertUTCtoJST(t) : t;

            const date = moment(time, 'YYYY-MM-DD HH:mm');
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
            placeholder="Enter cron expression"
            aria-label="Enter cron expression"
          />
          <TimeFormatSelector selected={timeFormat} onSelect={setTimeFormat} />
          <button onClick={visualizeCron}>Visualize</button>
        </div>
      </div>
      <ScatterChartComponent parsedData={parsedData} />
    </div>
  );
};

export default App;
