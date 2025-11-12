export function getCharCountColor(current: number, max: number) {
  const percentage = (current / max) * 100;
  if (percentage >= 100) return 'text-destructive';
  if (percentage >= 90) return 'text-solar';
  return 'text-muted-foreground';
}

export function getCharMinCountColor(current: number, min: number) {
  if (current >= min) return '';
  const percentage = ((min - current) / min) * 100;
  console.log('min', min, 'current', current, 'percentage', percentage);
  if (percentage >= 75) return 'text-destructive';
  return 'text-solar';
}
