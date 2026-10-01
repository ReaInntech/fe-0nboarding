import { apiFetch } from './config';
import { Subscription, SubscriptionDTO } from './types';
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
 * This function now expects an aggregated object containing sub-resources.
 */
export function mapSubscriptionToUnifiedView(data: any): UnifiedProductViewProps {
    const sub = data.subscription || data;
    const statusRequests = data.requests || [];
    const resolvedRequests = data.resolvedRequests || [];
    const documentsRaw = data.documents || sub.documents || [];
    const payments = data.payments || sub.payments || [];

    // Merge both types of requests for the UI
    const allRequestsRaw = [...statusRequests, ...resolvedRequests];

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(amt);
    };

    // Calculate Payment Metrics
    const totalAmount = sub.price || 0;
    const paidAmount = payments
        .filter((p: any) => p.status === 'Paid')
        .reduce((sum: number, p: any) => sum + (p.amount_cents ? p.amount_cents / 100 : 0), 0);

    // Support WhatsApp Phone Integration
    const provOrg = sub.provider || sub.product?.provider || sub.product?.organization;
    const providerName = provOrg?.name || provOrg?.trade_name || provOrg?.legal_name || 'Support';
    const supportPhone = provOrg?.support_phone || provOrg?.phone || null;

    let whatsappUrl: string | undefined = undefined;
    let hasSupportPhone = false;

    if (supportPhone && String(supportPhone).trim().length > 0) {
        const cleanPhone = String(supportPhone).replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 7) {
            hasSupportPhone = true;
            const message = `Hola, requiero soporte para mi servicio "${sub.product?.name || sub.name || 'Servicio'}" (ID: ${sub.id})`;
            whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        }
    }

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
                { icon: 'business', text: providerName },
                { icon: 'category', text: sub.product?.billing_model || 'Subscription' },
            ],
            actions: hasSupportPhone && whatsappUrl ? [
                { label: 'Soporte WhatsApp', icon: 'support_agent', variant: 'secondary', href: whatsappUrl },
            ] : [],
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
        showSupportAccess: hasSupportPhone,
        supportAccessProps: hasSupportPhone && whatsappUrl ? {
            title: `${providerName} Soporte`,
            subtitle: 'Atención directa vía WhatsApp',
            buttonLabel: 'Contactar por WhatsApp',
            icon: 'support_agent',
            accentColor: '#10b981',
            whatsappUrl: whatsappUrl,
        } : undefined,
        legalDocumentsProps: {
            documents: documentsRaw.map((doc: any) => ({
                icon: 'description',
                name: doc.name || 'Document',
                description: doc.description || 'Service related document',
                createdAt: doc.created_at ? new Date(doc.created_at).toLocaleDateString('en-US') : 'N/A',
                approvedAt: doc.verified_at ? new Date(doc.verified_at).toLocaleDateString('en-US') : 'Pending',
                step: doc.step_name || 'General',
                format: doc.file_type || 'PDF',
            })),
        },
        showRequests: !!allRequestsRaw.length,
        requestsProps: {
            requests: allRequestsRaw.map((req: any) => {
                const action = req.action_request || {};
                return {
                    id: req.id,
                    type: action.request_type || 'document',
                    status: req.status || 'pending',
                    title: action.title || 'Action Request',
                    documentTitle: action.title || 'Document Request', // Fallback for specific components
                    content: action.config?.content || '',
                    config: action.config || {},
                    templateFile: action.template_file,
                    checkboxes: action.config?.checkboxes || [],
                    data: req.data, // Instance data for resolved requests
                };
            }),
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

export async function getSubscriptionRequests(id: string, token: string, orgId: string): Promise<any[]> {
    return apiFetch(`/subscriptions/${id}/status-requests`, { token, orgId });
}

export async function getSubscriptionDocuments(id: string, token: string, orgId: string): Promise<any[]> {
    return apiFetch(`/subscriptions/${id}/legal-documents`, { token, orgId });
}

export async function getSubscriptionResolvedRequests(id: string, token: string, orgId: string): Promise<any[]> {
    return apiFetch(`/subscriptions/${id}/resolved-requests`, { token, orgId });
}

/**
 * BFF Aggregator for Subscription Detail
 * Aggregates main subscription data with sub-resources (requests, documents, etc.)
 */
export async function getSubscriptionDetailInit(id: string, token: string, orgId: string): Promise<UnifiedProductViewProps> {
    const [subscription, statusRequests, resolvedRequests, documents] = await Promise.all([
        getSubscriptionDetail(id, token, orgId),
        getSubscriptionRequests(id, token, orgId),
        getSubscriptionResolvedRequests(id, token, orgId),
        getSubscriptionDocuments(id, token, orgId)
    ]);
    console.log('requests', statusRequests, resolvedRequests);
    return mapSubscriptionToUnifiedView({
        subscription,
        requests: statusRequests,
        resolvedRequests: resolvedRequests,
        documents,
        payments: subscription.payments || []
    });
}
