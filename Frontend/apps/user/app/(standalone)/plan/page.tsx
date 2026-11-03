import type { Metadata } from 'next';
import PlanView from './PlanView';

export const metadata: Metadata = {
  title: 'Choose your plan',
};

export default function PlanPage() {
  return <PlanView />;
}
