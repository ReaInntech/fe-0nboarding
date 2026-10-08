import { Notification, Subscription, OnboardingStep, ClientRequest, RequirementField } from "./types";
import { UnifiedProductViewProps } from "@/src/components/features/UnifiedProductView/UnifiedProductView";

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
            progressLabel: 'Provisioned',
            progressPct: 100,
            price: '$1,290.00',
            pricePeriod: '/mo',
            client: {
                id: 'C-001',
                legalName: 'Real Innovation Tech SAS',
                tradeName: 'Real Tech',
                clientType: 'legal_entity',
                taxId: '900.123.456-7',
                country: 'Colombia',
                email: 'contact@realinnovation.tech',
                phone: '+57 310 123 4567',
                users: [
                    { id: 'U-101', fullName: 'Carlos Gomez', email: 'carlos@realinnovation.tech', roleName: 'admin', phone: '+57 310 123 4567' },
                    { id: 'U-102', fullName: 'Ana Lopez', email: 'ana@realinnovation.tech', roleName: 'member', phone: '+57 311 234 5678' }
                ]
            },
            product: {
                name: 'Cloud Infrastructure',
                icon: 'cloud',
                iconColor: '#3b82f6'
            },
            monthlyPrice: 1290,
            documents: [{ name: 'SLA Enterprise', status: 'signed' }],
            payments: [{ id: 'P1', status: 'Paid', date: '2026-04-01', amount: 1290 }],
            can_delete: false,
            has_approved_payment: true
        },
        {
            id: 'S-7002',
            name: 'Cybersecurity Guard',
            tier: 'Standard Plan',
            icon: 'security',
            status: 'in_progress',
            progressLabel: 'Onboarding Security',
            progressPct: 60,
            price: '$450.00',
            pricePeriod: '/mo',
            client: {
                id: 'C-001',
                legalName: 'Real Innovation Tech SAS',
                tradeName: 'Real Tech',
                clientType: 'legal_entity',
                taxId: '900.123.456-7',
                country: 'Colombia',
                email: 'contact@realinnovation.tech',
                phone: '+57 310 123 4567',
                users: [
                    { id: 'U-101', fullName: 'Carlos Gomez', email: 'carlos@realinnovation.tech', roleName: 'admin', phone: '+57 310 123 4567' }
                ]
            },
            product: {
                name: 'Cybersecurity Guard',
                icon: 'security',
                iconColor: '#10b981'
            },
            monthlyPrice: 450,
            documents: [{ name: 'Security Policy', status: 'pending' }],
            payments: [],
            can_delete: true,
            has_approved_payment: false
        },
        {
            id: 'S-7003',
            name: 'Asesoría Jurídica Corporativa',
            tier: 'Retainer Mensual',
            icon: 'gavel',
            status: 'active',
            progressLabel: 'Active Service',
            progressPct: 100,
            price: '$750.00',
            pricePeriod: '/mo',
            client: {
                id: 'C-002',
                legalName: 'Daniel Bernal',
                clientType: 'natural_person',
                taxId: '1020304050',
                country: 'Colombia',
                email: 'daniel.bernal@gmail.com',
                phone: '+57 300 987 6543',
                users: [
                    { id: 'U-201', fullName: 'Daniel Bernal', email: 'daniel.bernal@gmail.com', roleName: 'owner', phone: '+57 300 987 6543' }
                ]
            },
            product: {
                name: 'Asesoría Jurídica Corporativa',
                icon: 'gavel',
                iconColor: '#8b5cf6'
            },
            monthlyPrice: 750,
            documents: [{ name: 'Contrato de Servicios', status: 'signed' }],
            payments: [{ id: 'P2', status: 'Paid', date: '2026-04-10', amount: 750 }],
            can_delete: false,
            has_approved_payment: true
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
        id: "prod-mock-1",
        name: "Cloud Infrastructure",
        description: "Enterprise high-performance cloud hosting and automated infrastructure management.",
        price: 499.00,
        period: "month",
        sold: 12,
        productCode: "PROD-1029",
        category: "Cloud",
        icon: "cloud",
        iconColor: "text-blue-500",
        status: "active" as const
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

export const FALLBACK_SUBSCRIPTION_DETAIL_DATA: UnifiedProductViewProps = {
    headerProps: {
        icon: 'lightbulb',
        iconColor: '#7ED957',
        title: 'Innovation Consulting',
        badgeText: 'In Assessment',
        badgeVariant: 'info',
        productId: 'RI-CONS-2024-001',
        meta: [
            { icon: 'calendar_today', text: 'Started Mar 15, 2026' },
            { icon: 'business', text: 'Real Innovation Tech' },
            { icon: 'location_on', text: 'Remote / Hybrid' },
        ],
        actions: [
            { label: 'Schedule Session', icon: 'event', variant: 'primary' },
            { label: 'Contact Consultant', icon: 'chat', variant: 'secondary' }
        ],
    },
    showContractingProgress: true,
    contractingProgressProps: {
        currentPhase: 'Assessment',
        steps: [
            { label: 'Discovery', status: 'completed', icon: 'search' },
            { label: 'Assessment', status: 'active', icon: 'monitor_heart' },
            { label: 'Prototyping', status: 'pending', icon: 'design_services' },
            { label: 'Development', status: 'pending', icon: 'developer_mode' },
            { label: 'Impact', status: 'pending', icon: 'trending_up' },
        ]
    },
    serviceDetailsProps: {
        title: 'Consulting Details',
        titleIcon: 'psychology',
        titleIconColor: '#7ED957',
        totalAmount: 10000000,
        paidAmount: 4300000,
        fields: [
            { icon: 'info', label: 'Service Type', value: 'Innovation Consulting' },
            { icon: 'groups', label: 'Consultant', value: 'Daniel Bernal' },
            { icon: 'speed', label: 'Focus', value: 'Process Optimization & Automation' },
            { icon: 'payments', label: 'Billing Model', value: 'Monthly' },
        ],
    },
    legalDocumentsProps: {
        showModificationLink: true,
        documents: [
            {
                icon: 'gavel',
                name: 'Non-Disclosure Agreement (NDA)',
                description: 'Protection of intellectual property and confidential data shared during consulting.',
                createdAt: 'Mar 10, 2026',
                approvedAt: 'Mar 10, 2026',
                step: 'Discovery',
                format: 'PDF',
            },
            {
                icon: 'description',
                name: 'Strategic Consulting Agreement',
                description: 'Scope definition, deliverables and timeline of the implementation.',
                createdAt: 'Mar 12, 2026',
                approvedAt: 'Pending',
                step: 'Contracting',
                format: 'DOCX',
            }
        ]
    },
    showRequests: true,
    requestsProps: {
        requests: [
            {
                type: 'terms',
                documentTitle: 'Terms & Conditions',
                content: 'I have read and agree to the consulting service terms and conditions...',
                status: 'pending',
                checkboxes: [{ id: '1', text: 'I have read and agree to the consulting service terms and conditions.' }]
            }
        ]
    },
    showPaymentHistory: true,
    paymentHistoryProps: {
        title: 'Payment History',
        showDownloadAll: true,
        payments: [
            {
                date: 'Mar 15, 2025',
                description: 'Advance Payment - AI-Powered Innovation Consulting',
                amount: '$2,500.00',
                status: 'Paid',
            },
            {
                date: 'Mar 28, 2025',
                description: 'Milestone 1 - Assessment & Strategic Roadmap',
                amount: '$1,800.00',
                status: 'Paid',
            },
            {
                date: 'Apr 05, 2025',
                description: 'Monthly Subscription - AI Advisory',
                amount: '$450.00',
                status: 'Paid',
            }
        ]
    },
};

export const FALLBACK_PROVIDER_SETTINGS = {
    organization: {
        id: 'org-prov-1',
        legal_name: 'Acme Cloud Technologies S.A.S.',
        trade_name: 'Acme Cloud Solutions',
        client_type: 'legal_entity',
        tax_id: '900.829.102-4',
        email: 'contacto@acmecloud.com',
        phone: '+57 300 123 4567',
        address: 'Cra 43A # 1-50, Medellín, Colombia',
        country: 'Colombia',
        website: 'https://acmecloud.com',
        domain: 'acmecloud.com',
    },
    branding: {
        logo_url: null as string | null,
        isotype_url: null as string | null,
        favicon_url: null as string | null,
        brand_primary_color: '#1978E5',
        brand_secondary_color: '#10B981',
        brand_accent_color: '#F59E0B',
    },
    localization: {
        currency: 'COP',
        language: 'es',
        timezone: 'America/Bogota',
        date_format: 'DD/MM/YYYY',
    },
    notifications: {
        notification_email: 'alertas@acmecloud.com',
        mute_notifications: false,
        email_on_request: true,
        inapp_on_request: true,
        email_on_ticket: true,
        inapp_on_ticket: true,
        email_on_payment: true,
        inapp_on_payment: true,
    },
    plan: {
        name: 'Enterprise Scale',
        renewal_date: '2026-12-31',
        products_used: 4,
        products_limit: 20,
        clients_used: 48,
        clients_limit: 250,
        storage_used_gb: 12.4,
        storage_limit_gb: 100,
    }
};

export const FALLBACK_PROVIDER_CLIENTS_DATA = {
    metrics: {
        total: 24,
        active: 18,
        in_progress: 5,
        suspended: 1,
    },
    clients: [
        {
            id: 'org-cli-1',
            legal_name: 'Real Innovation Tech S.A.S.',
            trade_name: 'Real Innovation',
            dominio: 'realinnovation.tech',
            email: 'admin@realinnovation.tech',
            phone: '+57 310 987 6543',
            country: 'Colombia',
            client_type: 'legal_entity' as const,
            created_at: '2026-03-10T10:00:00Z',
            subscriptions_count: 2,
            active_subscriptions_count: 2,
            status: 'active' as const,
            subscriptions: [
                { id: 'sub-1', productName: 'Cloud Infrastructure Enterprise', status: 'active', price: 1290 },
                { id: 'sub-2', productName: 'AI Strategic Advisory', status: 'active', price: 2500 }
            ]
        },
        {
            id: 'org-cli-2',
            legal_name: 'Banco Andino de Desarrollo',
            trade_name: 'Banco Andino',
            dominio: 'bancoandino.com',
            email: 'procurement@bancoandino.com',
            phone: '+57 601 456 7890',
            country: 'Colombia',
            client_type: 'legal_entity' as const,
            created_at: '2026-03-15T14:30:00Z',
            subscriptions_count: 1,
            active_subscriptions_count: 0,
            status: 'in_progress' as const,
            subscriptions: [
                { id: 'sub-3', productName: 'Security Compliance Suite', status: 'in_progress', price: 3400 }
            ]
        },
        {
            id: 'org-cli-3',
            legal_name: 'Fintech Solutions Latam Ltd.',
            trade_name: 'Fintech Latam',
            dominio: 'fintechlatam.io',
            email: 'ops@fintechlatam.io',
            phone: '+52 55 1234 5678',
            country: 'México',
            client_type: 'legal_entity' as const,
            created_at: '2026-02-20T09:15:00Z',
            subscriptions_count: 1,
            active_subscriptions_count: 1,
            status: 'active' as const,
            subscriptions: [
                { id: 'sub-4', productName: 'Core Payment Gateway Connector', status: 'active', price: 950 }
            ]
        },
        {
            id: 'org-cli-4',
            legal_name: 'Dr. Carlos Mendoza',
            trade_name: 'Mendoza Consultores',
            dominio: 'mendozaconsulting.com',
            email: 'carlos@mendozaconsulting.com',
            phone: '+57 320 555 4321',
            country: 'Colombia',
            client_type: 'natural_person' as const,
            created_at: '2026-04-01T16:00:00Z',
            subscriptions_count: 1,
            active_subscriptions_count: 0,
            status: 'in_progress' as const,
            subscriptions: [
                { id: 'sub-5', productName: 'Cloud Infrastructure Basic', status: 'in_progress', price: 499 }
            ]
        },
        {
            id: 'org-cli-5',
            legal_name: 'Logística Continental S.A.',
            trade_name: 'Continental Cargo',
            dominio: 'continentalcargo.pe',
            email: 'sistemas@continentalcargo.pe',
            phone: '+51 1 987 6543',
            country: 'Perú',
            client_type: 'legal_entity' as const,
            created_at: '2026-01-12T11:45:00Z',
            subscriptions_count: 1,
            active_subscriptions_count: 0,
            status: 'suspended' as const,
            subscriptions: [
                { id: 'sub-6', productName: 'Dedicated Fleet API', status: 'suspended', price: 800 }
            ]
        }
    ]
};

