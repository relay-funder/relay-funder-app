import { useFormContext } from 'react-hook-form';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RoundCardDashboard } from '../card-dashboard';
import { RoundFormSchema } from './form';
import { cn } from '@/lib/utils';
import { GetRoundResponseInstance } from '@/lib/api/types';

import { debug } from '@/lib/debug';

export function RoundCreateFormSummary() {
  const form = useFormContext();
  const session = useSession();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const values = useMemo(() => {
    const rawValues = form.getValues();
    const parsedValues = RoundFormSchema.parse(rawValues);
    debug && console.log('round::create::form-summary:', { parsedValues });
    return parsedValues;
  }, [form]);
  useEffect(() => {
    if (values.logo instanceof File) {
      const url = URL.createObjectURL(values.logo);
      setLogoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setLogoUrl(null);
      };
    }
  }, [values]);
  const round = useMemo(() => {
    try {
      return {
        id: 1,
        title: values.title,
        description: values.description,
        matchingPool: values.matchingPool,
        startTime: values.startTime,
        endTime: values.endTime,
        applicationStartTime: values.applicationStartTime,
        applicationEndTime: values.applicationEndTime,
        creatorAddress: session?.data?.user.address,
        status: 'CREATING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: [],
        blockchain: '',
        managerAddress: session?.data?.user.address,
        logoUrl,
      } as GetRoundResponseInstance;
    } catch {
      return undefined;
    }
  }, [values, session?.data?.user, logoUrl]);
  if (!round) {
    return null;
  }
  return (
    <div className="pb-2">
      <h2 className={cn('flex justify-self-center text-lg')}>Preview</h2>
      <div className="flex max-w-[400px] justify-self-center">
        <RoundCardDashboard round={round} />
      </div>
    </div>
  );
}
