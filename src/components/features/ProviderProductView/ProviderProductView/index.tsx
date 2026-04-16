'use client';

import React from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import ProviderProductHeader from '../ProviderProductHeader';
import ProviderOnboardingManager from '../ProviderOnboardingManager';
import ProviderRequestsManager from '../ProviderRequestsManager';
import ProviderRequirementsManager from '../ProviderRequirementsManager';
import { OnboardingStep, ClientRequest, RequirementField } from '@/src/lib/api/types';
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
    userProfile?: any;
}

export default function ProviderProductView({ 
    product, 
    onboardingSteps, 
    requirements, 
    requests,
    userProfile
}: ProviderProductViewProps) {
    const { user } = useApp();

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
                <ProviderOnboardingManager initialSteps={onboardingSteps} />

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
