import { CampaignCreateFormStates } from './form-states';

// Define the order of form pages - this is the single source of truth
export const FORM_PAGE_ORDER: (keyof typeof CampaignCreateFormStates)[] = [
  'introduction',
  'description',
  'meta',
  'media',
  'funding',
  'timeline',
  'summary',
];

export const TOTAL_FORM_PAGES = FORM_PAGE_ORDER.length;
export const PROGRESS_INDICATOR_START_STEP = 2;

/**
 * Get the step number (1-indexed) for a given page state
 */
export function getPageStep(
  page: keyof typeof CampaignCreateFormStates,
): number {
  const index = FORM_PAGE_ORDER.indexOf(page);
  return index >= 0 ? index + 1 : 0;
}

/**
 * Get the page key for a given step number (1-indexed)
 */
export function getPageByStep(
  step: number,
): keyof typeof CampaignCreateFormStates | null {
  if (step < 1 || step > TOTAL_FORM_PAGES) {
    return null;
  }
  return FORM_PAGE_ORDER[step - 1];
}

/**
 * Get the next page key for a given current page
 */
export function getNextPage(
  currentPage: keyof typeof CampaignCreateFormStates,
): keyof typeof CampaignCreateFormStates | null {
  const currentStep = getPageStep(currentPage);
  if (currentStep === 0) return null;
  return getPageByStep(currentStep + 1);
}

/**
 * Get the previous page key for a given current page
 */
export function getPrevPage(
  currentPage: keyof typeof CampaignCreateFormStates,
): keyof typeof CampaignCreateFormStates | null {
  const currentStep = getPageStep(currentPage);
  if (currentStep <= 1) return null;
  return getPageByStep(currentStep - 1);
}
