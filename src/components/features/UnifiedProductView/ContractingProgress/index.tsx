import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Card from '../../../shared/atoms/Card';
import styles from './index.module.scss';

export interface ContractingStep {
    label: string;
    status: 'completed' | 'active' | 'pending';
    icon: string;
}

export interface ContractingProgressProps {
    currentPhase: string;
    steps: ContractingStep[];
    className?: string;
}

export default function ContractingProgress({
    currentPhase,
    steps = [],
    className = ''
}: ContractingProgressProps) {
    if (!steps || steps.length === 0) return null;

    const hasCompletedStep = steps.some(s => s.label.trim().toLowerCase() === 'completed');
    const allRealStepsCompleted = steps.every(s => s.status === 'completed');

    const displaySteps: ContractingStep[] = hasCompletedStep
        ? steps
        : [
            ...steps,
            {
                label: 'Completed',
                status: allRealStepsCompleted ? 'completed' : 'pending',
                icon: 'task_alt',
            },
        ];

    const activeIndex = displaySteps.findIndex((s) => s.status === 'active');
    const lastCompletedIndex = displaySteps.findLastIndex((s) => s.status === 'completed');
    const allCompleted = displaySteps.length > 0 && displaySteps.every((s) => s.status === 'completed');

    let lineProgressIndex = 0;
    if (allCompleted) {
        lineProgressIndex = displaySteps.length - 1;
    } else if (activeIndex !== -1) {
        lineProgressIndex = activeIndex;
    } else if (lastCompletedIndex !== -1) {
        lineProgressIndex = lastCompletedIndex;
    }

    const progressWidth = displaySteps.length > 1
        ? `${(lineProgressIndex / (displaySteps.length - 1)) * 100}%`
        : allCompleted ? '100%' : '0%';

    return (
        <section className={`${styles['contracting-progress']} ${className}`}>
            <Card className={styles['contracting-progress__card']}>
                <div className={styles['contracting-progress__header']}>
                    <h3 className={styles['contracting-progress__title']}>
                        <Icon name="analytics" className={styles['contracting-progress__icon']} />
                        Contracting Progress
                    </h3>
                    <Badge variant={allCompleted ? 'success' : 'primary'}>
                        Current Phase: {allCompleted ? 'Completed' : currentPhase}
                    </Badge>
                </div>
                <div className={styles['contracting-progress__steps-container']}>
                    <div className={styles['contracting-progress__line-bg']}></div>
                    <div 
                        className={styles['contracting-progress__line-progress']} 
                        style={{ width: progressWidth }}
                    ></div>
                    {displaySteps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isActive = step.status === 'active';
                        
                        const circleClass = `${styles['contracting-progress__step-circle']} ${
                            isCompleted || isActive ? styles['contracting-progress__step-circle--completed'] : styles['contracting-progress__step-circle--pending']
                        }`;

                        const labelClass = `${styles['contracting-progress__step-label']} ${
                            isActive ? styles['contracting-progress__step-label--active'] : 
                            isCompleted ? styles['contracting-progress__step-label--completed'] : 
                            styles['contracting-progress__step-label--pending']
                        }`;

                        return (
                            <div key={idx} className={styles['contracting-progress__step']}>
                                <div className={circleClass}>
                                    <Icon name={isCompleted ? 'check' : step.icon} className={styles['contracting-progress__step-icon']} />
                                </div>
                                <span className={labelClass}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </section>
    );
}
