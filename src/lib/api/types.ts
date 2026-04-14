export type RoleName = 'owner' | 'admin' | 'member' | 'viewer';
export type ClientType = 'natural_person' | 'legal_entity';

export interface Organization {
  id: string;
  client_type: ClientType;
  legal_name: string;
  trade_name?: string;
  logo_url?: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role_name: RoleName;
  organization?: Organization;
}

export interface Notification {
  title: string;
  time: string;
  message: string;
  variant?: 'critical' | 'warning' | 'info' | 'success';
}

export interface Subscription {
  id: string;
  name: string;
  tier: string;
  icon: string;
  status: 'active' | 'pause' | 'cancel';
  progressLabel?: string;
  progressValue?: string;
  currentStep?: number;
  totalSteps?: number;
  progressPct?: number;
  price: string;
  pricePeriod: string;
  hasActionRequest?: boolean;
}

/**
 * Billing Frontend Models
 */
export interface Transaction {
  id?: string;
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Error' | string;
}

export interface PaymentMethod {
  id?: string;
  typeLabel: string;
  name: string;
  lastFour: string;
  holder: string;
  expiry: string;
  brand: string;
  primary?: boolean;
}

/**
 * Provider Frontend Models
 */
export interface FinanceKpis {
  totalRevenue: number;
  pendingPayout: number;
  activeClients: number;
  successRate: number;
  growth?: number;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface DistributionData {
  name: string;
  value: number;
  color: string;
}

/**
 * Raw Backend Data Transfer Objects (DTOs)
 */
export interface SubscriptionDTO {
  id: string;
  status: string;
  tier_name: string;
  monthly_price: number;
  progress_pct: number;
  product: {
    name: string;
    icon: string;
    icon_color: string;
  };
  has_action_request?: boolean;
  current_step?: number;
  total_steps?: number;
  progress_label?: string;
  progress_value?: string;
}

export interface TransactionDTO {
  id: string;
  created_at: string;
  description: string;
  amount_cents: number;
  status: string;
  transaction_type?: string;
}

export interface PaymentMethodDTO {
  id: string;
  card_brand: string;
  last_four: string;
  cardholder_name: string;
  expiration_date: string;
  is_primary: boolean;
  payment_type: string;
}

export interface FinanceKpiDTO {
  total_revenue_ytd: number;
  pending_payout: number;
  active_clients_count: number;
  payment_success_rate: number;
  revenue_growth_pct?: number;
}

export interface RevenuePointDTO {
  period: string;
  amount: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: any;
  error?: string;
}
