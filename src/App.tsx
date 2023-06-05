import React, { useState } from 'react';
import moment from 'moment-timezone';
import cronParser from 'cron-parser';
import { TimeFormatSelector } from './components/TimeFormatSelector';
import { ScatterChartComponent } from './components/ScatterChartComponent';
import { Footer } from './components/Footer';
import type { ScatterData } from './types/ScatterData';
import { formatDay } from './helpers/formatDay';

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
  const [cronExpression, setCronExpression] =
    useState<string>('*/30 9-18 *  * 1-5');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);
  const [timeFormat, setTimeFormat] = useState('JST');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleCronExpressionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCronExpression(e.target.value);
  };

  const visualizeCron = () => {
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
            const time = timeFormat === 'JST' ? moment(t) : convertUTCtoJST(t);

            const date = moment(time, 'YYYY-MM-DD HH:mm');
            const day = date.day();
            const hour = date.hour();
            const minute = date.minute();
            data.push({
              x: hour + minute / 60,
              y: day,
              z: 100,
              dayLabel: formatDay(day),
              time: `JST: ${date.format('YYYY-MM-DD HH:mm')}`,
            });
          }
        } catch (e) {
          break;
        }
      }
      setErrorMessage('');
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
    setParsedData(data);
  };

  return (
    <>
      <div className="p-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <h1 className="text-3xl mb-8 font-bold">Cron Visualizer</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto">
              <div className="flex flex-col gap-2 items-start">
                <label>Cron Expression</label>
                <div className="flex w-full">
                  <input
                    value={cronExpression}
                    onChange={handleCronExpressionChange}
                    placeholder="* * * * *"
                    aria-label="Enter cron expression"
                    className={`border p-2 rounded ${
                      errorMessage ? 'border-red-500' : ''
                    } w-full md:w-auto`}
                  />
                  <button
                    onClick={visualizeCron}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full md:w-auto ml-2"
                  >
                    Visualize
                  </button>
                </div>
              </div>
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>
          </div>
          <div className="mt-2">
            <TimeFormatSelector
              selected={timeFormat}
              onSelect={setTimeFormat}
            />
          </div>
          <ScatterChartComponent parsedData={parsedData} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default App;
