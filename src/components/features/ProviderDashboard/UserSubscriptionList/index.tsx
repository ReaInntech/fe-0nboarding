import React, { useState, useMemo } from 'react';
import UserAccordionRow, { ClientGroupData } from '../UserAccordionRow';
import { Subscription } from '@/src/lib/api/types';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface UserSubscriptionListProps {
    subscriptions: Subscription[];
    className?: string;
    allExpanded?: boolean;
    onDelete?: (sub: Subscription) => void;
    onDisable?: (sub: Subscription) => void;
}

export default function UserSubscriptionList({
    subscriptions = [],
    className,
    allExpanded = false,
    onDelete,
    onDisable,
}: UserSubscriptionListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'natural_person' | 'legal_entity'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

    // Group subscriptions by client/organization
    const clientGroups: ClientGroupData[] = useMemo(() => {
        const map = new Map<string, ClientGroupData>();

        subscriptions.forEach(sub => {
            const client = sub.client;
            const clientId = client?.id || client?.legalName || 'unassigned';

            if (!map.has(clientId)) {
                const rawType = client?.clientType;
                const clientType: 'natural_person' | 'legal_entity' =
                    rawType === 'natural_person' || rawType === 'person'
                        ? 'natural_person'
                        : (rawType === 'legal_entity' || client?.tradeName ? 'legal_entity' : 'natural_person');

                const initialUsers = client?.users && client.users.length > 0
                    ? [...client.users]
                    : [{
                        id: `usr-${clientId}`,
                        fullName: client?.legalName || 'Client Contact',
                        email: client?.email || '',
                        phone: client?.phone || '',
                        roleName: clientType === 'natural_person' ? 'Client' : 'Administrator'
                    }];

                map.set(clientId, {
                    clientId,
                    legalName: client?.legalName || 'Unknown Client',
                    tradeName: client?.tradeName,
                    taxId: client?.taxId,
                    country: client?.country,
                    clientType,
                    email: client?.email || '',
                    phone: client?.phone || '',
                    users: initialUsers,
                    subscriptions: []
                });
            }

            const group = map.get(clientId)!;
            group.subscriptions.push(sub);

            // Merge any additional users if available
            if (client?.users && client.users.length > 0) {
                client.users.forEach(u => {
                    if (!group.users.some(existing => existing.id === u.id || (existing.email && existing.email === u.email))) {
                        group.users.push(u);
                    }
                });
            }
        });

        return Array.from(map.values());
    }, [subscriptions]);

    // Filter groups based on search & selectors
    const filteredGroups = useMemo(() => {
        return clientGroups.filter(group => {
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch = !query || (
                group.legalName.toLowerCase().includes(query) ||
                (group.tradeName && group.tradeName.toLowerCase().includes(query)) ||
                (group.taxId && group.taxId.toLowerCase().includes(query)) ||
                group.email.toLowerCase().includes(query) ||
                group.users.some(u =>
                    u.fullName.toLowerCase().includes(query) ||
                    u.email.toLowerCase().includes(query)
                ) ||
                group.subscriptions.some(s =>
                    s.id.toLowerCase().includes(query) ||
                    (s.product?.name && s.product.name.toLowerCase().includes(query))
                )
            );

            const matchesType = typeFilter === 'all' || group.clientType === typeFilter;

            const matchesStatus = statusFilter === 'all' || (
                statusFilter === 'active'
                    ? group.subscriptions.some(s => s.status === 'active' || s.status === 'in_progress')
                    : group.subscriptions.some(s => s.status === 'suspended' || s.status === 'cancelled')
            );

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [clientGroups, searchQuery, typeFilter, statusFilter]);

    const totalSubscriptionsCount = useMemo(() => {
        return filteredGroups.reduce((acc, g) => acc + g.subscriptions.length, 0);
    }, [filteredGroups]);

    return (
        <div className={`${styles['user-subscription-list']} ${className || ''}`}>
            {/* Filters Header */}
            <div className={styles['user-subscription-list__filters']}>
                {/* Search Bar */}
                <div className={styles['user-subscription-list__search-wrapper']}>
                    <div className={styles['user-subscription-list__search-icon-container']}>
                        <Icon name="search" className={styles['user-subscription-list__search-icon']} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by user name, organization, email, tax ID or subscription..."
                        className={styles['user-subscription-list__search-input']}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Entity Type Filter */}
                <div className={styles['user-subscription-list__select-wrapper']}>
                    <div className={styles['user-subscription-list__select-icon-left']}>
                        <Icon name="badge" className={styles['user-subscription-list__search-icon']} />
                    </div>
                    <select
                        className={styles['user-subscription-list__select-input']}
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                    >
                        <option value="all">All Entity Types</option>
                        <option value="natural_person">Natural Person (Individual)</option>
                        <option value="legal_entity">Legal Entity (Company)</option>
                    </select>
                    <div className={styles['user-subscription-list__select-icon-right']}>
                        <Icon name="expand_more" className={styles['user-subscription-list__search-icon']} />
                    </div>
                </div>

                {/* Status Filter */}
                <div className={styles['user-subscription-list__select-wrapper']}>
                    <div className={styles['user-subscription-list__select-icon-left']}>
                        <Icon name="filter_alt" className={styles['user-subscription-list__search-icon']} />
                    </div>
                    <select
                        className={styles['user-subscription-list__select-input']}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Has Active Subscriptions</option>
                        <option value="suspended">Has Suspended / Cancelled</option>
                    </select>
                    <div className={styles['user-subscription-list__select-icon-right']}>
                        <Icon name="expand_more" className={styles['user-subscription-list__search-icon']} />
                    </div>
                </div>
            </div>

            {/* List of User Accordion Rows */}
            <div className={styles['user-subscription-list__list-container']}>
                {filteredGroups.length > 0 ? (
                    filteredGroups.map(group => (
                        <UserAccordionRow
                            key={group.clientId}
                            clientGroup={group}
                            initialExpanded={allExpanded}
                            onDelete={onDelete}
                            onDisable={onDisable}
                        />
                    ))
                ) : (
                    <div className={styles['user-subscription-list__empty-state']}>
                        <Icon name="person_search" className={styles['user-subscription-list__empty-icon']} />
                        <h3 className={styles['user-subscription-list__empty-title']}>No clients or users found</h3>
                        <p className={styles['user-subscription-list__empty-text']}>
                            Try adjusting your search keywords or filter settings.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer Count */}
            <div className={styles['user-subscription-list__footer-text']}>
                Showing {filteredGroups.length} of {clientGroups.length} clients ({totalSubscriptionsCount} subscriptions)
            </div>
        </div>
    );
}
