// Service to fetch data from the external REST API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.mock.saslution.tech';

export async function getDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            next: { revalidate: 60 } // Revalidate every 60 seconds
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Dashboard fetch failed, using fallback data:', error);
        return null;
    }
}

export async function getBillingData() {
    try {
        const response = await fetch(`${API_BASE_URL}/billing`, {
            next: { revalidate: 300 }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch billing data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Billing fetch failed, using fallback data:', error);
        return null;
    }
}

export async function getSupportData() {
    try {
        const response = await fetch(`${API_BASE_URL}/support`, {
            next: { revalidate: 3600 } // Revalidate every hour
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch support data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Support fetch failed, using fallback data:', error);
        return null;
    }
}

export async function getProviderDashboardData() {
    try {
        const response = await fetch(`${API_BASE_URL}/provider/dashboard`, {
            next: { revalidate: 60 }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch provider dashboard data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Provider Dashboard fetch failed, using fallback data:', error);
        return null;
    }
}

export async function getProviderProductsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/provider/products`, {
            next: { revalidate: 300 }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch provider products data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Provider Products fetch failed, using fallback data:', error);
        return null;
    }
}

export async function getProviderProductDetailData(id: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/provider/products/${id}`, {
            next: { revalidate: 60 }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch provider product detail data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn(`[API] Provider Product Detail (${id}) fetch failed, using fallback data:`, error);
        return null;
    }
}

export async function getProviderFinanceData() {
    try {
        const response = await fetch(`${API_BASE_URL}/provider/finance`, {
            next: { revalidate: 3600 }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch provider finance data');
        }
        
        return await response.json();
    } catch (error) {
        console.warn('[API] Provider Finance fetch failed, using fallback data:', error);
        return null;
    }
}

// Fallback data for development/mocking
export const FALLBACK_DASHBOARD_DATA = {
    notifications: [
        {
            title: "Critical Alert",
            time: "2 mins ago",
            message: "Service disruption detected in US-East-1. Our engineers are investigating the issue.",
            variant: "critical",
        },
        {
            title: "Billing Warning",
            time: "4 hours ago",
            message: "Your 'Cloud Infrastructure' subscription payment is overdue. Please update payment method.",
            variant: "warning",
        },
        {
            title: "System Update",
            time: "1 day ago",
            message: "Advanced API Analytics is now live. Access detailed usage reports in the Products tab.",
            variant: "info",
        },
    ],
    subscriptions: [
        {
            id: "1",
            name: "Cloud Infrastructure",
            tier: "Pro Enterprise Tier",
            icon: "cloud",
            badgeText: "Auto-renews",
            badgeVariant: "success",
            progressLabel: "Billing Cycle Progress",
            progressValue: "24 days left",
            progressPct: 65,
            price: "$129.00",
            pricePeriod: "/mo",
        },
        {
            id: "2",
            name: "Security Suite",
            tier: "Advanced Protection",
            icon: "security",
            badgeText: "One-time",
            badgeVariant: "default",
            progressLabel: "License Validity",
            progressValue: "Expired in 182 days",
            progressPct: 45,
            price: "$499.00",
            pricePeriod: "/yr",
        },
        {
            id: "3",
            name: "Storage Bucket",
            tier: "5TB Managed Storage",
            icon: "database",
            badgeText: "Auto-renews",
            badgeVariant: "success",
            progressLabel: "Usage Limit Progress",
            progressValue: "1.2TB remaining",
            progressPct: 78,
            price: "$89.00",
            pricePeriod: "/mo",
        },
    ]
};

export const FALLBACK_BILLING_DATA = {
    transactions: [
        {
            id: 'TX1001',
            date: '2026-04-01',
            description: 'Cloud Infrastructure Subscription - April',
            amount: 129.00,
            status: 'completed',
            type: 'subscription'
        },
        {
            id: 'TX1002',
            date: '2026-03-28',
            description: 'Security Suite Annual Renewal',
            amount: 499.00,
            status: 'completed',
            type: 'one-time'
        },
        {
            id: 'TX1003',
            date: '2026-03-15',
            description: 'Storage Bucket - Overages',
            amount: 12.50,
            status: 'completed',
            type: 'usage'
        }
    ],
    methods: [
        {
            id: 'M1',
            type: 'visa',
            last4: '4242',
            expiry: '12/28',
            isDefault: true,
            brand: 'Visa'
        },
        {
            id: 'M2',
            type: 'mastercard',
            last4: '8888',
            expiry: '10/26',
            isDefault: false,
            brand: 'Mastercard'
        }
    ]
};

export const FALLBACK_PROVIDER_DASHBOARD_DATA = {
    subscriptions: [
        {
            id: 'S-7001',
            client: 'Real Inovation Tech',
            product: 'Cloud Infrastructure',
            status: 'active',
            monthlyPrice: 1290,
            documents: [{ name: 'SLA', status: 'signed' }],
            payments: [{ status: 'Paid', date: '2026-04-01' }]
        },
        {
            id: 'S-7002',
            client: 'Global Logistics Corp',
            product: 'Security Suite',
            status: 'active',
            monthlyPrice: 499,
            documents: [{ name: 'Service Agreement', status: 'pending' }],
            payments: [{ status: 'Paid', date: '2026-03-15' }]
        },
        {
            id: 'S-7003',
            client: 'Alpha Soft Solutions',
            product: 'Managed Storage',
            status: 'warning',
            monthlyPrice: 89,
            documents: [{ name: 'Policy', status: 'signed' }],
            payments: [{ status: 'Failed', date: '2026-04-05' }]
        }
    ]
};

export const FALLBACK_SUPPORT_DATA = {
    stats: {
        open: 3,
        inProgress: 1,
        resolved: 12,
        avgResponse: "2.4h"
    },
    ticketListProps: {
        tickets: [
            {
                id: 'TKT-1025',
                subject: 'Need help with API documentation',
                status: 'open',
                priority: 'medium',
                updatedAt: '2026-04-05T10:00:00Z',
                category: 'Technical'
            },
            {
                id: 'TKT-1020',
                subject: 'Incorrect billing amount in March',
                status: 'in_progress',
                priority: 'high',
                updatedAt: '2026-04-04T15:30:00Z',
                category: 'Billing'
            },
            {
                id: 'TKT-1015',
                subject: 'Feature request: Webhooks',
                status: 'resolved',
                priority: 'low',
                updatedAt: '2026-03-25T09:15:00Z',
                category: 'Feature'
            }
        ]
    }
};

export const FALLBACK_PROVIDER_PRODUCTS_DATA = {
    products: [
        {
            id: 'P-1',
            name: "Cloud Infrastructure",
            category: "Computing",
            productCode: "COMP-CLOUD-X1",
            icon: "cloud",
            iconColor: "#1978e5",
            status: "active",
            requests: 2,
            requirements: 5
        },
        {
            id: 'P-2',
            name: "Security Suite",
            category: "Cybersecurity",
            productCode: "SEC-ADV-2026",
            icon: "security",
            iconColor: "#10b981",
            status: "active",
            requests: 0,
            requirements: 3
        },
        {
            id: 'P-3',
            name: "Managed Storage",
            category: "Storage",
            productCode: "STOR-5TB-MANAGED",
            icon: "database",
            iconColor: "#f59e0b",
            status: "pending",
            requests: 1,
            requirements: 8
        }
    ]
};

export const FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA = {
    product: {
        name: "Cloud Infrastructure",
        productCode: "COMP-CLOUD-X1",
        icon: "cloud",
        iconColor: "#1978e5",
        status: "active"
    },
    onboardingSteps: [
        { id: '1', title: 'Provisioning', status: 'completed' },
        { id: '2', title: 'Network Config', status: 'in-progress' },
        { id: '3', title: 'Security Audit', status: 'pending' }
    ],
    requirements: [
        { id: 'r1', label: 'API Key', type: 'text', value: 'sk_test_...', status: 'verified' },
        { id: 'r2', label: 'Webhook URL', type: 'url', value: '', status: 'missing' }
    ],
    requests: [
        { id: 'req1', title: 'Increase CPU Limit', status: 'pending', date: '2026-04-06' }
    ]
};

export const FALLBACK_PROVIDER_FINANCE_DATA = {
    kpis: {
        totalRevenue: 124500,
        pendingPayout: 12450,
        activeClients: 42,
        successRate: 98.5,
        growth: 12.4
    },
    revenueData: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 9200 },
        { month: 'Mar', revenue: 10500 },
        { month: 'Apr', revenue: 12400 }
    ],
    distributionData: [
        { name: 'Cloud Infrastructure', value: 45, color: '#1978e5' },
        { name: 'Security Suite', value: 30, color: '#10b981' },
        { name: 'Managed Storage', value: 25, color: '#f59e0b' }
    ],
    transactions: [
        { id: 'T-1001', date: '2026-04-01', client: 'Real Inovation Tech', product: 'Cloud Infrastructure', amount: 1290, status: 'completed', method: 'Visa' },
        { id: 'T-1002', date: '2026-04-02', client: 'Global Logistics Corp', product: 'Security Suite', amount: 499, status: 'completed', method: 'Mastercard' }
    ],
    productsFilterList: ['Cloud Infrastructure', 'Security Suite', 'Managed Storage'],
    clientsFilterList: ['Real Inovation Tech', 'Global Logistics Corp', 'Alpha Soft Solutions'],
    paymentMethodsList: ['Visa', 'Mastercard', 'Bank Transfer']
};
