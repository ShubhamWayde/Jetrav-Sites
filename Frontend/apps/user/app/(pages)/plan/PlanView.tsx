'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE_URL } from '@repo/auth';
import { showSuccess, showError } from '@repo/auth';
import Button from '@repo/ui/Button';

import styles from './PlanView.module.css';

// ─── Razorpay window types ────────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, any>) => { open(): void };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  id: number;
  name: string;
  description: string;
  category: string;   // individual | corporate
  tier: string;       // silver | gold | platinum
  billingCycle: string; // monthly | yearly
  price: number;
  isFree: boolean;
  isPopular: boolean;
  features: string[];
}

type Category = 'individual' | 'corporate';
type Billing  = 'monthly'    | 'yearly';
type Step     = 'select'     | 'success';

const TIER_ORDER = ['silver', 'gold', 'platinum'];

const PLAN_API = {
  PLANS:          `${API_BASE_URL}/api/user/plans`,
  SUBSCRIBE:      `${API_BASE_URL}/api/user/plans/subscribe`,
  CREATE_ORDER:   `${API_BASE_URL}/api/user/plans/create-order`,
  VERIFY_PAYMENT: `${API_BASE_URL}/api/user/plans/verify-payment`,
  SUBSCRIPTION:   `${API_BASE_URL}/api/user/subscription`,
} as const;

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlanView() {
  const router = useRouter();

  const [step,     setStep]     = useState<Step>('select');
  const [plans,    setPlans]    = useState<Plan[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [category, setCategory] = useState<Category>('individual');
  const [billing,  setBilling]  = useState<Billing>('monthly');
  const [busy,     setBusy]     = useState<number | null>(null); // planId being processed

  // Fetch plans once
  useEffect(() => {
    api.get<Plan[]>(PLAN_API.PLANS)
      .then(res => setPlans(res.data ?? []))
      .catch(() => showError('Failed to load plans. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  // Filter + sort by tier for current category + billing
  const visiblePlans = plans
    .filter(p => p.category === category && p.billingCycle === billing)
    .sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));

  // ── Free plan handler ──────────────────────────────────────────────────────
  const handleFreePlan = useCallback(async (plan: Plan) => {
    setBusy(plan.id);
    try {
      await api.post(PLAN_API.SUBSCRIBE, { planID: plan.id });
      router.replace('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setBusy(null);
    }
  }, [router]);

  // ── Paid plan handler ──────────────────────────────────────────────────────
  const handlePaidPlan = useCallback(async (plan: Plan) => {
    setBusy(plan.id);
    try {
      const res = await api.post<{ orderID: string; amount: number; currency: string; keyID: string }>(
        PLAN_API.CREATE_ORDER,
        { planID: plan.id },
      );
      const order = res.data!;

      const options = {
        key:         order.keyID,
        amount:      order.amount,
        currency:    order.currency,
        order_id:    order.orderID,
        name:        'Jetrav',
        description: `${plan.name} Plan – ${billing === 'yearly' ? 'Yearly' : 'Monthly'}`,
        theme:       { color: '#ffffff' },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            await api.post(PLAN_API.VERIFY_PAYMENT, {
              planID:            plan.id,
              razorpayOrderID:   response.razorpay_order_id,
              razorpayPaymentID: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setStep('success');
          } catch (err) {
            showError(err instanceof Error ? err.message : 'Payment verification failed');
          } finally {
            setBusy(null);
          }
        },
        modal: {
          ondismiss: () => setBusy(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setBusy(null);
    }
  }, [billing]);

  const handleSelect = useCallback((plan: Plan) => {
    if (plan.isFree) {
      handleFreePlan(plan);
    } else {
      handlePaidPlan(plan);
    }
  }, [handleFreePlan, handlePaidPlan]);

  // ── Payment success screen ─────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className={styles.successScreen}>
        <p className={styles.successLabel}>Only for paid customer</p>
        <h1 className={styles.successTitle}>Payment Successful</h1>
        <p className={styles.successSubtitle}>Thank you for subscribing!</p>
        <div className={styles.successBtn}>
          <Button onClick={() => router.replace('/dashboard')} fullWidth>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  // ── Plan selection screen ──────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Select Plan</h1>
        <p className={styles.subtitle}>Select your desired plan</p>
      </div>

      <div className={styles.controls}>
        {/* Category tabs */}
        <div className={styles.tabGroup}>
          {(['individual', 'corporate'] as Category[]).map(cat => (
            <button
              key={cat}
              type="button"
              className={`${styles.tabBtn} ${category === cat ? styles.tabBtnActive : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Billing toggle */}
        <div className={styles.tabGroup}>
          <button
            type="button"
            className={`${styles.tabBtn} ${billing === 'monthly' ? styles.tabBtnActive : ''}`}
            onClick={() => setBilling('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${billing === 'yearly' ? styles.tabBtnActive : ''}`}
            onClick={() => setBilling('yearly')}
          >
            Yearly&nbsp;<span className={styles.discount}>30% OFF</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingRow}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {visiblePlans.map(plan => (
            <div key={plan.id} className={styles.cardWrap}>
              {plan.isPopular && (
                <div className={styles.popularBadge}>Popular</div>
              )}
              <div className={`${styles.card} ${plan.isPopular ? styles.cardPopular : ''}`}>
                <div>
                  <p className={styles.planName}>{plan.name}</p>
                  <p className={styles.planDesc}>{plan.description}</p>
                </div>

                <div className={styles.priceRow}>
                  {plan.isFree ? (
                    <span className={styles.price}>Free</span>
                  ) : (
                    <>
                      <span className={styles.priceCurrency}>₹</span>
                      <span className={styles.price}>
                        {billing === 'yearly'
                          ? Math.round(plan.price / 12).toLocaleString('en-IN')
                          : plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className={styles.pricePeriod}>/mo</span>
                    </>
                  )}
                  {billing === 'yearly' && !plan.isFree && (
                    <span className={styles.billedYearly}>
                      ₹{plan.price.toLocaleString('en-IN')} billed yearly
                    </span>
                  )}
                </div>

                <Button
                  fullWidth
                  variant={plan.isPopular ? 'primary' : 'secondary'}
                  loading={busy === plan.id}
                  onClick={() => handleSelect(plan)}
                >
                  Select
                </Button>

                <ul className={styles.features}>
                  {plan.features.map((f, i) => (
                    <li key={i} className={styles.feature}>
                      <span className={styles.bullet}>•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
