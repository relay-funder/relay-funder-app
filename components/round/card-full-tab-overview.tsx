import { GetRoundResponseInstance } from '@/lib/api/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function RoundCardTabOverview({
  round,
}: {
  round: GetRoundResponseInstance;
}) {
  return (
    <div className="space-y-4">
      {/* Full Description */}
      <Card>
        <CardHeader>
          <CardTitle>About this Round</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="leading-relaxed text-muted-foreground">
              {round.description || 'No description available for this round.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Round Tags */}
      {round.tags && round.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {round.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
