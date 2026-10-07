import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface OnboardingStep {
    name: string;
    status: 'completed' | 'current' | 'pending';
}

export interface OnboardingProgressBlockProps {
    steps?: OnboardingStep[];
    className?: string;
}

export default function OnboardingProgressBlock({ steps, className }: OnboardingProgressBlockProps) {
    if (!steps || steps.length === 0) return null;

    const hasCompletedStep = steps.some(s => s.name.trim().toLowerCase() === 'completed');
    const allRealStepsCompleted = steps.every(s => s.status === 'completed');

    const displaySteps: OnboardingStep[] = hasCompletedStep
        ? steps
        : [
            ...steps,
            {
                name: 'Completed',
                status: allRealStepsCompleted ? 'completed' : 'pending',
            },
        ];

    const currentStepIndex = displaySteps.findIndex(s => s.status === 'current');
    const lastCompletedIndex = displaySteps.findLastIndex(s => s.status === 'completed');
    const allCompleted = displaySteps.every(s => s.status === 'completed');

    let lineProgressIndex = 0;
    if (allCompleted) {
        lineProgressIndex = displaySteps.length - 1;
    } else if (currentStepIndex !== -1) {
        lineProgressIndex = currentStepIndex;
    } else if (lastCompletedIndex !== -1) {
        lineProgressIndex = lastCompletedIndex;
    }

    // Protect against displaySteps.length being 1 to avoid division by zero
    const progressWidth = displaySteps.length > 1 ? `${(lineProgressIndex / (displaySteps.length - 1)) * 100}%` : '0%';

    const getIconForStep = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('regist')) return 'app_registration';
        if (n.includes('kyc') || n.includes('verif')) return 'verified_user';
        if (n.includes('contract') || n.includes('sign')) return 'history_edu';
        if (n.includes('provision')) return 'rocket_launch';
        if (n.includes('complet') || n.includes('final') || n.includes('done')) return 'task_alt';
        return 'radio_button_checked';
    };

    return (
        <div className={`${styles['onboarding-progress']} ${className || ''}`}>
            <h5 className={styles['onboarding-progress__title']}>Onboarding Progress</h5>

            <div className={styles['onboarding-progress__container']}>
                <div className={styles['onboarding-progress__line-bg']}></div>
                <div
                    className={styles['onboarding-progress__line-progress']}
                    style={{ width: `calc(${progressWidth} - 120px * ${lineProgressIndex / (displaySteps.length - 1 || 1)})` }}
                ></div>

                <div className={styles['onboarding-progress__steps-row']}>
                    {displaySteps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isCurrent = step.status === 'current';

                        const iconWrapperModifier = isCompleted || isCurrent ? 'active' : 'inactive';
                        const nameModifier = isCurrent ? 'current' : isCompleted ? 'completed' : 'pending';

                        return (
                            <div key={idx} className={styles['onboarding-progress__step']}>
                                <div className={styles['onboarding-progress__icon-container']}>
                                    <div
                                        className={`${styles['onboarding-progress__icon-wrapper']} ${styles[`onboarding-progress__icon-wrapper--${iconWrapperModifier}`]}`}
                                    >
                                        <Icon name={isCompleted ? 'check' : getIconForStep(step.name)} className={styles['onboarding-progress__icon']} />
                                    </div>
                                </div>
                                <span className={`${styles['onboarding-progress__step-name']} ${styles[`onboarding-progress__step-name--${nameModifier}`]}`}>
                                    {step.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
