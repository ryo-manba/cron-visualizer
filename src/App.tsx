import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { FaInfoCircle, FaCopy } from 'react-icons/fa';
import { TimeFormatSelector } from './components/TimeFormatSelector';
import { ScatterChartComponent } from './components/ScatterChartComponent';
import { Footer } from './components/Footer';
import { InstantApplyToggle } from './components/InstantApplyToggle';
import { useDebounce } from './hooks/useDebounce';
import type { ScatterData } from './types/ScatterData';
import { TimeFormat } from './types/TimeFormat';
import { generateScatterData } from './helpers/generateScatterData';

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('*/30 9-18 *  * 1-5');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormat.JST);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [instantApply, setInstantApply] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Debounce the cron expression to prevent excessive processing
  const debouncedCronExpression = useDebounce(cronExpression, 500);

  // Handle change in the Cron expression input
  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronExpression(e.target.value);
  };

  // Generate scatter chart data based on the Cron expression and time format
  const visualizeCron = (expression?: string) => {
    const targetExpression = expression || cronExpression;
    if (!targetExpression.trim()) {
      setParsedData([]);
      setErrorMessage('');
      return;
    }

    setIsProcessing(true);
    try {
      const data = generateScatterData(targetExpression, timeFormat);
      setParsedData(data);
      setErrorMessage('');
    } catch (err) {
      setParsedData([]);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy cron expression to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cronExpression);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Auto-apply changes when in instant apply mode with debouncing
  useEffect(() => {
    if (instantApply && debouncedCronExpression) {
      visualizeCron(debouncedCronExpression);
    }
  }, [debouncedCronExpression, timeFormat, instantApply]);

  return (
    <>
      <div className="p-10 flex flex-col min-h-screen">
        <div className="flex-grow">
          <header className="text-center mb-8">
            <h1 className="text-4xl mb-4 font-bold">Cron Visualizer</h1>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Visualize when your cron jobs will run on a weekly calendar.
            </p>
          </header>
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl">
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <label className="inline-flex items-center text-lg font-medium">
                    Cron Expression
                    <a
                      data-tooltip-id="my-tooltip"
                      data-tooltip-content="A short interval may cause freezing."
                      className="ml-1 cursor-pointer"
                    >
                      <FaInfoCircle className="text-gray-500" size={18} />
                    </a>
                    <Tooltip id="my-tooltip" />
                  </label>
                </div>
                <div className="flex w-full gap-2">
                  <div className="relative flex-1">
                    <input
                      value={cronExpression}
                      onChange={handleCronExpressionChange}
                      placeholder="* * * * *"
                      aria-label="Enter cron expression"
                      className={`border-2 p-4 text-xl font-mono text-center rounded-lg pr-12 ${errorMessage ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'} w-full transition-colors outline-none bg-gray-50`}
                    />
                    <button
                      onClick={handleCopy}
                      aria-label="Copy cron expression"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100 transition-colors"
                      title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                    >
                      <FaCopy size={20} />
                    </button>
                    {copySuccess && (
                      <span className="absolute -top-8 right-0 text-sm text-green-600 bg-white px-2 py-1 rounded shadow">
                        Copied!
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => visualizeCron()}
                    disabled={isProcessing || instantApply}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 text-lg rounded-lg whitespace-nowrap transition-colors"
                  >
                    {isProcessing ? 'Processing...' : 'Visualize'}
                  </button>
                </div>
              </div>
              {errorMessage && <p className="text-red-500 mt-2 text-center">{errorMessage}</p>}
              {isProcessing && instantApply && <p className="text-blue-500 mt-2 text-sm text-center">Processing...</p>}
              
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                <TimeFormatSelector selected={timeFormat} onSelect={setTimeFormat} />
                <div className="text-gray-400">|</div>
                <InstantApplyToggle isEnabled={instantApply} onToggle={setInstantApply} />
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <ScatterChartComponent parsedData={parsedData} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default App;
