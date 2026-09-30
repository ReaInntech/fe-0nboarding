import { apiFetch } from './config';
import { 
  Transaction, 
  TransactionDTO, 
  PaymentMethod, 
  PaymentMethodDTO 
} from './types';

export function mapTransaction(dto: TransactionDTO): Transaction {
  return {
    id: dto.transaction_id,
    date: dto.processed_at,
    description: dto.memo || 'Subscription Payment',
    amount: dto.amount_cents / 100,
    status: dto.status as Transaction['status'],
    type: 'subscription',
  };
}

export function mapPaymentMethod(dto: PaymentMethodDTO): PaymentMethod {
  return {
    id: dto.id,
    type: dto.brand.toLowerCase() as any,
    typeLabel: dto.payment_type || 'Credit Card',
    name: dto.cardholder_name || 'Card',
    lastFour: dto.last_four,
    holder: dto.cardholder_name,
    expiry: dto.expiration_date,
    brand: dto.brand,
    isDefault: dto.is_primary
  };
}

export async function getTransactions(token: string, orgId: string): Promise<Transaction[]> {
  const data = await apiFetch<TransactionDTO[]>('/billing/transactions', { 
    microservice: 'payments',
    token, 
    orgId 
  });
  return (data || []).map(mapTransaction);
}

export async function getPaymentMethods(token: string, orgId: string): Promise<PaymentMethod[]> {
  const data = await apiFetch<PaymentMethodDTO[]>('/billing/methods', { 
    microservice: 'payments',
    token, 
    orgId 
  });
  return (data || []).map(mapPaymentMethod);
}

/**
 * BFF Aggregator for Billing Initial State
 */
export async function getBillingInit(token: string, orgId: string) {
  try {
    const [transactions, methods] = await Promise.all([
      getTransactions(token, orgId),
      getPaymentMethods(token, orgId),
    ]);

    return {
      transactions: transactions || [],
      methods: methods || [],
    };
  } catch (error) {
    console.error('[PaymentsAPI] getBillingInit failed:', error);
    return {
      transactions: [],
      methods: [],
    };
  }
}
