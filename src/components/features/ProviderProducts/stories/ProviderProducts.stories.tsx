import React from 'react';
import ProviderProducts from '../ProviderProducts';
import { Product } from '../ProductCard';

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Enterprise VPN',
        description: 'Secure, high-speed VPN for large organizations with advanced encryption and zero-trust architecture.',
        price: 49.99,
        period: 'month',
        sold: 1240,
        productCode: 'VPN-ENT-001',
        category: 'Security',
        status: 'active',
        icon: 'security',
        iconColor: '#1978e5'
    },
    {
        id: '2',
        name: 'Cloud Storage Pro',
        description: 'Scalable cloud storage with automated backups, version control, and real-time collaboration features.',
        price: 19.99,
        period: 'month',
        sold: 850,
        productCode: 'STG-PRO-002',
        category: 'Infrastucture',
        status: 'active',
        icon: 'cloud',
        iconColor: '#10b981'
    },
    {
        id: '3',
        name: 'Cyber Security API',
        description: 'Advanced threat detection and vulnerability scanning API for modern web applications.',
        price: 299,
        period: 'year',
        sold: 125,
        productCode: 'API-SEC-003',
        category: 'Security',
        status: 'maintenance',
        icon: 'api',
        iconColor: '#f59e0b'
    },
    {
        id: '4',
        name: 'Load Balancer X',
        description: 'High-performance load balancer with intelligent traffic routing and DDoS protection.',
        price: 89.99,
        period: 'month',
        sold: 450,
        productCode: 'LB-X-004',
        category: 'Infrastucture',
        status: 'inactive',
        icon: 'dns',
        iconColor: '#ef4444'
    }
];

export default {
    title: 'Provider/Components/Organisms/ProviderProducts',
    component: ProviderProducts,
    parameters: {
        layout: 'fullscreen',
        backgrounds: {
            default: 'dark',
            values: [
                { name: 'dark', value: '#0f1523' },
            ]
        }
    }
};

export const Default = {
    args: {
        initialProducts: mockProducts,
        userProfile: { name: 'Admin User', role: 'Provider' }
    }
};

export const EmptyState = {
    args: {
        initialProducts: [],
        userProfile: { name: 'New Provider', role: 'Provider' }
    }
};

export const FilteredByCategory = {
    args: {
        initialProducts: mockProducts.filter(p => p.category === 'Security'),
        userProfile: { name: 'Admin User', role: 'Provider' }
    }
};
