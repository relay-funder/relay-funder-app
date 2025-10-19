export function getCharCountColor(current: number, max: number) {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return 'text-destructive';
  if (percentage >= 90) return 'text-solar';
  return 'text-muted-foreground';
}
