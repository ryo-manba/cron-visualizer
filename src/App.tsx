import React, { useState } from 'react';
import cronParser from 'cron-parser';
import moment from 'moment-timezone';
import TimeWheel from './TimeWheel';

function App() {
  const [cronExpression, setCronExpression] = useState<string>('*/3 0-8 * * 6');
  const [timeZone, setTimeZone] = useState<string>('UTC');
  const [parsedDates, setParsedDates] = useState<string[]>([]);

  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronExpression(e.target.value);
  }

  const handleTimeZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeZone(e.target.value);
  }

  const visualizeCron = () => {
    let options = {
      currentDate: new Date(),
      tz: timeZone,
    };
    let interval = cronParser.parseExpression(cronExpression, options);
    let dates: string[] = [];
    for (let i = 0; i < 24; i++) {
      const date = interval.next().toDate();
      const utcHour = moment(date).utc().hour();
      const jstHour = moment(date).tz('Asia/Tokyo').hour();

      // UTC時間が0-8 (つまりJST時間が9-17)の間であれば、日付を追加
      if (utcHour >= 0 && utcHour < 9) {
        dates.push(moment(date).tz(timeZone).format('HH:mm') + " (JST: " + jstHour + ":00)");
      }
    }
    setParsedDates(dates);
  }

  return (
    <div>
      <input value={cronExpression} onChange={handleCronExpressionChange} placeholder="Enter cron expression" />
      <select value={timeZone} onChange={handleTimeZoneChange}>
        <option value="UTC">UTC</option>
        <option value="Asia/Tokyo">JST</option>
      </select>
      <button onClick={visualizeCron}>Visualize</button>
      <TimeWheel dates={parsedDates} />
    </div>
  );
}

export default App;
