import React from 'react';
import SupportCenter from '../SupportCenter';

export default {
    title: 'Features/SupportCenter',
    component: SupportCenter,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
        },
    },
};

export const FullPage = {
    render: () => (
        <SupportCenter
            headerProps={{
                title: 'Enterprise Cloud Suite',
                productId: 'PROD-992834-QX',
                icon: 'cloud_done',
                iconColor: '#1978e5',
                badgeText: 'Active',
                badgeVariant: 'success',
                clientName: 'Acme Corp Ltd.',
                clientId: 'CLI-998877',
                meta: [],
                actions: []
            }}
            stats={{
                open: 2,
                inProgress: 1,
                resolved: 12,
                avgResponse: '45m'
            }}
            ticketListProps={{
                title: 'Support Tickets',
                tickets: [
                    {
                        id: 'TK-2024-001',
                        subject: 'Cloud instance not responding',
                        status: 'open',
                        priority: 'high',
                        date: 'Mar 05, 2026',
                        assignee: 'Support Team',
                        category: 'Infrastructure',
                        messages: []
                    }
                ],
                showNewTicketButton: true,
                showFilters: true
            }}
        />
    ),
};

export const VehicleRepairSupport = {
    render: () => (
        <SupportCenter
            headerProps={{
                icon: 'build',
                iconColor: '#f59e0b',
                title: 'Vehicle Repair Service',
                badgeText: 'In Progress',
                badgeVariant: 'warning',
                productId: 'SRV-100472-MX',
                meta: [
                    { icon: 'calendar_today', text: 'Requested Feb 28, 2026' },
                    { icon: 'location_on', text: 'AutoFix Workshop — Downtown' },
                ],
                actions: [],
            }}
            stats={{
                open: 1,
                inProgress: 0,
                resolved: 3,
                avgResponse: '< 2 hrs',
            }}
            ticketListProps={{
                title: 'Repair Tickets',
                tickets: [
                    {
                        id: 'TK-SRV-001',
                        subject: 'Engine diagnostic report not received',
                        status: 'open',
                        priority: 'high',
                        date: 'Mar 04, 2026',
                        assignee: 'Workshop Support',
                        category: 'Diagnostics',
                        messages: [
                            { sender: 'You', time: 'Mar 04, 3:00 PM', text: 'I was told the engine diagnostic report would be sent within 24 hours but I still haven\'t received it.' },
                            { sender: 'Workshop Support', time: 'Mar 04, 4:15 PM', text: 'Apologies for the delay. The technician is finalizing the report. You\'ll receive it by email within the next 2 hours.' },
                        ],
                    },
                    {
                        id: 'TK-SRV-002',
                        subject: 'Request for replacement part ETA',
                        status: 'resolved',
                        priority: 'medium',
                        date: 'Mar 01, 2026',
                        assignee: 'Parts Dept.',
                        category: 'Parts',
                        messages: [
                            { sender: 'You', time: 'Mar 01, 10:00 AM', text: 'When will the transmission part arrive? I need an ETA for planning purposes.' },
                            { sender: 'Parts Dept.', time: 'Mar 01, 11:30 AM', text: 'The part has been shipped and will arrive on March 3rd. We\'ll begin installation the same day.' },
                            { sender: 'You', time: 'Mar 01, 11:45 AM', text: 'Perfect, thank you for the update.' },
                        ],
                    },
                ],
            }}
        />
    ),
};
