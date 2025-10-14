'use client';

import { useMemo } from 'react';
import { cva } from 'class-variance-authority';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { usePassportScore } from '@/lib/hooks/usePassportScore';
import { cn } from '@/lib/utils';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PASSPORT_SCORE_THRESHOLD } from '@/lib/constant';

interface PassportVerificationCardProps {
  currentScore?: number;
}

const scoreColor = cva('text-3xl font-bold', {
  variants: {
    score: {
      high: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      low: 'text-red-600 dark:text-red-400',
    },
  },
  defaultVariants: {
    score: 'low',
  },
});

const scoreBadgeColor = cva('', {
  variants: {
    score: {
      high: 'bg-green-600 dark:bg-green-400',
      medium: 'bg-yellow-600 dark:bg-yellow-400',
      low: 'bg-red-600 dark:bg-red-400',
    },
  },
  defaultVariants: {
    score: 'low',
  },
});

function VerifyButton({ compact = false }: { compact?: boolean }) {
  const {
    data: verificationData,
    isFetching,
    isPending,
    refetch,
  } = usePassportScore();

  const isLoading = isFetching || isPending;

  const hasBeenVerified = verificationData !== null;

  const verifyPassport = () => {
    refetch();
  };

  if (compact) {
    return (
      <Button variant="outline" onClick={verifyPassport}>
        <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
      </Button>
    );
  }

  return (
    <Button onClick={verifyPassport} disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Verifying...
        </>
      ) : (
        <>
          <ShieldCheck className="mr-2 h-4 w-4" />
          {hasBeenVerified ? 'Refresh Score' : 'Verify Passport'}
        </>
      )}
    </Button>
  );
}

export function PassportVerificationCard({
  currentScore = 0,
}: PassportVerificationCardProps) {
  const { data: verificationData, error } = usePassportScore();

  const displayScore = verificationData?.humanityScore ?? currentScore;
  const hasBeenVerified = verificationData !== null;
  const errorMessage = error instanceof Error ? error.message : null;

  const { scoreVariant, scoreStatus } = useMemo<{
    scoreVariant: 'high' | 'medium' | 'low';
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
                className={`relative flex h-16 w-16 items-center justify-center rounded-full ${scoreBadgeColor({ score: scoreVariant }).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} group-data-[state=open]:hidden`}
              >
                <span className={`text-3xl font-bold text-neutral-600`}>
                  {displayScore}
                </span>
              </div>
              <AccordionTrigger />
            </div>
          </AccordionHeader>
          <AccordionContent>
            <CardContent className="space-y-4">
              {/* Current Score Display */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Humanity Score
                  </p>
                  <p className={scoreColor({ score: scoreVariant })}>
                    {displayScore}
                  </p>
                  <Badge
                    variant={scoreVariant === 'high' ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {scoreStatus}
                  </Badge>
                </div>
                {scoreVariant === 'high' ? (
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                )}
              </div>

              {/* Verification Results */}
              {hasBeenVerified && verificationData && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Successfully verified! Your Passport score is{' '}
                    <strong>{verificationData.passportScore}</strong>
                    {verificationData.passingScore && ' (Passing)'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Display */}
              {errorMessage && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Info about Passport */}
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">What is Human Passport?</p>
                <p className="mt-1 text-muted-foreground">
                  Human Passport helps you prove your unique humanity by
                  collecting stamps from various services you use. A score of
                  20+ is recommended to be considered a verified human.
                </p>
                <a
                  href="https://passport.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-primary hover:underline"
                >
                  Get your Passport →
                </a>
              </div>

              {/* Verification Details */}
              {verificationData && (
                <Accordion type="multiple" className="w-full">
                  <AccordionItem separator value="stamps">
                    <AccordionTrigger className="text-sm font-medium">
                      View Your Stamps (
                      {Object.keys(verificationData.stamps || {}).length})
                    </AccordionTrigger>
                    <AccordionContent>
                      {verificationData.stamps && (
                        <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2">
                          {Object.entries(verificationData.stamps).map(
                            ([stampName, stampData]) => (
                              <div
                                key={stampName}
                                className="flex justify-between gap-2 text-sm text-muted-foreground"
                              >
                                <span className="flex-1">{stampName}</span>
                                <span className="font-medium">
                                  {stampData.score}
                                </span>
                                {stampData.dedup && (
                                  <span className="text-xs text-muted-foreground/60">
                                    (dedup)
                                  </span>
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem separator value="details">
                    <AccordionTrigger className="text-sm font-medium">
                      Verification Details
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Passport Score:
                          </span>
                          <span className="font-medium">
                            {verificationData.passportScore}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Humanity Score:
                          </span>
                          <span className="font-medium">
                            {verificationData.humanityScore}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Passing Score:
                          </span>
                          <span className="font-medium">
                            {verificationData.passingScore ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Expires:
                          </span>
                          <span className="font-medium">
                            {new Date(
                              verificationData.expirationTimestamp,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Verify Button */}
              <VerifyButton />
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
