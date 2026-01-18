// ABOUTME: Main passport verification card component with collapsible accordion UI.
// ABOUTME: Composes sub-components for score display, verification, and details.

'use client';

import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePassportScore } from '@/lib/hooks/usePassportScore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PASSPORT_SCORE_THRESHOLD } from '@/lib/constant';

import {
  type PassportVerificationCardProps,
  type ScoreVariant,
  scoreBadgeColor,
} from './types';
import { ScoreDisplay } from './score-display';
import { VerifyButton } from './verify-button';
import { PassportInfo } from './passport-info';
import { VerificationDetails } from './verification-details';
import {
  VerificationSuccessAlert,
  VerificationErrorAlert,
} from './verification-alerts';

export function PassportVerificationCard({
  currentScore = 0,
}: PassportVerificationCardProps) {
  const { data: verificationData, error } = usePassportScore();

  const displayScore = verificationData?.humanityScore ?? currentScore;
  const hasBeenVerified = verificationData !== null;
  const errorMessage = error instanceof Error ? error.message : null;

  const { scoreVariant, scoreStatus } = useMemo<{
    scoreVariant: ScoreVariant;
    scoreStatus: string;
  }>(() => {
    if (displayScore >= PASSPORT_SCORE_THRESHOLD)
      return { scoreVariant: 'high', scoreStatus: 'Verified Human' };
    if (displayScore >= PASSPORT_SCORE_THRESHOLD / 2)
      return { scoreVariant: 'medium', scoreStatus: 'Partial Verification' };
    return { scoreVariant: 'low', scoreStatus: 'Not Verified' };
  }, [displayScore]);

  return (
    <Card>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="passport-verification">
          <AccordionHeader className="group flex items-center justify-between gap-2 p-6">
            <div className="flex flex-col space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Human Passport Verification
              </CardTitle>
              <CardDescription>
                Verify your humanity using Human Passport to increase your
                credibility and unlock features
              </CardDescription>
            </div>
            <div className="flex items-center sm:gap-2 md:gap-4">
              <div
                className={cn(
                  'relative flex h-16 w-16 items-center justify-center rounded-full',
                  'group-data-[state=open]:hidden',
                  scoreBadgeColor({ score: scoreVariant }),
                )}
              >
                <span className="text-3xl font-bold text-neutral-600">
                  {displayScore}
                </span>
              </div>
              <AccordionTrigger />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <CardContent className="space-y-4">
              <ScoreDisplay
                displayScore={displayScore}
                scoreVariant={scoreVariant}
                scoreStatus={scoreStatus}
              />

              {hasBeenVerified && verificationData && (
                <VerificationSuccessAlert verificationData={verificationData} />
              )}

              {errorMessage && (
                <VerificationErrorAlert errorMessage={errorMessage} />
              )}

              <PassportInfo />

              {verificationData && (
                <VerificationDetails verificationData={verificationData} />
              )}

              <VerifyButton />
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
