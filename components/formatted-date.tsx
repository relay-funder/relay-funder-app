import { useDate } from '@/hooks/use-date';

export function FormattedDate({
  date,
  timestamp,
  options,
}: {
  date?: Date;
  timestamp?: string;
  options?: Intl.DateTimeFormatOptions;
}) {
  const { formattedDate, relativeDate } = useDate(date, timestamp, options);
  return <span title={formattedDate}>{relativeDate}</span>;
}
