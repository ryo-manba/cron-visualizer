import React from 'react';
import { FaRocket } from 'react-icons/fa';

interface ExperimentalToggleProps {
  isWasmEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  isWasmReady: boolean;
}

export const ExperimentalToggle: React.FC<ExperimentalToggleProps> = ({ 
  isWasmEnabled, 
  onToggle, 
  isWasmReady 
}) => {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
      <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
        <button
          onClick={() => onToggle(false)}
          className={`px-3 py-1 text-sm transition-colors ${
            !isWasmEnabled
              ? 'bg-blue-500 dark:bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Standard
        </button>
        <button
          onClick={() => onToggle(true)}
          disabled={!isWasmReady}
          className={`px-3 py-1 text-sm transition-colors flex items-center gap-1 ${
            isWasmEnabled
              ? 'bg-green-500 dark:bg-green-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          } ${!isWasmReady ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={!isWasmReady ? 'Loading WASM module...' : 'Experimental: High-performance mode'}
        >
          <FaRocket size={12} />
          WASM
          <span className="text-xs ml-1">
            {!isWasmReady ? '(Loading...)' : '(Experimental)'}
          </span>
        </button>
      </div>
    </div>
  );
};