'use client';

import * as React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = ({
  separator = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  separator?: boolean;
}) => (
  <AccordionPrimitive.Item
    className={cn(className, separator && 'border-b-0')}
    {...props}
  />
);

const AccordionHeader = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>) => (
  <AccordionPrimitive.Header className={cn('flex', className)} {...props}>
    {children}
  </AccordionPrimitive.Header>
);

const AccordionTrigger = ({
  className,
  trigger,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
  trigger?: React.ReactNode;
}) => (
  <AccordionPrimitive.Trigger
    className={cn(
      'flex flex-1 items-center justify-between py-4 font-medium transition-all [&[data-state=open]>svg]:rotate-180',
      className,
    )}
    {...props}
  >
    {children}
    {trigger ? (
      trigger
    ) : (
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    )}
  </AccordionPrimitive.Trigger>
);

const AccordionContent = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) => (
  <AccordionPrimitive.Content
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </AccordionPrimitive.Content>
);

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
};
