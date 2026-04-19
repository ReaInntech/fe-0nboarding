import React from 'react';
import styles from './index.module.scss';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    wrapperClassName?: string;
}

export default function Textarea({
    label,
    error,
    className = '',
    wrapperClassName = '',
    disabled,
    rows = 3,
    ...props
}: TextareaProps) {
    return (
        <div className={`${styles['textarea']} ${className}`}>
            {label && (
                <label className={styles['textarea__label']}>
                    {label}
                </label>
            )}
            <div 
                className={`${styles['textarea__wrapper']} ${error ? styles['textarea__wrapper--error'] : ''} ${disabled ? styles['textarea__wrapper--disabled'] : ''} ${wrapperClassName}`}
            >
                <textarea
                    className={styles['textarea__field']}
                    disabled={disabled}
                    rows={rows}
                    {...props}
                />
            </div>
            {error && (
                <span className={styles['textarea__error']}>{error}</span>
            )}
        </div>
    );
}
