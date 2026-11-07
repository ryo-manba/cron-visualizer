import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ init: vi.fn(), parse: vi.fn(), free: vi.fn() }));
vi.mock('../../cron-wasm/pkg/cron_wasm', () => ({
  default: mocks.init,
  CronParser: class { parse_expression = mocks.parse; free = mocks.free; },
}));

async function freshAdapter() {
  vi.resetModules();
  vi.clearAllMocks();
  return import('./generateScatterDataWasm');
}

describe('WebAssembly initialization', () => {
  it('waits for initialization, maps results, and releases the parser', async () => {
    const { generateScatterDataWasm } = await freshAdapter();
    let resolve!: () => void;
    mocks.init.mockReturnValue(new Promise<void>((done) => { resolve = done; }));
    mocks.parse.mockReturnValue([{ x: 9, y: 1, z: 100, day_label: 'Mon', time: '09:00' }]);
    const pending = generateScatterDataWasm('0 9 * * 1-5', 'JST');
    expect(mocks.parse).not.toHaveBeenCalled();
    resolve();
    expect(await pending).toEqual([{ x: 9, y: 1, z: 100, dayLabel: 'Mon', time: '09:00' }]);
    expect(mocks.free).toHaveBeenCalledOnce();
    await generateScatterDataWasm('0 9 * * 1-5', 'JST');
    expect(mocks.init).toHaveBeenCalledOnce();
  });

  it('allows retry after a failed download and releases the parser on parse errors', async () => {
    const { generateScatterDataWasm } = await freshAdapter();
    mocks.init.mockRejectedValueOnce(new Error('download failed')).mockResolvedValueOnce({});
    await expect(generateScatterDataWasm('invalid', 'JST')).rejects.toThrow('download failed');
    mocks.parse.mockImplementation(() => { throw new Error('Invalid cron expression: invalid'); });
    await expect(generateScatterDataWasm('invalid', 'JST')).rejects.toThrow('invalid');
    expect(mocks.init).toHaveBeenCalledTimes(2);
    expect(mocks.free).toHaveBeenCalledOnce();
  });
});
