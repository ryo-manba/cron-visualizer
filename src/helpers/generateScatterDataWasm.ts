import init, { CronParser } from '../../cron-wasm/pkg/cron_wasm';
import wasmUrl from '../../cron-wasm/pkg/cron_wasm_bg.wasm?url';

let initialization: Promise<unknown> | undefined;
import type { ScatterData } from '../types/ScatterData';
import { TimeFormat } from '../types/TimeFormat';

interface WasmScatterData {
  x: number;
  y: number;
  z: number;
  day_label: string;
  time: string;
}

export async function generateScatterDataWasm(cronExpression: string, timeFormat: TimeFormat): Promise<ScatterData[]> {
  initialization ??= init({ module_or_path: wasmUrl }).catch((error) => {
    initialization = undefined;
    throw error;
  });
  await initialization;
  const parser = new CronParser();

  try {
    const data = parser.parse_expression(cronExpression, timeFormat);
    // Convert from WASM format (day_label) to JS format (dayLabel)
    return data.map((item: WasmScatterData) => ({
      x: item.x,
      y: item.y,
      z: item.z,
      dayLabel: item.day_label,
      time: item.time,
    }));
  } catch (error: unknown) {
    // Convert WASM error to match JS error format
    const errorMessage = String(error).replace('Invalid cron expression: ', '');
    throw new Error(errorMessage);
  } finally {
    // Clean up parser instance
    parser.free?.();
  }
}
