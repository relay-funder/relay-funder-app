// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck: developer instance to test stripe steps without api-keys
import { Stripe } from '@stripe/stripe-js';

export const mockStripeInstance: Stripe = {
  elements: () => {
    return {
      create: (type: string) => {
        console.log('stripe wants to create a element of type', type);
      },
      getElement: () => {},
      update: () => {},
      submit: () => {
        console.log('mocking element.submit');
        return {};
      },
    };
  },
  createToken: () => {},
  createPaymentMethod: () => {},
  confirmCardPayment: (options) => {
    console.log('mocking confirm card payment', { options });
    return {};
  },
  retrievePaymentIntent: (clientSecret: string) => {
    console.log('mocking retrievePaymentIntent', clientSecret);
    return { paymentIntent: { status: 'succeeded' } };
  },
  confirmPayment: (options) => {
    console.log('mocking confirm payment', { options });
    if (typeof options.confirmParams?.return_url === 'string') {
      location.href = `${options.confirmParams.return_url}&payment_intent_client_secret=mock_secret&payment_intent=mock_payment_intent`;
    }
    return {};
  },
};
