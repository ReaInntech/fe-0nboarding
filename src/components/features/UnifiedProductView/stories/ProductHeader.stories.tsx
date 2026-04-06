import React from 'react';
import ProductHeader from '../ProductHeader';

export default {
    title: 'Client/Components/Organisms/UnifiedProductView/ProductHeader',
    component: ProductHeader,
};

export const Default = {
    args: {
        icon: 'cloud_done',
        iconColor: '#1978e5',
        title: 'Enterprise Cloud Suite',
        badgeText: 'Active',
        badgeVariant: 'success',
        productId: 'PROD-992834-QX',
        meta: [
            { icon: 'calendar_today', text: 'Subscribed Oct 2023' },
            { icon: 'update', text: 'Renews Oct 2024' },
        ],
        actions: [
            { type: 'button', label: 'Support', icon: 'help_outline', variant: 'outline' },
            {
                type: 'dropdown', label: 'Actions', icon: 'settings', variant: 'primary',
                options: [
                    { label: 'Edit Configuration', icon: 'edit' },
                    { label: 'View Invoices', icon: 'receipt' },
                    { label: 'Cancel Subscription', icon: 'cancel', className: 'text-red-500' }
                ]
            }
        ]
    },
};
