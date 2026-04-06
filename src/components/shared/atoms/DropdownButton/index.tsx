'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';
import styles from './index.module.scss';

interface DropdownOption {
    label?: string;
    icon?: string;
    danger?: boolean;
    divider?: boolean;
    onClick?: () => void;
}

interface DropdownButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    options?: DropdownOption[];
    className?: string;
    dropdownAlign?: 'left' | 'right';
}

export default function DropdownButton({
    children,
    variant = 'secondary',
    options = [],
    className = '',
    dropdownAlign = 'left',
    ...props
}: DropdownButtonProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={styles.dropdown} ref={ref}>
            <button
                className={`${styles['dropdown__button']} ${styles[`dropdown__button--${variant}`] || ''} ${className}`}
                onClick={() => setOpen(!open)}
                {...props}
            >
                {children}
                <Icon
                    name="keyboard_arrow_down"
                    className={`${styles['dropdown__icon']} ${open ? styles['dropdown__icon--open'] : ''}`}
                />
            </button>

            {open && (
                <div
                    className={`${styles['dropdown__menu']} ${styles[`dropdown__menu--${dropdownAlign}`] || ''}`}
                >
                    {options.map((option, idx) =>
                        option.divider ? (
                            <div key={idx} className={styles['dropdown__divider']} />
                        ) : (
                            <button
                                key={idx}
                                className={`${styles['dropdown__item']} ${option.danger ? styles['dropdown__item--danger'] : ''} ${option.icon ? styles['dropdown__item--with-icon'] : ''}`}
                                onClick={() => {
                                    setOpen(false);
                                    option.onClick?.();
                                }}
                            >
                                {option.icon && (
                                    <Icon
                                        name={option.icon}
                                        className={`${styles['dropdown__item-icon']} ${option.danger ? styles['dropdown__item-icon--danger'] : ''}`}
                                    />
                                )}
                                {option.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
