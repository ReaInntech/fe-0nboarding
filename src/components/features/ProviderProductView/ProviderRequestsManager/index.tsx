'use client';

import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

export interface ClientRequest {
    id: string;
    subject: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | string;
    priority: 'high' | 'medium' | 'low' | string;
    date: string;
}

export interface ProviderRequestsManagerProps {
    requests: ClientRequest[];
}

const getStatusVariant = (status: string): 'success' | 'warning' | 'info' | 'error' | 'neutral' => {
    switch (status) {
        case 'pending': return 'warning';
        case 'in_review': return 'info';
        case 'approved': return 'success';
        case 'rejected': return 'error';
        default: return 'neutral';
    }
};

const getPriorityClass = (priority: string) => {
    switch (priority) {
        case 'high': return styles['requests-manager__priority--high'];
        case 'medium': return styles['requests-manager__priority--medium'];
        case 'low': return styles['requests-manager__priority--low'];
        default: return '';
    }
};

export default function ProviderRequestsManager({
    requests,
}: ProviderRequestsManagerProps) {
    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['requests-manager__header']}>
                <h3 className={styles['requests-manager__title']}>
                    <Icon name="notifications_active" className="text-[#1978e5]" /> Client Requests
                </h3>
                <Badge variant="warning">{requests.filter(r => r.status === 'pending').length} Pending</Badge>
            </div>

            <div className={styles['requests-manager__table-container']}>
                <table className={styles['requests-manager__table']}>
                    <thead>
                        <tr>
                            <th className={styles['requests-manager__th']}>Request</th>
                            <th className={styles['requests-manager__th']}>Date</th>
                            <th className={styles['requests-manager__th']}>Status</th>
                            <th className={`${styles['requests-manager__th']} ${styles['requests-manager__th--right']}`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((req) => (
                            <tr key={req.id} className={styles['requests-manager__tr']}>
                                <td className={styles['requests-manager__td']}>
                                    <div className={styles['requests-manager__request-info']}>
                                        <span className={styles['requests-manager__subject']}>{req.subject}</span>
                                        <div className={styles['requests-manager__meta']}>
                                            <span className={styles['requests-manager__id']}>{req.id}</span>
                                            <span className={styles['requests-manager__separator']}>•</span>
                                            <span className={`${styles['requests-manager__priority']} ${getPriorityClass(req.priority)}`}>
                                                {req.priority} priority
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className={`${styles['requests-manager__td']} ${styles['requests-manager__td--date']}`}>
                                    {req.date}
                                </td>
                                <td className={styles['requests-manager__td']}>
                                    <Badge variant={getStatusVariant(req.status)} size="sm">
                                        {req.status.replace('_', ' ')}
                                    </Badge>
                                </td>
                                <td className={`${styles['requests-manager__td']} ${styles['requests-manager__td--right']}`}>
                                    <Button variant="ghost" className={styles['requests-manager__review-btn']}>
                                        Review
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {requests.length === 0 && (
                <div className={styles['requests-manager__empty']}>
                    No requests found for this product instance.
                </div>
            )}
        </Card>
    );
}
