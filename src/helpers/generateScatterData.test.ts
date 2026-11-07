import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateScatterData } from './generateScatterData';
import { TimeFormat } from '../types/TimeFormat';

describe('cron visualization', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-04T03:00:00Z')); });
  afterEach(() => vi.useRealTimers());

  it('plots one point for each weekday at 9am JST', () => {
    const points = generateScatterData('0 9 * * 1-5', TimeFormat.JST);
    expect(points).toHaveLength(5);
    expect(points.map((point) => point.dayLabel)).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    expect(points.every((point) => point.x === 9)).toBe(true);
  });

  it('plots 30-minute intervals across the week', () => {
    expect(generateScatterData('*/30 * * * *', TimeFormat.JST)).toHaveLength(335);
  });

  it('rejects invalid expressions and schedules with too many points', () => {
    expect(() => generateScatterData('not a cron', TimeFormat.JST)).toThrow();
    expect(() => generateScatterData('* * * * *', TimeFormat.JST)).toThrow('Too many data points');
  });
});
