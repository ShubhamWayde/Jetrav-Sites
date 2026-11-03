'use client';

import { useCallback, useMemo, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { api, ApiError, getErrorMessage, showError, showSuccess } from '@repo/auth';
import { Badge } from '@repo/ui/Badge';
import Button from '@repo/ui/Button';
import { Card } from '@repo/ui/Card';
import { EmptyState } from '@repo/ui/EmptyState';
import { PageHeader } from '@repo/ui/PageHeader';
import Spinner from '@repo/ui/Spinner';
import { Tabs } from '@repo/ui/Tabs';
import { CarryOnBagChecked, Icon, StarShine } from '@repo/ui/icon';
import { USER_API } from '@/lib/constants';
import { formatRupees } from '@/lib/format';
import { tierRank, tierTone } from '@/lib/plans';
import {
  RAZORPAY_CHECKOUT_SRC,
  RAZORPAY_THEME_COLOR,
  type RazorpayOptions,
  type RazorpaySuccessResponse,
} from '@/lib/razorpay';
import { useApiQuery } from '@/lib/useApiQuery';
import type { SubscriptionStatus } from '@/app/types/account';
import styles from './PlanView.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: number;
  name: string;
  description: string;
  category: string;     // individual | corporate
  tier: string;         // silver | gold | platinum
  billingCycle: string; // monthly | yearly
  price: number;
  isFree: boolean;
  isPopular: boolean;
  features: string[];
}

interface CreateOrderResponse {
  orderID: string;
  amount: number; // paise
  currency: string;
  keyID: string;
}

/** A captured payment whose server-side verification failed — kept on screen so it can be retried. */
interface PendingVerification {
  plan: Plan;
  response: RazorpaySuccessResponse;
  message: string;
}

type Category = 'individual' | 'corporate';
type Billing = 'monthly' | 'yearly';
type CheckoutScript = 'loading' | 'ready' | 'failed';

const CATEGORY_OPTIONS = [
  { value: 'individual' as const, label: 'Individual' },
  { value: 'corporate' as const, label: 'Corporate' },
];

const CHECKOUT_BLOCKED_MESSAGE =
  "Secure checkout couldn't load. If you use an ad or script blocker, allow checkout.razorpay.com and reload this page.";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Best yearly saving (vs. 12 × monthly) across tiers of a category, as a whole percentage. */
function yearlySaving(plans: Plan[], category: Category): number {
  let best = 0;
  for (const yearly of plans) {
    if (yearly.category !== category || yearly.billingCycle !== 'yearly' || yearly.isFree) continue;
    const monthly = plans.find(
      (p) => p.category === category && p.billingCycle === 'monthly' && p.tier === yearly.tier && !p.isFree,
    );
    if (monthly && monthly.price > 0) {
      best = Math.max(best, Math.round((1 - yearly.price / (monthly.price * 12)) * 100));
    }
  }
  return best;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: Plan;
  billing: Billing;
  isCurrent: boolean;
  busy: boolean;
  disabled: boolean;
  onSelect: (plan: Plan) => void;
}

