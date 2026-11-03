import type { Metadata } from 'next';
import AccountsView from './AccountsView';

export const metadata: Metadata = {
  title: 'My account',
};

export default function AccountsPage() {
  return <AccountsView />;
}
