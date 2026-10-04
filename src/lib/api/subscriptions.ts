import { apiFetch } from './config';
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
    const totalAmount = Number(sub.price) || Number(sub.product?.price) || 0;
    const paidAmount = payments
        .filter((p: any) => p.status === 'Paid')
        .reduce((sum: number, p: any) => {
            const val = p.amount !== undefined && p.amount !== null
                ? Number(p.amount)
                : (p.amount_cents ? p.amount_cents / 100 : 0);
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

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
                const reqData = req.data || {};
                const reviewedAtTime = reqData.reviewedAt
                    ? new Date(reqData.reviewedAt).getTime()
                    : (req.reviewed_at ? new Date(req.reviewed_at).getTime() : 0);

                const uploadedAtTime = reqData.uploadedAt
                    ? new Date(reqData.uploadedAt).getTime()
                    : (reqData.updatedAt ? new Date(reqData.updatedAt).getTime() : 0);

                const hasEvidenceSinceReview = Boolean(
                    reviewedAtTime > 0 && uploadedAtTime > reviewedAtTime
                );

                const isExplicitlyPending = (reqData.status === 'pending' || req.status === 'pending') && reqData.providerStatus !== 'rejected';

                const isApproved =
                    reqData.status === 'approved' ||
                    reqData.providerStatus === 'approved' ||
                    reqData.clientStatus === 'approved' ||
                    req.status === 'approved';

                const isRejectedCandidate =
                    reqData.status === 'rejected' ||
                    reqData.providerStatus === 'rejected' ||
                    reqData.clientStatus === 'rejected' ||
                    req.status === 'rejected';

                const isRejected = !isApproved && isRejectedCandidate && !hasEvidenceSinceReview && !isExplicitlyPending;

                let effectiveStatus = 'pending';
                if (isApproved) {
                    effectiveStatus = 'approved';
                } else if (isRejected) {
                    effectiveStatus = 'rejected';
                } else if (reqData.clientStatus) {
                    effectiveStatus = reqData.clientStatus;
                } else if (reqData.receiptFile || reqData.receiptUrl) {
                    effectiveStatus = 'processing';
                } else if (reqData.status) {
                    effectiveStatus = reqData.status;
                } else {
                    effectiveStatus = req.status || 'pending';
                }
                return {
                    id: req.id,
                    subscriptionId: sub.id,
                    type: action.request_type || 'document',
                    status: effectiveStatus as any,
                    title: action.title || 'Action Request',
                    documentTitle: action.title || 'Document Request', // Fallback for specific components
                    content: action.config?.content || '',
                    config: action.config || {},
                    templateFile: action.template_file,
                    customDocumentPerUser: action.config?.customDocumentPerUser || false,
                    waitingExplanationMessage: action.config?.waitingExplanationMessage,
                    checkboxes: action.config?.checkboxes || [],
                    data: reqData, // Instance data for resolved requests
                    feedbackNotes: effectiveStatus === 'rejected' ? (reqData.feedbackNotes || req.feedback_notes) : undefined,
                } as any;
            }),
        },
        showPaymentHistory: !!payments.length,
        paymentHistoryProps: {
            title: 'Payment History',
            showDownloadAll: true,
            payments: payments.map((p: any) => ({
                date: p.processed_at ? new Date(p.processed_at).toLocaleDateString('en-US') : (p.date || 'N/A'),
                description: p.description || 'Service Payment',
                amount: formatCurrency(
                    p.amount !== undefined && p.amount !== null
                        ? Number(p.amount)
                        : (p.amount_cents ? p.amount_cents / 100 : 0)
                ),
                status: p.status || 'Pending',
                receiptUrl: p.receipt_url || p.receiptUrl,
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

export async function getSubscriptionPayments(id: string, token: string, orgId: string): Promise<any[]> {
    try {
        return await apiFetch(`/subscriptions/${id}/payments`, { token, orgId });
    } catch {
        return [];
    }
}

/**
 * BFF Aggregator for Subscription Detail
 * Aggregates main subscription data with sub-resources (requests, documents, etc.)
 */
export async function getSubscriptionDetailInit(id: string, token: string, orgId: string): Promise<UnifiedProductViewProps> {
    const [subscription, statusRequests, resolvedRequests, documents, payments] = await Promise.all([
        getSubscriptionDetail(id, token, orgId),
        getSubscriptionRequests(id, token, orgId),
        getSubscriptionResolvedRequests(id, token, orgId),
        getSubscriptionDocuments(id, token, orgId),
        getSubscriptionPayments(id, token, orgId),
    ]);

    const allPayments = (payments && payments.length > 0) ? payments : (subscription?.payments || []);

    return mapSubscriptionToUnifiedView({
        subscription,
        requests: statusRequests,
        resolvedRequests: resolvedRequests,
        documents,
        payments: allPayments
    });
}