function PlanCard({ plan, billing, isCurrent, busy, disabled, onSelect }: PlanCardProps) {
  const headingId = `plan-${plan.id}-name`;
  const monthlyEquivalent = billing === 'yearly' ? plan.price / 12 : plan.price;

  return (
    <article
      className={`${styles.card}${plan.isPopular ? ` ${styles.cardPopular}` : ''}`}
      aria-labelledby={headingId}
    >
      <div className={styles.cardTop}>
        <Badge tone={tierTone(plan.tier)}>{plan.tier}</Badge>
        {isCurrent ? (
          <Badge tone="success" dot>Current plan</Badge>
        ) : (
          plan.isPopular && <Badge tone="accent">Most popular</Badge>
        )}
      </div>

      <div>
        <h2 id={headingId} className={styles.planName}>{plan.name}</h2>
        {plan.description && <p className={styles.planDesc}>{plan.description}</p>}
      </div>

      <div className={styles.price}>
        {plan.isFree ? (
          <span className={styles.priceValue}>Free</span>
        ) : (
          <>
            <span className={styles.priceValue}>{formatRupees(monthlyEquivalent)}</span>
            <span className={styles.pricePeriod}>/ month</span>
            {billing === 'yearly' && (
              <span className={styles.priceNote}>{formatRupees(plan.price)} billed yearly</span>
            )}
          </>
        )}
      </div>

      <Button
        fullWidth
        variant={plan.isPopular ? 'primary' : 'secondary'}
        loading={busy}
        disabled={disabled || isCurrent}
        onClick={() => onSelect(plan)}
        aria-describedby={headingId}
      >
        {isCurrent ? 'Your current plan' : plan.isFree ? 'Start for free' : `Choose ${plan.name}`}
      </Button>

      {plan.features?.length > 0 && (
        <ul className={styles.features} aria-label={`${plan.name} features`}>
          {plan.features.map((feature, i) => (
            <li key={`${i}-${feature}`} className={styles.feature}>
              <Icon icon={CarryOnBagChecked} size="sm" className={styles.featureIcon} />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PlanView() {
  const router = useRouter();

  const plansQuery = useApiQuery<Plan[]>(USER_API.PLANS, "Couldn't load plans. Please try again.");
  // Only used to mark the current plan; the page works without it.
  const { data: subscription } = useApiQuery<SubscriptionStatus>(USER_API.SUBSCRIPTION);

  const [category, setCategory] = useState<Category>('individual');
  const [billing, setBilling] = useState<Billing>('monthly');
  const [checkoutScript, setCheckoutScript] = useState<CheckoutScript>('loading');
  const [busyPlanId, setBusyPlanId] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingVerification | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [activated, setActivated] = useState<Plan | null>(null);

  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const currentPlanId = subscription?.hasPlan ? subscription.plan?.id : undefined;

  const visiblePlans = useMemo(
    () =>
      plans
        .filter((p) => p.category === category && p.billingCycle === billing)
        .sort((a, b) => tierRank(a.tier) - tierRank(b.tier)),
    [plans, category, billing],
  );

  const saving = useMemo(() => yearlySaving(plans, category), [plans, category]);
  const billingOptions = [
    { value: 'monthly' as const, label: 'Monthly' },
    {
      value: 'yearly' as const,
      label: saving > 0 ? <>Yearly <span className={styles.saving}>Save {saving}%</span></> : 'Yearly',
    },
  ];

  // ── Verification ───────────────────────────────────────────────────────────
  const verifyPayment = useCallback(async (plan: Plan, response: RazorpaySuccessResponse, isRetry: boolean) => {
    try {
      await api.post(USER_API.VERIFY_PAYMENT, {
        planID:            plan.id,
        razorpayOrderID:   response.razorpay_order_id,
        razorpayPaymentID: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      setPending(null);
      setActivated(plan);
    } catch (err) {
      // A retry after a lost response can find the payment already applied — that's a success.
      if (isRetry && err instanceof ApiError && err.status === 409) {
        setPending(null);
        setActivated(plan);
        return;
      }
      setPending({ plan, response, message: getErrorMessage(err, 'Payment verification failed.') });
    }
  }, []);

  const retryVerification = useCallback(async () => {
    if (!pending) return;
    setRetrying(true);
    await verifyPayment(pending.plan, pending.response, true);
    setRetrying(false);
  }, [pending, verifyPayment]);

  // ── Free plan ──────────────────────────────────────────────────────────────
  const subscribeFree = useCallback(async (plan: Plan) => {
    setBusyPlanId(plan.id);
    try {
      await api.post(USER_API.SUBSCRIBE, { planID: plan.id });
      showSuccess(`You're on the ${plan.name} plan.`);
      router.replace('/dashboard');
    } catch (err) {
      showError(getErrorMessage(err, 'Subscription failed. Please try again.'));
      setBusyPlanId(null);
    }
  }, [router]);

  // ── Paid plan ──────────────────────────────────────────────────────────────
  const checkoutPaid = useCallback(async (plan: Plan) => {
    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setCheckoutError(
        checkoutScript === 'loading'
          ? 'Secure checkout is still loading — please try again in a moment.'
          : CHECKOUT_BLOCKED_MESSAGE,
      );
      return;
    }

    setCheckoutError(null);
    setBusyPlanId(plan.id);
    try {
      const res = await api.post<CreateOrderResponse>(USER_API.CREATE_ORDER, { planID: plan.id });
      const order = res.data;
      if (!order) throw new Error('Could not start the payment. Please try again.');

      const options: RazorpayOptions = {
        key:         order.keyID,
        amount:      order.amount,
        currency:    order.currency,
        order_id:    order.orderID,
        name:        'Jetrav',
        description: `${plan.name} plan · ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`,
        theme:       { color: RAZORPAY_THEME_COLOR },
        handler: (response) => {
          // Payment captured — keep every button disabled until verification settles.
          void verifyPayment(plan, response, false).finally(() => setBusyPlanId(null));
        },
        modal: {
          ondismiss: () => setBusyPlanId(null),
        },
      };

      const checkout = new Razorpay(options);
      checkout.on('payment.failed', (failure) => {
        showError(failure.error?.description ?? 'Payment failed. You can try again.');
      });
      checkout.open();
    } catch (err) {
      showError(getErrorMessage(err, 'Failed to start the payment. Please try again.'));
      setBusyPlanId(null);
    }
  }, [billing, checkoutScript, verifyPayment]);

  const handleSelect = useCallback((plan: Plan) => {
    if (busyPlanId !== null) return;
    if (plan.isFree) void subscribeFree(plan);
    else void checkoutPaid(plan);
  }, [busyPlanId, subscribeFree, checkoutPaid]);

  // ── Payment success ────────────────────────────────────────────────────────
  if (activated) {
    return (
      <Card className={styles.successCard}>
        <EmptyState
          icon={<Icon icon={StarShine} size="md" />}
          title="Payment successful — you're all set"
          description={`Your ${activated.name} plan is now active. Thank you for travelling with Jetrav.`}
          action={<Button onClick={() => router.replace('/dashboard')}>Go to dashboard</Button>}
        />
      </Card>
    );
  }

  // ── Plan selection ─────────────────────────────────────────────────────────
  return (
    <>
      <Script
        src={RAZORPAY_CHECKOUT_SRC}
        strategy="afterInteractive"
        onReady={() => {
          setCheckoutScript('ready');
          setCheckoutError(null);
        }}
        onError={() => setCheckoutScript('failed')}
      />

      <PageHeader
        title="Choose your plan"
        description="Let Jetrav manage your trips end to end and earn more Jet Points on every booking."
      />

      {pending && (
        <div className={styles.alert} role="alert">
          <p className={styles.alertTitle}>Your payment went through, but we couldn&apos;t confirm it yet</p>
          <p className={styles.alertText}>
            {pending.message} Please don&apos;t pay again — retry the confirmation below. If it keeps
            failing, email <a href="mailto:contact@jetrav.com">contact@jetrav.com</a> with your payment ID.
          </p>
          <p className={styles.alertText}>
            Payment ID: <code className={styles.paymentId}>{pending.response.razorpay_payment_id}</code>
          </p>
          <div className={styles.alertActions}>
            <Button size="sm" loading={retrying} onClick={retryVerification}>
              Retry confirmation
            </Button>
          </div>
        </div>
      )}

      {(checkoutError || checkoutScript === 'failed') && !pending && (
        <div className={`${styles.alert} ${styles.alertWarning}`} role="alert">
          <p className={styles.alertText}>{checkoutError ?? CHECKOUT_BLOCKED_MESSAGE}</p>
        </div>
      )}

      <div className={styles.controls}>
        <Tabs label="Plan type" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        <Tabs label="Billing period" options={billingOptions} value={billing} onChange={setBilling} />
      </div>

      {plansQuery.loading ? (
        <div className={styles.centered}>
          <Spinner size={32} label="Loading plans" />
        </div>
      ) : plansQuery.error ? (
        <Card>
          <EmptyState
            variant="error"
            title="Couldn't load plans"
            description={plansQuery.error}
            action={<Button onClick={plansQuery.reload}>Try again</Button>}
          />
        </Card>
      ) : visiblePlans.length === 0 ? (
        <Card>
          <EmptyState
            title={`No ${category} plans with ${billing} billing`}
            description="Try another plan type or billing period."
          />
        </Card>
      ) : (
        <div className={styles.grid} aria-busy={busyPlanId !== null || undefined}>
          {visiblePlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billing={billing}
              isCurrent={plan.id === currentPlanId}
              busy={busyPlanId === plan.id}
              // One purchase at a time: every button is disabled while any is in flight
              disabled={busyPlanId !== null || pending !== null}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <p className={styles.footnote}>
        Prices in Indian rupees. Payments are processed securely by Razorpay.
      </p>
    </>
  );
}
