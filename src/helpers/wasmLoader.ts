// See: https://web.dev/articles/loading-wasm

let wasmModule: any = null;
let CronParser: any = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;

export async function initWasm(): Promise<void> {
  if (wasmModule) return;
  if (isLoading) {
    if (loadPromise) await loadPromise;
    return;
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Import the WASM module from node_modules
      // With bundler target, the WASM is automatically loaded
      const wasmBindings = await import('cron-wasm');

      wasmModule = wasmBindings;
      CronParser = wasmBindings.CronParser;

      console.log('WASM module loaded successfully');
    } catch (error) {
      console.error('Failed to load WASM module:', error);
      // Don't throw - just log the error and continue with JS version
      wasmModule = null;
      CronParser = null;
    } finally {
      isLoading = false;
    }
  })();

  await loadPromise;
}

export function isWasmReady(): boolean {
  return wasmModule !== null && CronParser !== null;
}

export interface WasmScatterData {
  x: number;
  y: number;
  z: number;
  day_label: string;
  time: string;
}

export async function generateScatterDataWasm(
  cronExpression: string,
  timeFormat: 'JST' | 'UTC'
): Promise<any[]> {
  if (!isWasmReady()) {
    await initWasm();
  }

  if (!CronParser) {
    throw new Error('WASM module not initialized');
  }

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

// Fast version for benchmarking
export async function generateScatterDataWasmFast(
  cronExpression: string
): Promise<number[][]> {
  if (!isWasmReady()) {
    await initWasm();
  }

  if (!CronParser) {
    throw new Error('WASM module not initialized');
  }

  const parser = new CronParser();

  try {
    const data = parser.parse_expression_fast(cronExpression);
    return data;
  } catch (error: any) {
    throw new Error(error.toString());
  } finally {
    parser.free?.();
  }
}