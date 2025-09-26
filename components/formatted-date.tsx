import { useDate } from '@/hooks/use-date';

export function FormattedDate({
  date,
  timestamp,
  options,
  relative = false,
}: {
  date?: Date;
  timestamp?: string;
  options?: Intl.DateTimeFormatOptions;
  relative?: boolean;
}) {
  const { formattedDate, relativeDate } = useDate(date, timestamp, options);
  if (relative) {
    return <span title={formattedDate}>{relativeDate}</span>;
  }
  return <span title={relativeDate}>{formattedDate}</span>;
}
