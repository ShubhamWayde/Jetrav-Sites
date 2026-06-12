import { createElement } from 'react';
import { toast } from 'react-toastify';
import { ToastMessage } from '@repo/ui/toastmessage';

export function showSuccess(description: string, title = 'Success'): void {
  toast.success(createElement(ToastMessage, { title, description }));
}

export function showError(description: string, title = 'Error'): void {
  toast.error(createElement(ToastMessage, { title, description }));
}

export function showInfo(description: string, title = 'Info'): void {
  toast.info(createElement(ToastMessage, { title, description }));
}

export function showWarning(description: string, title = 'Warning'): void {
  toast.warning(createElement(ToastMessage, { title, description }));
}

export function getErrorMessage(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
