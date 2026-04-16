import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import SubscriptionActionCenter from '../SubscriptionActionCenter';
import { Subscription } from '@/src/lib/api/types';
export type SubscriptionData = Subscription;
import styles from './index.module.scss';

export interface SubscriptionRowProps {
    sub: SubscriptionData;
    className?: string;
    initialExpanded?: boolean;
}

export default function SubscriptionRow({ sub, className, initialExpanded = false }: SubscriptionRowProps) {
    const [isExpanded, setIsExpanded] = useState(initialExpanded);

    let statusModifier = 'default';
    if (sub.status === 'active') statusModifier = 'active';
    else if (sub.status === 'in_progress') statusModifier = 'in_progress';
    else if (sub.status === 'suspended') statusModifier = 'suspended';
    else if (sub.status === 'cancelled') statusModifier = 'cancelled';

    return (
        <div className={`${styles['subscription-row']} ${className || ''}`}>
            {/* Header / Condensed Row */}
            <div
                className={`group ${styles['subscription-row__header']}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {/* Client Info */}
                <div className={styles['subscription-row__client-info']}>
                    <div className={styles['subscription-row__client-icon-wrapper']}>
                        <Icon name={sub.client?.clientType === 'legal_entity' ? 'domain' : 'person'} />
                    </div>
                    <div className={styles['subscription-row__client-details']}>
                        <h4 className={styles['subscription-row__client-name']}>{sub.client?.legalName}</h4>
                        <p className={styles['subscription-row__client-id']}>ID: {sub.client?.id}</p>
                    </div>
                </div>

                {/* Product Info */}
                <div className={styles['subscription-row__product-info']}>
                    <Icon name={sub.product?.icon || 'category'} className={styles['subscription-row__product-icon']} style={{ color: sub.product?.iconColor }} />
                    <div className={styles['subscription-row__product-details']}>
                        <span className={styles['subscription-row__product-name']}>{sub.product?.name}</span>
                        <span className={styles['subscription-row__product-tier']}>{sub.tierName}</span>
                    </div>
                </div>

                {/* Status & Revenue */}
                <div className={styles['subscription-row__status-wrapper']}>
                    <span className={`${styles['subscription-row__status-badge']} ${styles[`subscription-row__status-badge--${statusModifier}`]}`}>
                        {(sub.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                    <div className={styles['subscription-row__revenue']}>
                        <span className={styles['subscription-row__revenue-amount']}>${(sub.monthlyPrice || 0).toLocaleString()}</span>
                        <span className={styles['subscription-row__revenue-period']}>{sub.pricePeriod}</span>
                    </div>
                    <button className={styles['subscription-row__expand-btn']}>
                        <Icon name={isExpanded ? 'expand_less' : 'expand_more'} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <>
                    <div className={styles['subscription-row__expanded-content']}>
                        {/* Column 1: Client & Subscription Details */}
                        <div className={styles['subscription-row__info-group']}>
                            <div>
                                <h5 className={styles['subscription-row__section-title']}>Client Contact</h5>
                                <div className={styles['subscription-row__info-block']}>
                                    <div className={styles['subscription-row__info-row']}>
                                        <Icon name="mail" className={styles['subscription-row__info-icon']} />
                                        <span>{sub.client?.email}</span>
                                    </div>
                                    <div className={styles['subscription-row__info-row']}>
                                        <Icon name="phone" className={styles['subscription-row__info-icon']} />
                                        <span>{sub.client?.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h5 className={styles['subscription-row__section-title']}>Subscription Details</h5>
                                <div className={styles['subscription-row__info-block']}>
                                    <p><span className={styles['subscription-row__info-label']}>Provisioned:</span> {sub.provisionedAt ? new Date(sub.provisionedAt).toLocaleDateString() : 'N/A'}</p>
                                    <p><span className={styles['subscription-row__info-label']}>Sub ID:</span> <span className={styles['subscription-row__mono-badge']}>{sub.id}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Recent Payments */}
                        <div>
                            <h5 className={styles['subscription-row__section-title']}>Recent Payments</h5>
                            {sub.payments && sub.payments.length > 0 ? (
                                <div className={styles['subscription-row__payments-list']}>
                                    <div className={styles['subscription-row__payments-container']}>
                                        {sub.payments.slice(0, 3).map(payment => {
                                            let iconMod = 'paid';
                                            if (payment.status === 'Pending') iconMod = 'pending';
                                            if (payment.status === 'Error' || payment.status === 'Failed') iconMod = 'error';

                                            return (
                                                <div key={payment.id} className={styles['subscription-row__payment-item']}>
                                                    <div className={styles['subscription-row__payment-info']}>
                                                        <div className={styles['subscription-row__payment-icon-wrapper']}>
                                                            <Icon
                                                                name={payment.status === 'Paid' ? 'check_circle' : payment.status === 'Pending' ? 'schedule' : 'error'}
                                                                className={`${styles['subscription-row__payment-icon']} ${styles[`subscription-row__payment-icon--${iconMod}`]}`} />
                                                        </div>
                                                        <div className={styles['subscription-row__payment-details']}>
                                                            <span className={styles['subscription-row__payment-date']}>{payment.date}</span>
                                                            {payment.paymentMethod && (
                                                                <span className={styles['subscription-row__payment-method']}>{payment.paymentMethod}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className={styles['subscription-row__payment-amount-wrapper']}>
                                                        <span className={styles['subscription-row__payment-amount']}>${payment.amount.toLocaleString()}</span>
                                                        <span className={styles['subscription-row__payment-status']}>{payment.status}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {sub.payments.length > 3 && (
                                        <button className={`group ${styles['subscription-row__see-more-btn']}`}>
                                            Ver mas
                                            <Icon name="arrow_forward" className={styles['subscription-row__see-more-icon']} />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className={styles['subscription-row__empty-text']}>No payment history.</p>
                            )}
                        </div>

                        {/* Column 3: Legal Documents */}
                        <div>
                            <h5 className={styles['subscription-row__section-title']}>Legal Documents</h5>
                            {sub.documents && sub.documents.length > 0 ? (
                                <div className={styles['subscription-row__docs-container']}>
                                    {sub.documents.map((doc, idx) => (
                                        <div key={idx} className={styles['subscription-row__doc-item']}>
                                            <div className={styles['subscription-row__doc-info']}>
                                                <Icon name="description" className={styles['subscription-row__doc-icon']} />
                                                <span className={styles['subscription-row__doc-name']}>{doc.name}</span>
                                            </div>
                                            <span className={`${styles['subscription-row__doc-status']} ${styles[`subscription-row__doc-status--${doc.status === 'signed' ? 'signed' : 'pending'}`]}`}>
                                                {doc.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles['subscription-row__empty-text']}>No documents attached.</p>
                            )}
                        </div>
                    </div>
                    <SubscriptionActionCenter steps={sub.steps} requests={sub.requests} />
                </>
            )}
        </div>
    );
}
