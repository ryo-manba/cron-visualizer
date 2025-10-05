import React, { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { FaInfoCircle, FaCopy } from 'react-icons/fa';
import { TimeFormatSelector } from './components/TimeFormatSelector';
import { ScatterChartComponent } from './components/ScatterChartComponent';
import { Footer } from './components/Footer';
import { InstantApplyToggle } from './components/InstantApplyToggle';
import { DarkModeToggle } from './components/DarkModeToggle';
import { ExperimentalToggle } from './components/ExperimentalToggle';
import { useDebounce } from './hooks/useDebounce';
import { useDarkMode } from './hooks/useDarkMode';
import type { ScatterData } from './types/ScatterData';
import { TimeFormat } from './types/TimeFormat';
import { generateScatterData } from './helpers/generateScatterData';
import { generateScatterDataWasm } from './helpers/generateScatterDataWasm';

const App = () => {
  const [cronExpression, setCronExpression] = useState<string>('*/30 9-18 *  * 1-5');
  const [parsedData, setParsedData] = useState<ScatterData[]>([]);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(TimeFormat.JST);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [instantApply, setInstantApply] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isWasmEnabled, setIsWasmEnabled] = useState<boolean>(false);
  const { isDarkMode, toggleDarkMode, resetToSystemPreference, isUserPreference } = useDarkMode();

  // Debounce the cron expression to prevent excessive processing
  const debouncedCronExpression = useDebounce(cronExpression, 500);

  // Handle change in the Cron expression input
  const handleCronExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCronExpression(e.target.value);
  };

  // Generate scatter chart data based on the Cron expression and time format
  const visualizeCron = async (expression?: string) => {
    const targetExpression = expression || cronExpression;
    if (!targetExpression.trim()) {
      setParsedData([]);
      setErrorMessage('');
      return;
    }

    setIsProcessing(true);
    const startTime = performance.now();
    try {
      let data: ScatterData[];
      if (isWasmEnabled) {
        // Use WASM version
        data = generateScatterDataWasm(targetExpression, timeFormat);
      } else {
        // Use standard JavaScript version
        data = generateScatterData(targetExpression, timeFormat);
      }
      const endTime = performance.now();
      const time = endTime - startTime;
      setExecutionTime(time);
      setParsedData(data);
      setErrorMessage('');
    } catch (err) {
      setExecutionTime(null);
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
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <DarkModeToggle
          isDarkMode={isDarkMode}
          onToggle={toggleDarkMode}
          onReset={resetToSystemPreference}
          isUserPreference={isUserPreference}
        />
        <div className="p-10 flex flex-col min-h-screen">
          <div className="flex-grow">
            <header className="text-center mb-8">
              <h1 className="text-4xl mb-4 font-bold text-gray-900 dark:text-white">Cron Visualizer</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg max-w-3xl mx-auto">
                Visualize when your cron jobs will run on a weekly calendar.
              </p>
            </header>
            <div className="flex flex-col items-center">
              <div className="w-full max-w-2xl">
                <div className="flex flex-col gap-4">
                  <div className="text-center">
                    <label className="inline-flex items-center text-lg font-medium dark:text-gray-100">
                      Cron Expression
                      <a
                        data-tooltip-id="my-tooltip"
                        data-tooltip-content="A short interval may cause freezing."
                        className="ml-1"
                      >
                        <FaInfoCircle className="text-gray-500 dark:text-gray-300" size={18} />
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
                        className={`border-2 p-4 text-xl font-mono text-center rounded-lg pr-12 ${
                          errorMessage
                            ? 'border-red-500 dark:border-red-400'
                            : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                        } w-full transition-colors outline-none bg-gray-50 dark:bg-gray-800 dark:text-white`}
                      />
                      <button
                        onClick={handleCopy}
                        aria-label="Copy cron expression"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                      >
                        <FaCopy size={20} />
                      </button>
                      {copySuccess && (
                        <span className="absolute -top-8 right-0 text-sm text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                          Copied!
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => visualizeCron()}
                      disabled={isProcessing || instantApply}
                      className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 text-lg rounded-lg whitespace-nowrap transition-colors"
                    >
                      {isProcessing ? 'Processing...' : 'Visualize'}
                    </button>
                  </div>
                </div>
                {errorMessage && <p className="text-red-500 dark:text-red-400 mt-2 text-center">{errorMessage}</p>}
                <div className="mt-2 text-center h-6">
                  {isProcessing && instantApply && (
                    <p className="text-blue-500 dark:text-blue-300 text-sm">Processing...</p>
                  )}
                  {executionTime !== null && parsedData.length > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Execution time: <span className="font-mono font-bold">{executionTime.toFixed(2)}ms</span> (
                      {parsedData.length} data points)
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-col lg:flex-row gap-4 justify-center items-center">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <TimeFormatSelector selected={timeFormat} onSelect={setTimeFormat} />
                    <div className="hidden sm:block text-gray-400 dark:text-gray-600">|</div>
                    <InstantApplyToggle isEnabled={instantApply} onToggle={setInstantApply} />
                  </div>
                  <div className="hidden lg:block text-gray-400 dark:text-gray-600">|</div>
                  <ExperimentalToggle isWasmEnabled={isWasmEnabled} onToggle={setIsWasmEnabled} />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ScatterChartComponent parsedData={parsedData} />
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default App;
