import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import styles from './index.module.scss';

export interface SupportAccessProps {
    title: string;
    subtitle: string;
    buttonLabel: string;
    icon: string;
    accentColor: string;
    className?: string;
    whatsappUrl?: string;
}

export default function SupportAccess({
    title,
    subtitle,
    buttonLabel,
    icon,
    accentColor,
    className = '',
    whatsappUrl,
}: SupportAccessProps) {
    // Determine background and border colors from accentColor
    // Assuming accentColor is a hex code like #1978e5
    const bgColor = `${accentColor}0D`; // ~5% opacity
    const borderColor = `${accentColor}1A`; // ~10% opacity

    return (
        <div 
            className={`${styles['support-access']} ${className}`} 
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
        >
            <div className={styles['support-access__content']}>
                <Icon 
                    name={icon} 
                    className={styles['support-access__icon']} 
                    style={{ color: accentColor }} 
                />
                <div className={styles['support-access__info']}>
                    <p className={styles['support-access__title']}>{title}</p>
                    <p className={styles['support-access__subtitle']}>{subtitle}</p>
                </div>
            </div>
            {whatsappUrl ? (
                <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-xs transition-all shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                    <Icon name="chat" className="text-sm" />
                    {buttonLabel}
                </a>
            ) : (
                <Button 
                    variant="secondary" 
                    className={styles['support-access__button']}
                >
                    {buttonLabel}
                </Button>
            )}
        </div>
    );
}
