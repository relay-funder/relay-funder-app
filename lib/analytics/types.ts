export type FunnelEvent =
  | 'funnel_homepage_view'
  | 'funnel_cta_click'
  | 'funnel_payment_form_view'
  | 'funnel_payment_initiated'
  | 'funnel_payment_success'
  | 'funnel_payment_failed'
  | 'test_vercel_integration';

export interface FunnelEventProperties {
  // Common properties
  session_id?: string;
  time_to_convert?: number; // seconds
  path?: string;
  source?: string;

  // Payment specific
  currency?: string;
  amount?: number;
  payment_method?: string;
  plan?: string;

  // Failure specific
  error_message?: string;
  error_code?: string;

  // Test specific
  time?: string;
  environment?: string;
}
