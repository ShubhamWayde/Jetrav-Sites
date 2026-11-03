'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { USER_API } from '@/lib/constants';
import { useApiQuery, type ApiQueryState } from '@/lib/useApiQuery';
import type { UserProfile } from '@/app/types/profile';
import type { SubscriptionStatus } from '@/app/types/account';

interface AccountContextValue {
  profile: ApiQueryState<UserProfile>;
  subscription: ApiQueryState<SubscriptionStatus>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * Loads the signed-in user's profile and subscription once for the whole app
 * shell, so the header, sidebar and pages share one request each.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const profile = useApiQuery<UserProfile>(USER_API.PROFILE_GET, "Couldn't load your profile.");
  const subscription = useApiQuery<SubscriptionStatus>(
    USER_API.SUBSCRIPTION,
    "Couldn't load your plan and Jet Points. Please try again.",
  );

  const value = useMemo(() => ({ profile, subscription }), [profile, subscription]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside <AccountProvider>');
  return ctx;
}
