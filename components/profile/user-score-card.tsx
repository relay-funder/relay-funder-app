import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useUserScore } from '@/lib/hooks/useUserScore';
import { Trophy } from 'lucide-react';

export function UserScoreCard() {
  const { data: score, isLoading, error } = useUserScore();

  if (isLoading) {
    return (
      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            User Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-lg border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            User Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Error loading score</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg border bg-card shadow-sm">
      <CardContent className="flex items-center p-2 md:p-6">
        <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="whitespace-nowrap text-xs font-medium text-muted-foreground md:text-sm">
            Total Score
          </p>
          <h3 className="whitespace-nowrap text-sm font-bold md:text-xl">
            {score?.totalScore ?? 0}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
