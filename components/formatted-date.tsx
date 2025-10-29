import { useDate } from '@/hooks/use-date';

export function FormattedDate({
  className,
  date,
  timestamp,
  options,
  relative = false,
}: {
  className?: string;
  date?: Date | string;
  timestamp?: string;
  options?: Intl.DateTimeFormatOptions;
  relative?: boolean;
}) {
  const { formattedDate, relativeDate } = useDate(date, timestamp, options);
  if (relative) {
    return (
      <span className={className} title={formattedDate}>
        {relativeDate}
      </span>
    );
  }
  return (
    <span className={className} title={relativeDate}>
      {formattedDate}
    </span>
  );
}
