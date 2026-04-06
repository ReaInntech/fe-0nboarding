import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Button from '../../../shared/atoms/Button';
import DropdownButton from '../../../shared/atoms/DropdownButton';
import styles from './index.module.scss';

export interface ProductHeaderMeta {
    icon: string;
    text: string;
}

export interface ProductHeaderAction {
    type?: 'dropdown' | 'button';
    variant?: string;
    icon?: string;
    label: string;
    options?: any[];
}

export interface ProductHeaderProps {
    icon: string;
    iconColor: string;
    title: string;
    badgeText: string;
    badgeVariant?: string;
    productId: string;
    meta?: ProductHeaderMeta[];
    actions?: ProductHeaderAction[];
    className?: string;
    clientName?: string;
    clientId?: string;
}

export default function ProductHeader({
    icon,
    iconColor,
    title,
    badgeText,
    badgeVariant = 'default',
    productId,
    meta,
    actions,
    className
}: ProductHeaderProps) {
    return (
        <section className={`${styles['product-header']} ${className || ''}`}>
            <div className={styles['product-header__info-section']}>
                <div
                    className={styles['product-header__icon-box']}
                    style={{ backgroundColor: `${iconColor}1A`, borderColor: `${iconColor}33` }}
                >
                    <Icon name={icon} className={styles['product-header__icon']} style={{ color: iconColor }} />
                </div>
                <div className={styles['product-header__details']}>
                    <div className={styles['product-header__title-row']}>
                        <h1 className={styles['product-header__title']}>{title}</h1>
                        <Badge variant={badgeVariant as "default" | "warning" | "success" | "primary"}>{badgeText}</Badge>
                    </div>
                    <p className={styles['product-header__id']}>ID: {productId}</p>
                    <div className={styles['product-header__meta-list']}>
                        {meta?.map((item, idx) => (
                            <div key={idx} className={styles['product-header__meta-item']}>
                                <Icon name={item.icon} className={styles['product-header__meta-icon']} />
                                {item.text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className={styles['product-header__actions-section']}>
                {actions?.map((action, idx) =>
                    action.type === 'dropdown' ? (
                        <DropdownButton
                            key={idx}
                            variant={(action.variant || 'secondary') as any}
                            options={action.options || []}
                            dropdownAlign="right"
                        >
                            <><Icon name={action.icon as string} className={styles['product-header__action-icon']} /> {action.label}</>
                        </DropdownButton>
                    ) : (
                        <Button key={idx} variant={(action.variant || 'primary') as any}>
                            <Icon name={action.icon as string} className={styles['product-header__action-icon']} /> {action.label}
                        </Button>
                    )
                )}
            </div>
        </section>
    );
}
