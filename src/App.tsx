import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { FaInfoCircle } from 'react-icons/fa';
import { TimeFormatSelector } from './components/TimeFormatSelector';
import { ScatterChartComponent } from './components/ScatterChartComponent';
import { Footer } from './components/Footer';
import type { ScatterData } from './types/ScatterData';
import { TimeFormat } from './types/TimeFormat';
import { generateScatterData } from './helpers/generateScatterData';

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('*/30 9-18 *  * 1-5');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormat.JST);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle change in the Cron expression input
  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronExpression(e.target.value);
  };

  // Generate scatter chart data based on the Cron expression and time format
  const visualizeCron = () => {
    try {
      const data = generateScatterData(cronExpression, timeFormat);
      setParsedData(data);
      setErrorMessage('');
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    }
  };

  return (
    <>
      <div className="p-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <h1 className="text-3xl mb-8 font-bold">Cron Visualizer</h1>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-auto">
              <div className="flex flex-col gap-2 items-start">
                <label className="flex items-center">
                  Cron Expression
                  <a
                    data-tooltip-id="my-tooltip"
                    data-tooltip-content="A short interval may cause freezing."
                    className="ml-1 cursor-pointer"
                  >
                    <FaInfoCircle className="info-icon" />
                  </a>
                  <Tooltip id="my-tooltip" />
                </label>
                <div className="flex w-full">
                  <input
                    value={cronExpression}
                    onChange={handleCronExpressionChange}
                    placeholder="* * * * *"
                    aria-label="Enter cron expression"
                    className={`border p-2 rounded ${errorMessage ? 'border-red-500' : ''} w-full md:w-auto`}
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
            <TimeFormatSelector selected={timeFormat} onSelect={setTimeFormat} />
          </div>
          <ScatterChartComponent parsedData={parsedData} />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default App;
