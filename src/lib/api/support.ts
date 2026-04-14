import { apiFetch, executeWithFallback } from './config';
import { FALLBACK_SUPPORT_DATA } from './mocks';

export async function getTickets(id: string, token: string, orgId: string) {
  return apiFetch(`/subscriptions/${id}/tickets`, { token, orgId });
}

export async function getTicketMessages(ticketId: string, token: string, orgId: string) {
  return apiFetch(`/tickets/${ticketId}/messages`, { token, orgId });
}

export async function createTicket(subscriptionId: string, data: any, token: string, orgId: string) {
  return apiFetch(`/subscriptions/${subscriptionId}/tickets`, {
    method: 'POST',
    token,
    orgId,
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * BFF Aggregator for Support Initial State
 */
export async function getSupportData(token?: string, orgId?: string) {
  return executeWithFallback(async () => {
    // Currently mapping is handled by providing the FALLBACK_SUPPORT_DATA 
    // until real endpoints are fully wired.
    throw new Error('Not implemented');
  }, FALLBACK_SUPPORT_DATA);
}
