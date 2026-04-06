import React from 'react';
import Button from '../../../shared/atoms/Button';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface QuickActionsProps {
    className?: string;
}

export default function QuickActions({ className }: QuickActionsProps) {
    return (
        <div className={`${styles['quick-actions']} ${className || ''}`}>
            <Button variant="primary" className="px-6 py-3 font-bold">
                <Icon name="add_card" className={styles['quick-actions__btn-icon']} /> Add Payment Method
            </Button>
            <Button variant="outline" className="px-6 py-3 font-bold bg-white dark:bg-transparent">
                Update Billing Address
            </Button>
        </div>
    );
}
