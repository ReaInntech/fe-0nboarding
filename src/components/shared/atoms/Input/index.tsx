import React from 'react';
import styles from './index.module.scss';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
    label?: string;
    prefix?: React.ReactNode;
    error?: string;
    wrapperClassName?: string;
}

export default function Input({
    label,
    prefix,
    error,
    className = '',
    wrapperClassName = '',
    disabled,
    ...props
}: InputProps) {
    return (
        <div className={`${styles['input']} ${className}`}>
            {label && (
                <label className={styles['input__label']}>
                    {label}
                </label>
            )}
            <div 
                className={`${styles['input__wrapper']} ${error ? styles['input__wrapper--error'] : ''} ${disabled ? styles['input__wrapper--disabled'] : ''} ${wrapperClassName}`}
            >
                {prefix && (
                    <span className={styles['prefix']}>
                        {prefix}
                    </span>
                )}
                <input
                    className={`${styles['input__field']} ${prefix ? styles['input__field--with-prefix'] : ''}`}
                    disabled={disabled}
                    {...props}
                />
            </div>
            {error && (
                <span className={styles['input__error']}>{error}</span>
            )}
        </div>
    );
}
