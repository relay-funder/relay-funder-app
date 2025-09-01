// useFormattedDate.ts
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
};
export function useDate(
  date?: Date | string,
  timestamp?: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const [formattedDate, setFormattedDate] = useState<string>('Loading');
  const [relativeDate, setRelativeDate] = useState<string>('Loading');

  useEffect(() => {
    const userLocale = navigator.language; // Get the user's locale
    try {
      let dateValue = date;
      if (typeof dateValue === 'string') {
        dateValue = new Date(dateValue);
      }
      if (typeof timestamp === 'string' && parseInt(timestamp) > 0) {
        dateValue = new Date(parseInt(timestamp) * 1000);
      }
      if (!(dateValue instanceof Date)) {
        return;
      }
      const formatted = new Intl.DateTimeFormat(
        userLocale,
        options ?? defaultDateOptions,
      ).format(dateValue);
      const relative = dayjs(dateValue).fromNow();
      setFormattedDate(formatted);
      setRelativeDate(relative);
    } catch (error) {
      console.error('Date format error (use-date)', error, {
        date,
        timestamp,
        options,
      });
      const fallback =
        typeof date === 'string'
          ? date
          : (date?.toISOString() ?? timestamp ?? '');
      setFormattedDate(fallback);
      setRelativeDate(fallback);
    }
  }, [date, timestamp, options]);

  return { formattedDate, relativeDate };
}
