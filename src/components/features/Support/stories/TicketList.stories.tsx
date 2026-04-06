import React from 'react';
import TicketList from '../TicketList';

export default {
    title: 'Client/Components/Organisms/Support/TicketList',
    component: TicketList,
};

const defaultTickets = [
    {
        id: 'TK-2024-001',
        subject: 'Cloud instance not responding after scaling',
        status: 'open',
        priority: 'high',
        date: 'Mar 05, 2026',
        assignee: 'Support Team',
        category: 'Infrastructure',
        messages: [
            { sender: 'You', time: 'Mar 05, 10:32 AM', text: 'Our cloud instance stopped responding after we attempted to scale from 4 to 8 vCPUs. The dashboard shows the instance as running but we cannot SSH into it.' },
            { sender: 'Carlos M. — Support', time: 'Mar 05, 10:45 AM', text: 'Thank you for reporting this. I can see the instance is in a degraded state. I\'m escalating this to our infrastructure team. In the meantime, could you confirm if this affects all regions or just the primary?' },
            { sender: 'You', time: 'Mar 05, 10:52 AM', text: 'It seems to only affect the us-east-1 region. The eu-west instances are fine.' },
            { sender: 'Carlos M. — Support', time: 'Mar 05, 11:15 AM', text: 'We\'ve identified a networking issue in us-east-1. Our team is working on a fix. ETA: ~30 minutes. We\'ll keep you updated.' },
        ],
    },
    {
        id: 'TK-2024-002',
        subject: 'Request for additional storage allocation',
        status: 'in-progress',
        priority: 'medium',
        date: 'Mar 03, 2026',
        assignee: 'Maria G.',
        category: 'Storage',
        messages: [
            { sender: 'You', time: 'Mar 03, 2:10 PM', text: 'We need to increase our NVMe storage from 2TB to 5TB for the production database. Can this be done without downtime?' },
            { sender: 'Maria G. — Support', time: 'Mar 03, 3:00 PM', text: 'Yes, we can expand the storage live. I\'ll prepare the change request and send you a confirmation with the pricing adjustment. Expect it within 24 hours.' },
        ],
    },
    {
        id: 'TK-2024-003',
        subject: 'Billing discrepancy on February invoice',
        status: 'resolved',
        priority: 'low',
        date: 'Feb 28, 2026',
        assignee: 'Ana R.',
        category: 'Billing',
        messages: [
            { sender: 'You', time: 'Feb 28, 9:00 AM', text: 'The February invoice shows a charge of $2,400 for an add-on we never activated. Please review.' },
            { sender: 'Ana R. — Support', time: 'Feb 28, 11:30 AM', text: 'You\'re right — that charge was applied in error. I\'ve issued a credit note for $2,400 which will appear on your next statement. Apologies for the inconvenience.' },
            { sender: 'You', time: 'Feb 28, 11:45 AM', text: 'Thank you for the quick resolution!' },
        ],
    },
    {
        id: 'TK-2024-005',
        subject: 'API rate limiting causing service interruptions',
        status: 'open',
        priority: 'high',
        date: 'Mar 04, 2026',
        assignee: 'Support Team',
        category: 'API',
        messages: [
            { sender: 'You', time: 'Mar 04, 8:00 AM', text: 'We\'re hitting the API rate limit during peak hours (9-11 AM EST), which causes 429 errors for our end users. Can we increase the limit from 1000 to 5000 req/min?' },
            { sender: 'Luis P. — Support', time: 'Mar 04, 9:30 AM', text: 'I can see the spikes in your usage. Given your Platinum tier, you\'re eligible for up to 10,000 req/min. I\'ll submit the configuration change — it should take effect within the hour.' },
        ],
    },
];

export const Default = {
    args: {
        title: 'Support Tickets',
        tickets: defaultTickets,
        showNewTicketButton: true,
        showFilters: true
    },
};
