import React, { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';
import styles from './index.module.scss';

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClickOutside: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClickOutside();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, onClickOutside]);
}

export interface SelectOption {
    value: string;
    label: string;
    icon?: string;
    color?: string;
}

export interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    type?: 'icon' | 'color' | 'billing' | 'default';
    activeColor?: string;
    label?: string;
    className?: string;
}

export default function Select({ 
    value, 
    onChange, 
    options, 
    type = 'default', 
    activeColor,
    label,
    className = ''
}: SelectProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    useClickOutside(dropdownRef, () => setOpen(false));

    // Handle case where options might be empty or value not found
    const selectedOption = options.find(o => o.value === value) || options[0] || { value: '', label: 'Select' };

    const renderLeading = (opt: SelectOption, isSelected: boolean) => {
        if (type === 'color') {
            return (
                <span
                    className={styles['select__item-icon-box']}
                    style={{
                        width: 24,
                        height: 24,
                        backgroundColor: opt.value,
                        borderRadius: '50%',
                        border: isSelected ? '2px solid white' : '1px solid rgba(255,255,255,0.1)'
                    }}
                />
            );
        }
        
        const color = activeColor || '#1978e5';
        
        // Use opt.icon if provided, fallback to standard icons if type requires it
        const iconName = type === 'icon' ? opt.value : opt.icon || 'star';
        
        // If it's a default select and no icon is provided, don't render a box
        if (type === 'default' && !opt.icon) {
            return null;
        }
        
        return (
            <span
                className={styles['select__item-icon-box']}
                style={{
                    width: 30,
                    height: 30,
                    backgroundColor: isSelected ? `${color}25` : 'rgba(255,255,255,0.04)',
                    color: isSelected ? color : '#94a3b8'
                }}
            >
                <Icon name={iconName} style={{ fontSize: 18 }} />
            </span>
        );
    };

    return (
        <div className={`${styles['select']} ${className}`} ref={dropdownRef}>
            {label && (
                <label className={styles['select__label']}>
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={styles['select__trigger']}
            >
                {renderLeading(selectedOption, true)}
                <span className={styles['select__trigger-text']}>
                    {type === 'icon' ? selectedOption.value : selectedOption.label}
                </span>
                <Icon name={open ? 'expand_less' : 'expand_more'} className={styles['select__trigger-arrow']} />
            </button>

            {open && (
                <div className={styles['select__menu']}>
                    {options.map(opt => {
                        const isSelected = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                                className={`${styles['select__item']} ${isSelected ? styles['select__item--active'] : ''}`}
                            >
                                {renderLeading(opt, isSelected)}
                                <span className={`${styles['select__item-text']} ${isSelected ? styles['select__item-text--active'] : styles['select__item-text--idle']}`}>
                                    {type === 'icon' ? opt.value : opt.label}
                                </span>
                                {isSelected && <Icon name="check" className={styles['select__item-check']} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
