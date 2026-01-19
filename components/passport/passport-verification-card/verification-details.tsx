// ABOUTME: Expandable accordion sections showing passport stamps and verification details.
// ABOUTME: Displays stamp list with scores and detailed verification metadata.

'use client';

import { FormattedDate } from '@/components/formatted-date';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { type PassportScoreData } from './types';

interface VerificationDetailsProps {
  verificationData: PassportScoreData;
}

export function VerificationDetails({
  verificationData,
}: VerificationDetailsProps) {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem separator value="stamps">
        <AccordionTrigger className="text-sm font-medium">
          View Your Stamps ({Object.keys(verificationData.stamps || {}).length})
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
                    <span className="font-medium">{stampData.score}</span>
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
              <span className="text-muted-foreground">Passport Score:</span>
              <span className="font-medium">
                {Number(verificationData.passportScore || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Humanity Score:</span>
              <span className="font-medium">
                {verificationData.humanityScore}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passing Score:</span>
              <span className="font-medium">
                {verificationData.passingScore ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expires:</span>
              <FormattedDate
                className="font-medium"
                date={verificationData.expirationTimestamp || undefined}
                options={{
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                }}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
