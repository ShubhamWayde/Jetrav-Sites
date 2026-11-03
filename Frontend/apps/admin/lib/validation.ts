/** 10-digit Indian mobile number (no country code). */
export const MOBILE_RE = /^[6-9]\d{9}$/;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Keeps only digits, capped at 10 — for `onChange` of mobile inputs. */
export function sanitizeMobile(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export type FieldErrors = Record<string, string>;

export const hasErrors = (errors: FieldErrors) => Object.values(errors).some(Boolean);
