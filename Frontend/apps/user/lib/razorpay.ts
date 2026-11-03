/**
 * Minimal types for Razorpay Checkout (https://checkout.razorpay.com/v1/checkout.js).
 * Only the fields this app uses are declared.
 */

export const RAZORPAY_CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Brand sky-blue (--jt-skyBlue-base). Razorpay only accepts hex colours. */
export const RAZORPAY_THEME_COLOR = '#778da9';

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayFailureResponse {
  error: {
    code?: string;
    description?: string;
    metadata?: { order_id?: string; payment_id?: string };
  };
}

export interface RazorpayOptions {
  key: string;
  /** In paise. */
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', callback: (response: RazorpayFailureResponse) => void): void;
}

declare global {
  interface Window {
    /** Undefined until the checkout script loads (or forever, if an ad-blocker stops it). */
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
