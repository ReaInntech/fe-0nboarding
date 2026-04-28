'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import ProviderProductHeader from '../ProviderProductHeader';
import ProviderOnboardingManager from '../ProviderOnboardingManager';
import ProviderRequestsManager from '../ProviderRequestsManager';
import ProviderRequirementsManager from '../ProviderRequirementsManager';
import { OnboardingStep, ClientRequest, RequirementField, OnboardingRequest, UserProfile } from '@/src/lib/api/types';
import * as api from '@/src/lib/api/provider';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface ProductData {
    name: string;
    productCode: string;
    icon: string;
    iconColor: string;
    status: 'active' | 'pending' | string;
}

export interface ProviderProductViewProps {
    product: ProductData;
    onboardingSteps: OnboardingStep[];
    requirements: RequirementField[];
    requests: ClientRequest[];
    userProfile?: UserProfile;
}

export default function ProviderProductView({
    product,
    onboardingSteps,
    requirements,
    requests,
    userProfile
}: ProviderProductViewProps) {
    const { user } = useApp();
    const orgId = user?.organization?.id || '';

    const getFreshToken = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return '';
        return await currentUser.getIdToken();
    };

    const handleSaveStepMetadata = async (stepId: string, data: Partial<OnboardingStep>) => {
        if (!product?.productCode) return;
        const freshToken = await getFreshToken();
        const isNew = stepId.startsWith('step_');

        // Note: Backend DTO uses 'label', but Frontend state uses 'name'
        const stepLabel = data.name || 'New Step';

        if (isNew) {
            await api.createProductStep(product.productCode, freshToken, orgId, {
                label: stepLabel,
                description: data.description || '',
                icon: data.icon || 'Plus',
                type: data.type || 'form',
                sort_order: onboardingSteps.length // Append to end
            });
        } else {
            await api.updateProductStepMetadata(product.productCode, stepId, freshToken, orgId, {
                label: stepLabel,
                description: data.description,
                icon: data.icon,
                type: data.type
            });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSaveRequest = async (stepId: string, requestId: string, type: OnboardingRequest['type'], config: any) => {
        if (!product?.productCode) return;
        const freshToken = await getFreshToken();

        const isNew = requestId.startsWith('req_'); // Locally generated ID

        if (isNew) {
            return await api.createActionRequest(product.productCode, stepId, freshToken, orgId, {
                request_type: type,
                title: config.formTitle || config.documentTitle || 'New Request',
                description: config.instructions || config.content || '',
                config
            });
        } else {
            return await api.updateActionRequest(requestId, freshToken, orgId, {
                title: config.formTitle || config.documentTitle,
                description: config.instructions || config.content,
                config
            });
        }
    };

    const handleDeleteRequest = async (requestId: string) => {
        const freshToken = await getFreshToken();
        const isNew = requestId.startsWith('req_');
        if (!isNew) {
            await api.deleteActionRequest(requestId, freshToken, orgId);
            // Optional: for complete safety, reload or ensure steps refetch
            // window.location.reload(); 
        }
    };

    return (
        <div className={styles['provider-view']}>
            <ProviderTopNavigation activeTab="Products" userProfile={userProfile} />
            <main className={styles['provider-view__main']}>
                <div className={styles['provider-view__header-section']}>
                    <ProviderProductHeader
                        title={product?.name}
                        productId={product?.productCode}
                        icon={product?.icon}
                        iconColor={product?.iconColor}
                        badgeText={product?.status === 'active' ? 'Fully Provisioned' : 'Setup in Progress'}
                        badgeVariant={product?.status === 'active' ? 'success' : 'warning'}
                        clientName="Example Client Corp"
                        clientId="CL-9482"
                    />
                </div>

                {/* Onboarding - full width */}
                <ProviderOnboardingManager
                    initialSteps={onboardingSteps}
                    onSaveStepMetadata={handleSaveStepMetadata}
                    onSaveRequest={handleSaveRequest}
                    onDeleteRequest={handleDeleteRequest}
                    onCancel={() => {
                        console.log('[ProviderProductView] Cancelled onboarding changes');
                    }}
                />

                {/* Requirements - full width */}
                <ProviderRequirementsManager initialRequirements={requirements} />

                {/* Requests - full width */}
                <ProviderRequestsManager requests={requests} />

                {/* Activity Log Placeholder */}
                <div className={styles['provider-view__activity-log']}>
                    <h4>Usage Activity Log</h4>
                    <p>Detailed logs of client interactions and service consumption will appear here.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
