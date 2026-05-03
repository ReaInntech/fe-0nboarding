import { apiFetch, executeWithFallback } from './config';
import { Subscription, SubscriptionDTO } from './types';
import { FALLBACK_SUBSCRIPTION_DETAIL_DATA } from './mocks';
import { UnifiedProductViewProps } from '@/src/components/features/UnifiedProductView/UnifiedProductView';

/**
 * Helper to map product metadata and its overrides to UI fields.
 */
export function mapProductMetadataToFields(overrides: Record<string, any>, productMetadata?: any): any[] {
    const customAttrs = productMetadata?.custom_attributes || {};
    const overrideValues = overrides || {};

    return Object.entries(customAttrs).map(([key, config]: [string, any]) => {
        // Label priority: Config label > Formatted key
        const label = config?.label || key.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

        // Value priority: Subscription Override > Product Default Value > N/A
        const rawValue = overrideValues[key] !== undefined ? overrideValues[key] : config?.value;
        const value = rawValue !== null && rawValue !== undefined ? String(rawValue) : 'N/A';

        return {
            icon: config?.icon || 'label',
            label: label,
            value: value,
        };
    });
}

/**
 * Maps raw Subscription data from the backend to the props expected by UnifiedProductView.
 */
export function mapSubscriptionToUnifiedView(sub: any): UnifiedProductViewProps {
    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(amt);
    };

    // Calculate Payment Metrics
    const payments = sub.payments || [];
    const totalAmount = sub.price || 0;
    const paidAmount = payments
        .filter((p: any) => p.status === 'Paid')
        .reduce((sum: number, p: any) => sum + (p.amount_cents ? p.amount_cents / 100 : 0), 0);

    return {
        headerProps: {
            icon: sub.product?.icon || 'hub',
            iconColor: sub.product?.icon_color || '#1978e5',
            title: sub.product?.name || 'Service Detail',
            badgeText: sub.status ? sub.status.replace('_', ' ').toUpperCase() : 'ACTIVE',
            badgeVariant: sub.status === 'active' ? 'success' : 'primary',
            productId: sub.product?.product_code || sub.id,
            meta: [
                { icon: 'calendar_today', text: `Started ${sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-US') : 'N/A'}` },
                { icon: 'business', text: 'Real Innovation Tech' },
                { icon: 'category', text: sub.product?.billing_model || 'Subscription' },
            ],
            actions: [
                { label: 'Support', icon: 'support_agent', variant: 'secondary' },
            ],
        },
        showContractingProgress: !!(sub.contracting_steps || sub.steps)?.length,
        contractingProgressProps: {
            currentPhase: sub.progress_label || 'In Progress',
            steps: (sub.contracting_steps || sub.steps || []).map((step: any) => ({
                label: step.label || step.name,
                status: (step.is_current ? 'active' : step.status || 'pending') as 'completed' | 'active' | 'pending',
                icon: step.icon || 'circle',
            })),
        },
        serviceDetailsProps: {
            title: 'Service Details',
            titleIcon: sub.product?.icon || 'settings',
            titleIconColor: sub.product?.icon_color,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            fields: [
                { icon: 'info', label: 'Service Type', value: sub.product?.name || 'N/A' },
                { icon: 'payments', label: 'Billing Model', value: sub.product?.billing_model || 'N/A' },
                { icon: 'event', label: 'Next Renewal', value: sub.next_renewal ? new Date(sub.next_renewal).toLocaleDateString('en-US') : 'N/A' },
                // Map product metadata using the helper
                ...mapProductMetadataToFields(sub.product_metadata_override, sub.product?.metadata),
            ],
        },
        supportAccessProps: {
            title: 'Real Innovation Support',
            subtitle: 'Mon - Fri: 8:00 AM – 6:00 PM',
            buttonLabel: 'Contact Support',
            icon: 'support_agent',
            accentColor: sub.product?.icon_color || '#1978e5',
        },
        legalDocumentsProps: {
            documents: (sub.documents || []).map((doc: any) => ({
                icon: 'description',
                name: doc.name || 'Document',
                description: doc.description || 'Service related document',
                createdAt: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-US') : 'N/A',
                approvedAt: doc.verified_at ? new Date(doc.verified_at).toLocaleDateString('en-US') : 'Pending',
                step: doc.step_name || 'General',
                format: doc.file_type || 'PDF',
            })),
        },
        showRequests: !!sub.requests?.length,
        requestsProps: {
            requests: (sub.requests || []).map((req: any) => ({
                ...req,
                type: req.type || 'document',
                config: req.config || {},
            })),
        },
        showPaymentHistory: !!payments.length,
        paymentHistoryProps: {
            title: 'Payment History',
            showDownloadAll: true,
            payments: payments.map((p: any) => ({
                date: p.processed_at ? new Date(p.processed_at).toLocaleDateString('en-US') : 'N/A',
                description: p.description || 'Service Payment',
                amount: formatCurrency(p.amount_cents ? p.amount_cents / 100 : 0),
                status: p.status || 'Pending',
            })),
        },
    };
}

export async function getSubscriptionDetail(id: string, token: string, orgId: string): Promise<any> {
    return apiFetch(`/subscriptions/${id}`, { token, orgId });
}

/**
 * BFF Aggregator for Subscription Detail
 */
export async function getSubscriptionDetailInit(id: string, token: string, orgId: string): Promise<UnifiedProductViewProps> {
    return executeWithFallback(async () => {
        const data = await getSubscriptionDetail(id, token, orgId);
        return mapSubscriptionToUnifiedView(data);
    }, FALLBACK_SUBSCRIPTION_DETAIL_DATA);
}
