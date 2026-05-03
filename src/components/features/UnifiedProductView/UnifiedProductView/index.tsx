'use client';

import React from 'react';
import TopNavigation from '../../../shared/molecule/TopNavigation';
import Footer from '../../../shared/molecule/Footer';
import ProductHeader, { ProductHeaderProps } from '../ProductHeader';
import ContractingProgress, { ContractingProgressProps } from '../ContractingProgress';
import ServiceDetails, { ServiceDetailsProps } from '../ServiceDetails';
import SupportAccess, { SupportAccessProps } from '../SupportAccess';
import LegalDocuments, { LegalDocumentsProps } from '../LegalDocuments';
import PaymentHistory, { PaymentHistoryProps } from '../PaymentHistory';
import PaymentRequest, { PaymentRequestProps } from '../PaymentRequest';
import DocumentRequest, { DocumentRequestProps } from '../DocumentRequest';
import FormRequest, { FormRequestProps } from '../FormRequest';
import TermsAndConditionsRequest, { TermsAndConditionsRequestProps } from '../TermsAndConditionsRequest';
import styles from './index.module.scss';

export type RequestType = 
    | ({ type: 'payment' } & PaymentRequestProps)
    | ({ type: 'document' } & DocumentRequestProps)
    | ({ type: 'form' } & FormRequestProps)
    | ({ type: 'terms' } & TermsAndConditionsRequestProps);

export interface UnifiedProductViewProps {
    headerProps: ProductHeaderProps;
    showContractingProgress?: boolean;
    contractingProgressProps?: ContractingProgressProps;
    serviceDetailsProps: ServiceDetailsProps;
    supportAccessProps?: SupportAccessProps;
    showSupportAccess?: boolean;
    legalDocumentsProps: LegalDocumentsProps;
    showRequests?: boolean;
    requestsProps?: { requests: RequestType[] };
    showPaymentHistory?: boolean;
    paymentHistoryProps?: PaymentHistoryProps;
    userProfile?: any;
    children?: React.ReactNode;
}

export default function UnifiedProductView({
    headerProps,
    showContractingProgress = true,
    contractingProgressProps,
    serviceDetailsProps,
    supportAccessProps,
    showSupportAccess = true,
    legalDocumentsProps,
    showRequests = true,
    requestsProps = { requests: [] },
    showPaymentHistory = false,
    paymentHistoryProps,
    userProfile,
    children,
}: UnifiedProductViewProps) {
    return (
        <div className={styles['unified-product-view']}>
            <TopNavigation activeTab="Services" userProfile={userProfile} />

            <main className={styles['unified-product-view__main']}>
                <ProductHeader {...headerProps} />
                
                {showContractingProgress && contractingProgressProps && (
                    <ContractingProgress {...contractingProgressProps} />
                )}

                {children ? (
                    children
                ) : (
                    <div className={styles['unified-product-view__grid']}>
                        <div className={styles['unified-product-view__left-col']}>
                            <ServiceDetails {...serviceDetailsProps} />
                            
                            {showSupportAccess && supportAccessProps && (
                                <SupportAccess {...supportAccessProps} />
                            )}
                            
                            <LegalDocuments {...legalDocumentsProps} />
                        </div>

                        <div className={styles['unified-product-view__right-col']}>
                            {showRequests && requestsProps?.requests?.map((req: any, index) => {
                                // Flatten config into the top-level props for the components
                                const componentProps = { ...req, ...req.config };
                                
                                switch (req.type) {
                                    case 'payment':
                                        return <PaymentRequest key={index} {...componentProps} />;
                                    case 'document':
                                        return <DocumentRequest key={index} {...componentProps} />;
                                    case 'form':
                                        return <FormRequest key={index} {...componentProps} />;
                                    case 'terms':
                                        return <TermsAndConditionsRequest key={index} {...componentProps} />;
                                    default:
                                        return null;
                                }
                            })}
                        </div>

                        {showPaymentHistory && paymentHistoryProps && (
                            <div className={styles['unified-product-view__full-col']}>
                                <PaymentHistory {...paymentHistoryProps} />
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
