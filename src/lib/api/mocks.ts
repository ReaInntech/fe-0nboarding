import { Notification, Subscription } from "./types";

export const FALLBACK_DASHBOARD_DATA: { notifications: Notification[], subscriptions: Subscription[] } = {
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
            name: "Consultoría en Innovación",
            tier: "Fase de Descubrimiento",
            icon: "lightbulb",
            status: "active",
            progressLabel: "Progreso de Fase",
            progressValue: "80% completado",
            progressPct: 80,
            price: "$2,500.00",
            pricePeriod: "/fase",
        },
        {
            id: "2",
            name: "Desarrollo a Medida",
            tier: "MVP E-commerce",
            icon: "code",
            status: "active",
            progressLabel: "Sprints Completados",
            progressValue: "Sprint 3 de 8",
            progressPct: 37,
            price: "$8,000.00",
            pricePeriod: "/proyecto",
        },
        {
            id: "3",
            name: "Squad as a Service",
            tier: "Equipo Célula Ágil",
            icon: "groups",
            status: "pause",
            progressLabel: "Horas Consumidas",
            progressValue: "120/160 hrs",
            progressPct: 75,
            price: "$5,200.00",
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
        }
    ]
};

export const FALLBACK_PROVIDER_FINANCE_DATA = {
    kpis: {
        totalRevenue: 124500,
        pendingPayout: 12400,
        activeClients: 42,
        successRate: 98.5,
        growth: 12
    },
    revenueData: [
        { month: 'Jan', revenue: 8500 },
        { month: 'Feb', revenue: 9200 },
        { month: 'Mar', revenue: 10500 },
        { month: 'Apr', revenue: 11200 },
    ],
    distributionData: [
        { name: 'Cloud Infra', value: 45, color: '#10b981' },
        { name: 'Security Suite', value: 30, color: '#3b82f6' },
        { name: 'Managed Services', value: 25, color: '#f59e0b' },
    ],
    transactions: [],
    productsFilterList: ['Cloud Infra', 'Security Suite', 'Managed Services'],
    clientsFilterList: ['Client A', 'Client B'],
    paymentMethodsList: ['Credit Card', 'Bank Transfer'],
};

export const FALLBACK_SUPPORT_DATA = {
    stats: [
        { label: "Active Tickets", value: "2", icon: "confirmation_number", color: "text-[#1978e5]" },
        { label: "Closed Tickets", value: "12", icon: "check_circle", color: "text-emerald-500" },
        { label: "Response Time", value: "< 2h", icon: "bolt", color: "text-amber-500" }
    ],
    ticketListProps: {
        tickets: [
            { id: "TIC-1234", subject: "Server latency issue", status: "open", priority: "high", date: "2026-04-12" },
            { id: "TIC-1235", subject: "Billing clarification", status: "closed", priority: "medium", date: "2026-04-10" }
        ],
        title: "Your Tickets"
    }
};

export const FALLBACK_PROVIDER_PRODUCT_DETAIL_DATA = {
    product: {
        name: "Cloud Infrastructure",
        productCode: "PROD-1029",
        icon: "cloud",
        iconColor: "text-blue-500",
        status: "active"
    },
    onboardingSteps: [
        { title: "Configuration", status: "completed", date: "2026-04-01" },
        { title: "Validation", status: "completed", date: "2026-04-03" },
        { title: "Deployment", status: "current" },
    ],
    requirements: [
        { label: "IP Whitelist", value: "192.168.1.1", status: "verified" },
        { label: "SSH Keys", value: "Uploaded", status: "verified" },
    ],
    requests: [
        { id: "REQ-1", title: "Scale Up Request", status: "pending", date: "2026-04-12" }
    ]
};

export const FALLBACK_PROVIDER_PRODUCTS_DATA = {
    products: [
        {
            name: "Cloud Infrastructure",
            productCode: "PROD-1029",
            icon: "cloud",
            iconColor: "text-blue-500",
            status: "active"
        },
        {
            name: "Security Suite",
            productCode: "PROD-1030",
            icon: "security",
            iconColor: "text-emerald-500",
            status: "pending"
        }
    ]
};
