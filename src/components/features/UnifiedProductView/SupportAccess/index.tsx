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
}

export default function SupportAccess({
    title,
    subtitle,
    buttonLabel,
    icon,
    accentColor,
    className = ''
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
            <Button 
                variant="secondary" 
                className={styles['support-access__button']}
            >
                {buttonLabel}
            </Button>
        </div>
    );
}
