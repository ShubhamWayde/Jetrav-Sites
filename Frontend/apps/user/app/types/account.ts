export interface PlanDetails {
  id:           number;
  name:         string;
  tier:         string;
  billingCycle: string;
  price:        number;
  features:     string[];
}

export interface SubscriptionStatus {
  hasPlan:   boolean;
  plan:      PlanDetails | null;
  startDate: string | null;
  endDate:   string | null;
  coins:     number;
}