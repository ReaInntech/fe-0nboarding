import { apiFetch } from './config';

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
  return {
    stats: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
    ticketListProps: { tickets: [], total: 0 }
  };
}
