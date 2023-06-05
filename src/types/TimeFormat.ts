export const TimeFormat = {
  JST: 'JST',
  UTC: 'UTC',
} as const;

export type TimeFormat = (typeof TimeFormat)[keyof typeof TimeFormat];
