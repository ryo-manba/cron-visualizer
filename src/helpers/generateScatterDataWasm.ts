import { CronParser } from 'cron-wasm';
import type { ScatterData } from '../types/ScatterData';
import { TimeFormat } from '../types/TimeFormat';

interface WasmScatterData {
  x: number;
  y: number;
  z: number;
  day_label: string;
  time: string;
}

export function generateScatterDataWasm(
  cronExpression: string,
  timeFormat: TimeFormat
): ScatterData[] {
  const parser = new CronParser();

  try {
    const data = parser.parse_expression(cronExpression, timeFormat);
    // Convert from WASM format (day_label) to JS format (dayLabel)
    return data.map((item: WasmScatterData) => ({
      x: item.x,
      y: item.y,
      z: item.z,
      dayLabel: item.day_label,
      time: item.time
    }));
  } catch (error: any) {
    // Convert WASM error to match JS error format
    const errorMessage = error.toString().replace('Invalid cron expression: ', '');
    throw new Error(errorMessage);
  } finally {
    // Clean up parser instance
    parser.free?.();
  }
}
