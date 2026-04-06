import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

export interface TicketMessage {
    sender: string;
    time: string;
    text: string;
}

export interface Ticket {
    id: string;
    subject: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed' | string;
    priority: 'high' | 'medium' | 'low' | string;
    date: string;
    assignee: string;
    category: string;
    messages: TicketMessage[];
}

export interface TicketListProps {
    title: string;
    tickets: Ticket[];
    showNewTicketButton?: boolean;
    showFilters?: boolean;
    className?: string;
}

const statusConfig: Record<string, { label: string; variant: string }> = {
    'open': { label: 'Open', variant: 'info' },
    'in-progress': { label: 'In Progress', variant: 'warning' },
    'resolved': { label: 'Resolved', variant: 'success' },
    'closed': { label: 'Closed', variant: 'default' },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
    'high': { label: 'High', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
    'medium': { label: 'Medium', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
    'low': { label: 'Low', color: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700' },
};

export default function TicketList({
    title,
    tickets = [],
    showNewTicketButton,
    showFilters,
    className
}: TicketListProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');

    const filteredTickets = filter === 'all'
        ? tickets
        : tickets.filter(t => t.status === filter);

    const counts: Record<string, number> = {
        all: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        'in-progress': tickets.filter(t => t.status === 'in-progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
    };

    return (
        <div className={`${styles['ticket-list']} ${className || ''}`}>
            {/* Header */}
            <div className={styles['ticket-list__header']}>
                <h3 className={styles['ticket-list__title']}>
                    <Icon name="confirmation_number" className={styles['ticket-list__title-icon']} /> {title}
                    <span className={styles['ticket-list__title-count']}>({counts.all})</span>
                </h3>
                {showNewTicketButton && (
                    <Button variant="primary" className={styles['ticket-list__new-btn']}>
                        <Icon name="add" className={styles['ticket-list__new-btn-icon']} /> New Ticket
                    </Button>
                )}
            </div>

            {/* Filters */}
            {showFilters && (
                <div className={styles['ticket-list__filters']}>
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'open', label: 'Open' },
                        { key: 'in-progress', label: 'In Progress' },
                        { key: 'resolved', label: 'Resolved' },
                    ].map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`${styles['ticket-list__filter-btn']} ${filter === f.key
                                ? styles['ticket-list__filter-btn--active']
                                : styles['ticket-list__filter-btn--inactive']
                                }`}
                        >
                            {f.label} ({counts[f.key] || 0})
                        </button>
                    ))}
                </div>
            )}

            {/* Ticket Rows */}
            <div className={styles['ticket-list__rows']}>
                {filteredTickets.map((ticket) => {
                    const isExpanded = expandedId === ticket.id;
                    const status = statusConfig[ticket.status] || statusConfig['open'];
                    const priority = priorityConfig[ticket.priority] || priorityConfig['medium'];

                    return (
                        <div key={ticket.id}>
                            {/* Ticket Row */}
                            <button
                                className={`${styles['ticket-list__row-btn']} ${isExpanded ? styles['ticket-list__row-btn--expanded'] : ''}`}
                                onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                            >
                                <Icon
                                    name={isExpanded ? 'expand_less' : 'expand_more'}
                                    className={styles['ticket-list__expand-icon']}
                                />
                                <div className={styles['ticket-list__info']}>
                                    <div className={styles['ticket-list__top-line']}>
                                        <span className={styles['ticket-list__id']}>{ticket.id}</span>
                                        <span className={`${styles['ticket-list__priority-bg']} ${priority.color}`}>
                                            {priority.label}
                                        </span>
                                    </div>
                                    <p className={styles['ticket-list__subject']}>{ticket.subject}</p>
                                    <div className={styles['ticket-list__meta']}>
                                        <span className={styles['ticket-list__meta-item']}>
                                            <Icon name="folder" className={styles['ticket-list__meta-icon']} /> {ticket.category}
                                        </span>
                                        <span className={styles['ticket-list__meta-item']}>
                                            <Icon name="calendar_today" className={styles['ticket-list__meta-icon']} /> {ticket.date}
                                        </span>
                                        <span className={styles['ticket-list__meta-item']}>
                                            <Icon name="person" className={styles['ticket-list__meta-icon']} /> {ticket.assignee}
                                        </span>
                                    </div>
                                </div>
                                <Badge variant={(ticket.priority === 'High' ? 'warning' : 'default') as "default" | "warning" | "success" | "primary"} className={styles['ticket-list__priority-badge']}>
                                    {status.label}
                                </Badge>
                            </button>

                            {/* Expanded Conversation */}
                            {isExpanded && (
                                <div className={styles['ticket-list__conversation-wrapper']}>
                                    <div className={styles['ticket-list__conversation']}>
                                        {ticket.messages.map((msg, idx) => {
                                            const isUser = msg.sender === 'You';
                                            return (
                                                <div key={idx} className={styles['ticket-list__msg']}>
                                                    <div className={`${styles['ticket-list__sender-avatar']} ${isUser ? styles['ticket-list__sender-avatar--user'] : styles['ticket-list__sender-avatar--support']}`}>
                                                        <Icon name={isUser ? 'person' : 'support_agent'} className={styles['ticket-list__sender-icon']} />
                                                    </div>
                                                    <div className={styles['ticket-list__msg-content']}>
                                                        <div className={styles['ticket-list__msg-header']}>
                                                            <span className={styles['ticket-list__sender-name']}>{msg.sender}</span>
                                                            <span className={styles['ticket-list__msg-time']}>{msg.time}</span>
                                                        </div>
                                                        <p className={styles['ticket-list__msg-text']}>
                                                            {msg.text}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Reply box hint */}
                                        <div className={styles['ticket-list__reply-area']}>
                                            <div className={styles['ticket-list__reply-input']}>
                                                Type your reply...
                                            </div>
                                            <Button variant="primary" className="shrink-0">
                                                <Icon name="send" className="text-lg" /> Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className={styles['ticket-list__footer']}>
                <button className={styles['ticket-list__load-older']}>
                    Load Older Tickets
                    <Icon name="keyboard_arrow_down" className={styles['ticket-list__load-older-icon']} />
                </button>
            </div>
        </div>
    );
}
