import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import RequestItem, { Request } from '../RequestItem';
import OnboardingProgressBlock, { OnboardingStep } from '../OnboardingProgressBlock';
import styles from './index.module.scss';

export interface SubscriptionActionCenterProps {
    subscriptionId?: string;
    steps?: OnboardingStep[];
    requests?: Request[];
    className?: string;
}

export default function SubscriptionActionCenter({ subscriptionId, steps, requests, className }: SubscriptionActionCenterProps) {
    const hasSteps = Boolean(steps && steps.length > 0);
    const hasRequests = Boolean(requests && requests.length > 0);

    if (!hasSteps && !hasRequests) return null;

    const hasUnapprovedRequests = requests && requests.some(req => req.status !== 'approved');

    return (
        <div className={`${styles['subscription-action-center']} ${className || ''}`}>
            {hasSteps && (
                <div>
                    <OnboardingProgressBlock steps={steps!} />
                </div>
            )}

            <div className="flex flex-col justify-between h-full w-full gap-8">
                <div>
                    <h5 className={styles['subscription-action-center__section-title']}>Action Requests</h5>
                    {hasRequests ? (
                        <div className={styles['subscription-action-center__requests-grid']}>
                            {requests!.map((req, idx) => (
                                <RequestItem key={req.id || idx} req={req} subscriptionId={subscriptionId} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles['subscription-action-center__empty-state']}>
                            <Icon name="check_circle" className={styles['subscription-action-center__empty-icon']} />
                            <p className={styles['subscription-action-center__empty-text']}>All caught up! No pending requests.</p>
                        </div>
                    )}
                </div>

                {hasSteps && (
                    <div className={styles['subscription-action-center__footer']}>
                        <button
                            disabled={hasUnapprovedRequests}
                            className={`group ${styles['subscription-action-center__next-btn']} ${hasUnapprovedRequests ? styles['subscription-action-center__next-btn--disabled'] : styles['subscription-action-center__next-btn--active']}`}
                        >
                            <span>Advance to Next Step</span>
                            <Icon name="arrow_forward" className={`${styles['subscription-action-center__next-icon']} ${hasUnapprovedRequests ? '' : styles['subscription-action-center__next-icon--active']}`} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
