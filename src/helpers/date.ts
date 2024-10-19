import moment from 'moment-timezone';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const formatDay = (tick: number) => {
  return DAYS[tick];
};

export const convertUTCtoJST = (utcTime: string): string => {
  const utcDate = moment.utc(utcTime, 'ddd MMM D YYYY HH:mm:ss');
  const jstDate = utcDate.clone().tz('Asia/Tokyo');
  return jstDate.format('YYYY-MM-DD HH:mm');
};
