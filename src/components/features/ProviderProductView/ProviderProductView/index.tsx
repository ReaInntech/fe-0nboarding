'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import Icon from '../../../shared/atoms/Icon';
import ProviderProductHeader from '../ProviderProductHeader';
import ProviderOnboardingManager from '../ProviderOnboardingManager';
import ProviderRequestsManager from '../ProviderRequestsManager';
import ProviderDetailsProduct from '../ProviderDetailsProduct';
import ProductNotificationConfigTab from '../ProductNotificationConfigTab';
import { OnboardingStep, ClientRequest, OnboardingRequest, UserProfile, Product } from '@/src/lib/api/types';
import * as api from '@/src/lib/api/provider';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface ProviderProductViewProps {
    product: Product;
    onboardingSteps: OnboardingStep[];
    metadata?: Record<string, any>;
    requests: ClientRequest[];
    userProfile?: UserProfile;
}

export default function ProviderProductView({
    product,
    onboardingSteps,
    metadata = {},
    requests,
    userProfile
}: ProviderProductViewProps) {
    const { user } = useApp();
    const orgId = user?.organization?.id || '';
    const [activeTab, setActiveTab] = useState<'onboarding' | 'notifications'>('onboarding');

    const getFreshToken = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return '';
        return await currentUser.getIdToken();
    };

    const handleSaveMetadata = async (newMetadata: Record<string, any>) => {
        if (!product?.productCode) return;
        const freshToken = await getFreshToken();
        await api.updateProductMetadata(product.productCode, freshToken, orgId, newMetadata);
    };

    const handleSaveProductHeader = async (data: any) => {
        if (!product?.productCode) return;
        const freshToken = await getFreshToken();
        await api.updateProduct(product.productCode, freshToken, orgId, {
            name: data.name,
            description: data.description,
            icon: data.icon,
            icon_color: data.color,
            base_price: data.price ? Number(data.price) : undefined,
            billing_model: data.billing,
            status: data.status,
        });
    };

    const handleSaveStepMetadata = async (stepId: string, data: Partial<OnboardingStep>): Promise<void> => {
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

    const handleDeleteStep = async (stepId: string) => {
        if (!product?.productCode) return;
        const freshToken = await getFreshToken();
        await api.deleteProductStep(product.productCode, stepId, freshToken, orgId);
    };

    return (
        <div className={styles['provider-view']}>
            <ProviderTopNavigation activeTab="Products" userProfile={userProfile} />
            <main className={styles['provider-view__main']}>
                <div className={styles['provider-view__header-section']}>
                    <ProviderProductHeader
                        title={product?.name}
                        description={product?.description}
                        price={product?.price}
                        billing={product?.period}
                        status={product?.status}
                        productId={product?.productCode}
                        productUuid={product?.id}
                        icon={product?.icon}
                        iconColor={product?.iconColor}
                        badgeText={product?.status === 'active' ? 'Fully Provisioned' : 'Setup in Progress'}
                        badgeVariant={product?.status === 'active' ? 'success' : 'warning'}
                        sold={product?.sold || 0}
                        onSaveProduct={handleSaveProductHeader}
                        productMetadata={metadata}
                    />
                </div>

                {/* Tabs Navigation */}
                <div className={styles['provider-view__tabs-nav']}>
                    <button
                        type="button"
                        onClick={() => setActiveTab('onboarding')}
                        className={`${styles['provider-view__tab-btn']} ${activeTab === 'onboarding' ? styles['provider-view__tab-btn--active'] : ''}`}
                    >
                        <Icon name="account_tree" className="text-sm" />
                        <span>Flujo de Onboarding & Requisitos</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('notifications')}
                        className={`${styles['provider-view__tab-btn']} ${activeTab === 'notifications' ? styles['provider-view__tab-btn--active'] : ''}`}
                    >
                        <Icon name="notifications_active" className="text-sm" />
                        <span>Configure notifications</span>
                    </button>
                </div>

                {activeTab === 'notifications' ? (
                    <ProductNotificationConfigTab
                        productId={product?.id || product?.productCode}
                        productName={product?.name || 'Producto'}
                        providerLogo={user?.organization?.logo_url}
                        providerName={user?.organization?.legal_name || 'Proveedor'}
                    />
                ) : (
                    <>
                        {/* Requirements - full width */}
                        <ProviderDetailsProduct 
                            initialMetadata={metadata} 
                            onSave={handleSaveMetadata}
                        />

                        {/* Onboarding - full width */}
                        <ProviderOnboardingManager
                            initialSteps={onboardingSteps}
                            productPrice={product?.price || 0}
                            onSaveStepMetadata={handleSaveStepMetadata}
                            onSaveRequest={handleSaveRequest}
                            onDeleteRequest={handleDeleteRequest}
                            onDeleteStep={handleDeleteStep}
                            onCancel={() => {
                                console.log('[ProviderProductView] Cancelled onboarding changes');
                            }}
                        />

                        {/* Requests - full width */}
                        <ProviderRequestsManager requests={requests} />

                        {/* Activity Log Placeholder */}
                        <div className={styles['provider-view__activity-log']}>
                            <h4>Usage Activity Log</h4>
                            <p>Detailed logs of client interactions and service consumption will appear here.</p>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
