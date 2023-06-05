import moment from 'moment-timezone';
import cronParser from 'cron-parser';
import { formatDay } from '../helpers/date';
import { convertUTCtoJST } from '../helpers/date';
import { TimeFormat } from '../types/TimeFormat';

/**
 * Generate scatter chart data based on the specified Cron expression and time format.
 * @param {string} cronExpression - Cron expression
 * @param {TimeFormat} timeFormat - Time format ("JST" or "UTC")
 * @returns {ScatterData[]} - Array of generated scatter chart data
 */
export const generateScatterData = (
  cronExpression: string,
  timeFormat: TimeFormat,
) => {
  const data = [];

  const options = {
    currentDate: moment().startOf('week').toDate(),
    endDate: moment().endOf('week').toDate(),
    iterator: true,
    tz: 'Asia/Tokyo',
  };

  const interval = cronParser.parseExpression(cronExpression, options);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const obj = interval.next();
      if ('done' in obj) {
        const t = obj.value.toString();
        const time =
          timeFormat === TimeFormat.JST ? moment(t) : convertUTCtoJST(t);

        const date = moment(time, 'YYYY-MM-DD HH:mm');
        const day = date.day();
        const hour = date.hour();
        const minute = date.minute();
        data.push({
          x: hour + minute / 60,
          y: day,
          z: 100,
          dayLabel: formatDay(day),
          time: `JST: ${date.format('YYYY-MM-DD HH:mm')}`,
        });
      }
    } catch (e) {
      break;
    }
  }
  return data;
};
