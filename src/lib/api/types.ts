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
  firebasePhotoUrl?: string;
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
  name?: string;
  tier?: string;
  icon?: string;
  status: 'active' | 'in_progress' | 'suspended' | 'cancelled' | 'pause' | string;
  progressLabel?: string;
  progressValue?: string;
  progressPct?: number;
  price?: string;
  pricePeriod?: string;
  hasActionRequest?: boolean;
  currentStep?: number;
  totalSteps?: number;

  // Provider-specific details (Aliased mapping)
  client?: {
    id: string;
    legalName: string;
    clientType: 'legal_entity' | 'person' | string;
    email: string;
    phone: string;
  };
  product?: {
    name: string;
    icon: string;
    iconColor: string;
  };
  tierName?: string;
  monthlyPrice?: number;
  payments?: any[];
  documents?: any[];
  provisionedAt?: string | null;
  steps?: any[];
  requests?: any[];
}

export type SubscriptionData = Subscription; // For compatibility with components

/**
 * Billing Frontend Models
 */
export interface Transaction {
  id?: string;
  date: string;
  description: string;
  amount: number; // Changed from string to number
  status: 'Paid' | 'Pending' | 'Error' | string;
  type?: string;
}

export interface PaymentMethod {
  id?: string;
  type: 'visa' | 'mastercard' | 'amex' | 'paypal' | 'bank' | string; // Added field
  typeLabel: string;
  name: string;
  lastFour: string;
  holder: string;
  expiry: string;
  brand: string;
  primary?: boolean;
  isDefault?: boolean; // Added field
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
  label: string;
  value: number;
}

export interface DistributionData {
  name: string;
  value: number;
  color: string;
  label: string;
}

/**
 * Raw Backend Data Transfer Objects (DTOs)
 */
export interface NotificationDTO {
  id: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  is_read: boolean;
}

export interface SubscriptionDTO {
  id: string;
  name: string; // Added fields missing from mapping logic
  status: string;
  tier_name: string;
  icon_slug: string; // Added
  current_milestone: string; // Added
  progress_percentage: number; // Added
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
  transaction_id: string; // Added fields missing from mapping logic
  processed_at: string; // Added
  memo: string; // Added
  created_at: string;
  description: string;
  amount_cents: number;
  status: string;
  transaction_type?: string;
}

export interface PaymentMethodDTO {
  id: string;
  brand: string; // Added
  exp_month: number; // Added
  exp_year: number; // Added
  last_four: string;
  card_brand: string;
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

/**
 * Product & Step Management DTOs
 */
export interface CreateProductDTO {
  product_code: string;
  name: string;
  icon?: string;
  icon_color?: string;
  description?: string;
  service_type?: string;
  deployment_region?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateContractingStepDTO {
  label: string;
  icon?: string;
  sort_order?: number;
}

export interface StepOrderItemDTO {
  id: string;
  sort_order: number;
}

export interface ReorderStepsDTO {
  steps: StepOrderItemDTO[];
}

/**
 * Product View Specific Interfaces
 */
export interface OnboardingRequest {
  id: string;
  title: string;
  type: 'payment' | 'document' | 'terms' | 'form';
  config?: any;
}

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'auto' | 'review';
  requests: OnboardingRequest[];
}

export interface ClientRequest {
  id: string;
  subject: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | string;
  priority: 'high' | 'medium' | 'low' | string;
  date: string;
}

export interface RequirementField {
  id: string;
  label: string;
  value: string;
  required: boolean;
}

export interface ProductDetailData {
  name: string;
  productCode: string;
  icon: string;
  iconColor: string;
  status: 'active' | 'pending' | string;
}
