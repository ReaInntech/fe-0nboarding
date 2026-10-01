'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../../../shared/atoms/Icon';
import { useProviderBranding } from '@/src/context/BrandContext';
import styles from './index.module.scss';

export interface SupportLinksProps {
    className?: string;
    providerSlug?: string;
    supportPhone?: string | null;
    providerName?: string;
    isGeneral?: boolean;
}

export default function SupportLinks({
    className,
    providerSlug: propSlug,
    supportPhone: propPhone,
    providerName: propName,
    isGeneral,
}: SupportLinksProps) {
    const brandCtx = useProviderBranding();

    const isExplicitlyGeneral = isGeneral === true;
    const effectiveSlug = propSlug || (!isExplicitlyGeneral ? brandCtx?.providerSlug : undefined);
    const effectivePhone = propPhone !== undefined ? propPhone : (!isExplicitlyGeneral ? brandCtx?.branding?.support_phone : null);
    const effectiveName = propName || (!isExplicitlyGeneral ? (brandCtx?.branding?.name || 'su empresa') : 'su empresa');

    // Condition 1: Must be a non-general dashboard (not explicitly general AND has a valid provider slug)
    const isNonGeneralDashboard = !isExplicitlyGeneral && Boolean(effectiveSlug && effectiveSlug.trim().length > 0);

    // Condition 2: Must have a configured support phone with valid numbers (at least 7 digits)
    const cleanPhone = effectivePhone ? String(effectivePhone).replace(/[^0-9]/g, '') : '';
    const hasValidSupportPhone = cleanPhone.length >= 7;

    const showContactSupport = isNonGeneralDashboard && hasValidSupportPhone;

    const message = `Hola, requiero soporte para mis servicios con ${effectiveName}`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const basePath = effectiveSlug ? `/${effectiveSlug}` : '';
    const billingPath = `${basePath}/billing`;

    return (
        <section className={`${styles['support-links']} ${className || ''}`}>
            <div className={`${styles['support-links__grid']} ${!showContactSupport ? 'sm:grid-cols-1 max-w-xl' : ''}`}>
                <Link href={billingPath} className={`group ${styles['support-links__card']}`}>
                    <Icon name="receipt_long" className={styles['support-links__icon']} />
                    <h4 className={styles['support-links__title']}>View Billing History</h4>
                    <p className={styles['support-links__desc']}>Download invoices and manage payment methods.</p>
                </Link>

                {showContactSupport && (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group ${styles['support-links__card']}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Icon name="support_agent" className={`${styles['support-links__icon']} !mb-0`} />
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <Icon name="chat" className="text-xs" /> WhatsApp
                            </span>
                        </div>
                        <h4 className={styles['support-links__title']}>Contact Support</h4>
                        <p className={styles['support-links__desc']}>Get direct assistance via WhatsApp with {effectiveName}.</p>
                    </a>
                )}
            </div>
        </section>
    );
}

