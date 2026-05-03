import { Notification, Subscription, OnboardingStep, ClientRequest, RequirementField } from "./types";

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
            status: 'Paid',
            type: 'subscription'
        },
        {
            id: 'TX1002',
            date: '2026-03-28',
            description: 'Security Suite Annual Renewal',
            amount: 499.00,
            status: 'Paid',
            type: 'one-time'
        }
    ],
    methods: [
        {
            id: 'M1',
            type: 'visa',
            typeLabel: 'Credit Card',
            name: 'Main Payment Method',
            lastFour: '4242',
            holder: 'John Doe',
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
            name: 'Cloud Infrastructure',
            tier: 'Enterprise Plan',
            icon: 'cloud',
            status: 'active',
            progressLabel: 'Provisionamiento',
            progressPct: 100,
            price: '$1,290.00',
            pricePeriod: '/mo',
            client: {
                id: 'C-001',
                legalName: 'Real Inovation Tech',
                clientType: 'legal_entity',
                email: 'contact@realinnovation.tech',
                phone: '+1 555-0123'
            },
            monthlyPrice: 1290,
            documents: [{ name: 'SLA', status: 'signed' }],
            payments: [{ id: 'P1', status: 'Paid', date: '2026-04-01', amount: 1290 }]
        }
    ],
    stats: {
        active_subscriptions: 42,
        pending_signatures: 3,
        failed_payments: 1,
        monthly_mrr: 18500
    }
};

export const FALLBACK_PROVIDER_FINANCE_DATA = {
    kpis: {
        totalRevenue: 124500,
        pendingPayout: 12400,
        activeClients: 42,
        successRate: 98.5,
        growth: 12
    },
    revenueHistory: [
        { month: 'Jan', revenue: 8500, label: 'Jan', value: 8500 },
        { month: 'Feb', revenue: 9200, label: 'Feb', value: 9200 },
        { month: 'Mar', revenue: 10500, label: 'Mar', value: 10500 },
        { month: 'Apr', revenue: 11200, label: 'Apr', value: 11200 },
    ],
    distributionData: [
        { name: 'Cloud Infra', value: 45, color: '#10b981', label: 'Cloud Infra' },
        { name: 'Security Suite', value: 30, color: '#3b82f6', label: 'Security Suite' },
        { name: 'Managed Services', value: 25, color: '#f59e0b', label: 'Managed Services' },
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
        { 
            id: "step-1",
            name: "Initial Configuration", 
            description: "Setup basic network and access parameters.",
            icon: "settings",
            type: "auto",
            requests: []
        },
        { 
            id: "step-2",
            name: "Security Validation", 
            description: "Verify compliance and encryption requirements.",
            icon: "security",
            type: "review",
            requests: [
                { id: "req-1", title: "Compliance Document", type: "document" }
            ]
        },
    ] as OnboardingStep[],
    requirements: [
        { id: "reqf-1", label: "IP Whitelist", value: "192.168.1.1", required: true },
        { id: "reqf-2", label: "SSH Keys", value: "Uploaded", required: true },
        { id: "reqf-3", label: "Backup Policy", value: "Daily", required: false },
    ] as RequirementField[],
    requests: [
        { id: "CL-REQ-001", subject: "Scale Up Request", status: "pending", priority: "high", date: "2026-04-12" },
        { id: "CL-REQ-002", subject: "New Firewall Rule", status: "approved", priority: "medium", date: "2026-04-10" }
    ] as ClientRequest[]
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

export const FALLBACK_SUBSCRIPTION_DETAIL_DATA = {
    headerProps: {
        icon: 'lightbulb',
        iconColor: '#7ED957',
        title: 'Consultoría en Innovación',
        badgeText: 'En Diagnóstico',
        badgeVariant: 'info',
        productId: 'RI-CONS-2024-001',
        meta: [
            { icon: 'calendar_today', text: 'Iniciado Mar 15, 2026' },
            { icon: 'business', text: 'Real Innovation Tech' },
            { icon: 'location_on', text: 'Remoto / Híbrido' },
        ],
        actions: [
            { label: 'Agendar Sesión', icon: 'event', variant: 'primary' },
            { label: 'Contactar Consultor', icon: 'chat', variant: 'secondary' }
        ],
    },
    showContractingProgress: true,
    contractingProgressProps: {
        currentPhase: 'Diagnóstico',
        steps: [
            { label: 'Discovery', status: 'completed', icon: 'search' },
            { label: 'Diagnóstico', status: 'active', icon: 'monitor_heart' },
            { label: 'Prototipado', status: 'pending', icon: 'design_services' },
            { label: 'Desarrollo', status: 'pending', icon: 'developer_mode' },
            { label: 'Impacto', status: 'pending', icon: 'trending_up' },
        ]
    },
    serviceDetailsProps: {
        title: 'Detalles de la Consultoría',
        titleIcon: 'psychology',
        titleIconColor: '#7ED957',
        totalAmount: 10000000,
        paidAmount: 4300000,
        fields: [
            { icon: 'info', label: 'Tipo de Servicio', value: 'Consultoría en Innovación' },
            { icon: 'groups', label: 'Consultor', value: 'Daniel Bernal' },
            { icon: 'speed', label: 'Enfoque', value: 'Optimización de Procesos y Automatización' },
            { icon: 'account_balance_wallet', label: 'Pago mensual', value: '$1.000.000' },
        ],
    },
    supportAccessProps: {
        title: 'Soporte Real Innovation',
        subtitle: 'Lunes a Viernes: 8:00 AM – 6:00 PM',
        buttonLabel: 'Contactar Soporte',
        icon: 'support_agent',
        accentColor: '#7ED957',
    },
    legalDocumentsProps: {
        showModificationLink: true,
        documents: [
            {
                icon: 'gavel',
                name: 'Acuerdo de Confidencialidad (NDA)',
                description: 'Protección de propiedad intelectual y datos sensibles compartidos durante la consultoría.',
                createdAt: 'Mar 10, 2026',
                approvedAt: 'Mar 10, 2026',
                step: 'Discovery',
                format: 'PDF',
            },
            {
                icon: 'description',
                name: 'Contrato de Consultoría Estratégica',
                description: 'Definición de alcances, entregables y cronograma de la implementación de IA.',
                createdAt: 'Mar 12, 2026',
                approvedAt: 'Pendiente',
                step: 'Contratación',
                format: 'DOCX',
            }
        ]
    },
    showRequests: true,
    requestsProps: {
        requests: [
            {
                type: 'terms',
                documentTitle: 'Términos y Condiciones',
                content: 'He leído y acepto los términos y condiciones del servicio de consultoría...',
                status: 'pending',
                checkboxes: [{ id: '1', text: 'He leído y acepto los términos y condiciones del servicio de consultoría.' }]
            }
        ]
    },
    showPaymentHistory: true,
    paymentHistoryProps: {
        title: 'Historial de Pagos',
        showDownloadAll: true,
        payments: [
            {
                date: 'Mar 15, 2025',
                description: 'Anticipo - Consultoría en Innovación Potenciada con IA',
                amount: '$2,500.00',
                status: 'Paid',
            },
            {
                date: 'Mar 28, 2025',
                description: 'Hito 1 - Diagnóstico y Roadmap Estratégico',
                amount: '$1,800.00',
                status: 'Paid',
            },
            {
                date: 'Abr 05, 2025',
                description: 'Suscripción Mensual - Acompañamiento IA',
                amount: '$450.00',
                status: 'Paid',
            }
        ]
    },
};
