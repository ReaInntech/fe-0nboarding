import React from 'react';
import Dashboard from '../Dashboard';

export default {
    title: 'Features/Dashboard',
    component: Dashboard,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
        },
    },
};

const mockUserProfile = {
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    clientType: 'business'
};

const mockNotifications = [
    {
        title: 'Critical Alert',
        time: '2 mins ago',
        message: 'Service disruption detected in US-East-1. Our engineers are investigating the issue.',
        variant: 'critical' as const,
    },
    {
        title: 'Billing Warning',
        time: '4 hours ago',
        message: "Your 'Cloud Infrastructure' subscription payment is overdue. Please update payment method.",
        variant: 'warning' as const,
    },
    {
        title: 'System Update',
        time: '1 day ago',
        message: 'Advanced API Analytics is now live. All features are now available in your service dashboard.',
        variant: 'info' as const,
    }
];

const mockSubscriptions: any[] = [
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
        progressValue: "Contratación",
        progressPct: 37,
        price: "$8,000.00",
        pricePeriod: "/proyecto",
        currentStep: 3,
        totalSteps: 8,
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
];

export const Default = {
    args: {
        notifications: mockNotifications,
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
    },
};

export const EmptyState = {
    args: {
        notifications: [],
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};

export const NotificationsOnly = {
    args: {
        notifications: mockNotifications,
        subscriptions: [],
        userProfile: mockUserProfile,
    },
};

export const ServicesOnly = {
    args: {
        notifications: [],
        subscriptions: mockSubscriptions,
        userProfile: mockUserProfile,
    },
};
