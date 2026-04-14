import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import { Subscription } from '@/src/lib/api/types';
import styles from './index.module.scss';


export interface ServicesListProps {
    subscriptions: Subscription[];
    className?: string;
}

export default function ServicesList({ subscriptions, className }: ServicesListProps) {
    return (
        <section className={`${styles['services-list']} ${className || ''}`}>
            <div className={styles['services-list__header']}>
                <div>
                    <h2 className={styles['services-list__header-title']}>My Services</h2>
                    <p className={styles['services-list__header-desc']}>Manage your active subscriptions and services.</p>
                </div>
                {subscriptions.length > 0 && (
                    <Badge variant="default" className={styles['services-list__header-badge']}>
                        {subscriptions.length} Total
                    </Badge>
                )}
            </div>

            {subscriptions.length === 0 ? (
                <div className={styles['services-list__empty-state']}>
                    <div className={styles['services-list__empty-icon-wrapper']}>
                        <Icon name="inventory_2" className={styles['services-list__empty-icon']} />
                    </div>
                    <h3 className={styles['services-list__empty-title']}>No active subscriptions</h3>
                    <p className={styles['services-list__empty-text']}>
                        You don't have any active subscriptions yet. Explore our services to start empowering your business.
                    </p>
                    <a href="/marketplace" className={styles['services-list__empty-button']}>
                        Explore Services <Icon name="arrow_forward" className="ml-2 text-xl" />
                    </a>
                </div>
            ) : (
                <div className={styles['services-list__grid']}>
                    {subscriptions.map((sub, idx) => (
                        <div key={idx} className={`group ${styles['services-list__card']} ${sub.hasActionRequest ? styles['services-list__card--action-request'] : styles['services-list__card--normal']}`}>
                            <div className={styles['services-list__card-header']}>
                                <div className={styles['services-list__card-header-info']}>
                                    <div className={`${styles['services-list__card-icon-wrapper']} ${sub.hasActionRequest ? styles['services-list__card-icon-wrapper--action-request'] : styles['services-list__card-icon-wrapper--normal']}`}>
                                        <Icon name={sub.icon} className={`${styles['services-list__card-icon']} ${sub.hasActionRequest ? styles['services-list__card-icon--action-request'] : styles['services-list__card-icon--normal']}`} />
                                    </div>
                                    <div>
                                        <h3 className={styles['services-list__card-title']}>{sub.name}</h3>
                                        <p className={styles['services-list__card-tier']}>{sub.tier}</p>
                                    </div>
                                </div>
                                <Badge
                                    variant={sub.status === 'active' ? 'success' : sub.status === 'pause' ? 'warning' : 'default'}
                                    className={styles['services-list__card-badge']}
                                    title={`Status: ${sub.status}`}
                                >
                                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                                </Badge>
                            </div>

                            <div className={`${styles['services-list__progress-block']} ${sub.hasActionRequest ? styles['services-list__progress-block--action-request'] : styles['services-list__progress-block--normal']}`}>
                                <div className={styles['services-list__progress-wrapper']}>
                                    <div className={styles['services-list__progress-header']}>
                                        <span className={`${styles['services-list__progress-label']} ${sub.hasActionRequest ? styles['services-list__progress-label--action-request'] : styles['services-list__progress-label--normal']}`}>
                                            {'Current Phase'}
                                            {(sub.currentStep && sub.totalSteps) && (
                                                <span className={styles['services-list__progress-steps']}>
                                                    {sub.currentStep}/{sub.totalSteps}
                                                </span>
                                            )}
                                        </span>
                                        {sub.hasActionRequest && (
                                            <span className={styles['services-list__action-required']}>
                                                <Icon name="priority_high" className={styles['services-list__action-required-icon']} />
                                                Action Required
                                            </span>
                                        )}
                                    </div>
                                    <span className={styles['services-list__progress-value']}>
                                        <Icon name={sub.hasActionRequest ? "error_outline" : "play_arrow"} className={`${styles['services-list__progress-value-icon']} ${sub.hasActionRequest ? styles['services-list__progress-value-icon--action-request'] : styles['services-list__progress-value-icon--normal']}`} />
                                        {sub.progressValue}
                                    </span>
                                </div>
                            </div>

                            <div className={styles['services-list__card-footer']}>
                                <div className={styles['services-list__cost-wrapper']}>
                                    <span className={styles['services-list__cost-label']}>Monthly cost</span>
                                    <span className={styles['services-list__cost-value']}>
                                        {sub.price}<span className={styles['services-list__cost-period']}>{sub.pricePeriod}</span>
                                    </span>
                                </div>
                                <a href={`/dashboard/${sub.id}`} className={styles['services-list__manage-btn']}>
                                    Manage <Icon name="chevron_right" className={styles['services-list__manage-icon']} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
