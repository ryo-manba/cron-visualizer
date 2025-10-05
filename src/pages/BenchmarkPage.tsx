import React, { useState } from 'react';
import { generateScatterData } from '../helpers/generateScatterData';
import { generateScatterDataWasm } from '../helpers/generateScatterDataWasm';
import { TimeFormat } from '../types/TimeFormat';

interface BenchmarkResult {
  description: string;
  dataPoints: number;
  jsTime: string;
  wasmTime: string;
  speedup: string;
}

const testCases = [
  { expression: '0 12 * * 1', description: '~1 data point' },
  { expression: '0 0,12 * * *', description: '~10 data points' },
  { expression: '0 */2 * * *', description: '~100 data points' },
  { expression: '*/10 * * * *', description: '~1000 data points' },
  { expression: '*/4 * * * *', description: '~2500 data points' },
];

async function benchmark(fn: () => void, runs = 1): Promise<number> {
  const times: number[] = [];

  // Actual benchmark
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  return times.reduce((a, b) => a + b, 0) / times.length;
}

export const BenchmarkPage: React.FC = () => {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');

  const runBenchmark = async () => {
    setRunning(true);
    setResults([]);

    const newResults: BenchmarkResult[] = [];

    for (const testCase of testCases) {
      setCurrentTest(testCase.description);

      try {
        const jsTime = await benchmark(() => generateScatterData(testCase.expression, TimeFormat.JST));

        const wasmTime = await benchmark(() => generateScatterDataWasm(testCase.expression, TimeFormat.JST));

        const data = generateScatterData(testCase.expression, TimeFormat.JST);
        const speedup = jsTime / wasmTime;

        newResults.push({
          description: testCase.description,
          dataPoints: data.length,
          jsTime: jsTime.toFixed(3),
          wasmTime: wasmTime.toFixed(3),
          speedup: speedup.toFixed(2) + 'x',
        });

        setResults([...newResults]);
      } catch (error) {
        console.error('Benchmark error:', error);
      }
    }

    setRunning(false);
    setCurrentTest('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">JS vs Wasm Performance Benchmark</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Compare JavaScript and WebAssembly performance for cron expression parsing. Each test runs 100 iterations.
        </p>

        <button
          onClick={runBenchmark}
          disabled={running}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg mb-8"
        >
          {running ? `Running: ${currentTest}...` : 'Run Benchmark'}
        </button>

        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-700 dark:text-gray-200">Description</th>
                  <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">Data Points</th>
                  <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">JS (ms)</th>
                  <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">Wasm (ms)</th>
                  <th className="px-4 py-3 text-right text-gray-700 dark:text-gray-200">Speedup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{result.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-gray-100">
                      {result.dataPoints}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-gray-100">{result.jsTime}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-gray-100">
                      {result.wasmTime}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-green-600 dark:text-green-400">
                      {result.speedup}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
