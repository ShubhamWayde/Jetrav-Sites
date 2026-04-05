import Script from 'next/script';
import PlanView from './PlanView';

export default function PlanPage() {
  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
      <PlanView />
    </>
  );
}
