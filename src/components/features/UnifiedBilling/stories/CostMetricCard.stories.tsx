import React from 'react';
import CostMetricCard from '../CostMetricCard';

export default {
    title: 'Client/Components/Organisms/UnifiedBilling/CostMetricCard',
    component: CostMetricCard,
};

export const Default = {
    args: {
        label: 'Average Monthly Recurring Cost',
        value: '$428.50',
        trend: { value: '2.4%', icon: 'trending_up', variant: 'success' },
        progress: 68,
        progressLabel: '68% of Budget Used'
    },
};

export const WarningTrend = {
    args: {
        label: 'Current Month Cost',
        value: '$1,200.00',
        trend: { value: '15%', icon: 'trending_up', variant: 'danger' },
        progress: 95,
        progressLabel: '95% of Budget Used'
    },
};
