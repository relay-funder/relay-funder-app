import { CampaignCreateFormStates } from './form-states';
import { getPageStep, TOTAL_FORM_PAGES } from './form-steps';

export function FormProgressIndicator({
  currentPage,
  startFromStep = 1,
  className,
}: {
  currentPage: keyof typeof CampaignCreateFormStates;
  startFromStep?: number;
  className?: string;
}) {
  const currentStep = getPageStep(currentPage);
  
  if (startFromStep < 1 || startFromStep > TOTAL_FORM_PAGES) {
    console.warn(
      `FormProgressIndicator: startFromStep (${startFromStep}) must be between 1 and ${TOTAL_FORM_PAGES}`,
    );
    return null;
  }

  if (currentStep < startFromStep) {
    return null;
  }

  const stepsToSkip = startFromStep - 1;
  const displayStep = currentStep - stepsToSkip;
  const totalDisplaySteps = TOTAL_FORM_PAGES - stepsToSkip;

  return (
    <div
      className={`text-center text-sm text-muted-foreground ${className ?? ''}`}
    >
      Step {displayStep} of {totalDisplaySteps}
    </div>
  );
}
