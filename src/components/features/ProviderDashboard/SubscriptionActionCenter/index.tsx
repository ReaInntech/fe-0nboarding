import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '../../../shared/atoms/Icon';
import RequestItem, { Request } from '../RequestItem';
import OnboardingProgressBlock, { OnboardingStep } from '../OnboardingProgressBlock';
import { useApp } from '@/src/context/AppContext';
import { auth } from '@/src/lib/firebase/config';
import { advanceProviderSubscriptionStep } from '@/src/lib/api/provider';
import styles from './index.module.scss';

export interface SubscriptionActionCenterProps {
    subscriptionId?: string;
    steps?: OnboardingStep[];
    requests?: Request[];
    className?: string;
    onStepAdvanced?: (updatedSub?: any) => void;
}

export default function SubscriptionActionCenter({
    subscriptionId,
    steps,
    requests,
    className,
    onStepAdvanced,
}: SubscriptionActionCenterProps) {
    const router = useRouter();
    const { user } = useApp();
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [advanceSuccessMsg, setAdvanceSuccessMsg] = useState<string | null>(null);

    const hasSteps = Boolean(steps && steps.length > 0);
    const hasRequests = Boolean(requests && requests.length > 0);

    if (!hasSteps && !hasRequests) return null;

    const hasUnapprovedRequests = requests && requests.some(req => req.status !== 'approved');
    const allStepsCompleted = steps && steps.length > 0 && steps.every(s => s.status === 'completed');

    const handleAdvanceStep = async () => {
        if (!subscriptionId || hasUnapprovedRequests || isAdvancing || allStepsCompleted) return;

        setIsAdvancing(true);
        setAdvanceSuccessMsg(null);
        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            const orgId = user?.org_id || user?.organization?.id;
            const res = await advanceProviderSubscriptionStep(subscriptionId, freshToken, orgId);

            setAdvanceSuccessMsg(res.message || 'Step advanced successfully.');
            onStepAdvanced?.(res.subscription);
            router.refresh();
        } catch (error: any) {
            console.error('Failed to advance step:', error);
            alert(`Failed to advance step: ${error.message || 'Unknown error'}`);
        } finally {
            setIsAdvancing(false);
        }
    };

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
                        {allStepsCompleted ? (
                            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-950/40 border border-emerald-800/40 px-4 py-2 rounded-lg">
                                <Icon name="check_circle" className="text-emerald-400 text-base" />
                                <span>All onboarding steps completed</span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {advanceSuccessMsg && (
                                    <span className="text-xs text-emerald-400 font-medium">
                                        {advanceSuccessMsg}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    disabled={hasUnapprovedRequests || isAdvancing}
                                    onClick={handleAdvanceStep}
                                    className={`group ${styles['subscription-action-center__next-btn']} ${hasUnapprovedRequests || isAdvancing ? styles['subscription-action-center__next-btn--disabled'] : styles['subscription-action-center__next-btn--active']}`}
                                >
                                    <span>{isAdvancing ? 'Advancing...' : 'Advance to Next Step'}</span>
                                    <Icon
                                        name={isAdvancing ? 'sync' : 'arrow_forward'}
                                        className={`${styles['subscription-action-center__next-icon']} ${hasUnapprovedRequests || isAdvancing ? '' : styles['subscription-action-center__next-icon--active']} ${isAdvancing ? 'animate-spin' : ''}`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
