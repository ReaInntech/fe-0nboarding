import React from 'react';
import styles from './index.module.scss';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'type'> {
    label?: string;
    prefix?: React.ReactNode;
    error?: string;
    wrapperClassName?: string;
    type?: React.InputHTMLAttributes<HTMLInputElement>['type'] | 'currency';
}

export default function Input({
    label,
    prefix,
    error,
    className = '',
    wrapperClassName = '',
    disabled,
    type = 'text',
    onChange,
    value,
    ...props
}: InputProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'currency') {
            let val = e.target.value.replace(/[^0-9.]/g, '');
            const parts = val.split('.');
            if (parts.length > 2) {
                val = parts[0] + '.' + parts.slice(1).join('');
            }
            const [integerPart, decimalPart] = val.split('.');
            let formattedInteger = integerPart;
            if (integerPart) {
                formattedInteger = parseInt(integerPart, 10).toLocaleString('en-US');
            }
            let finalValue = formattedInteger;
            if (decimalPart !== undefined) {
                finalValue += '.' + decimalPart.slice(0, 2);
            }
            e.target.value = finalValue;
        }
        if (onChange) {
            onChange(e);
        }
    };

    let displayValue = value;
    if (type === 'currency' && displayValue !== undefined && displayValue !== null) {
        const strVal = String(displayValue);
        // Only format initially if it doesn't have commas yet but is numeric
        if (!strVal.includes(',') && !isNaN(parseFloat(strVal))) {
            const [intP, decP] = strVal.split('.');
            const fmtInt = intP ? parseInt(intP, 10).toLocaleString('en-US') : '';
            displayValue = decP !== undefined ? `${fmtInt}.${decP}` : fmtInt;
        }
    }

    const inputType = type === 'currency' ? 'text' : type;

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
                    type={inputType}
                    onChange={handleChange}
                    value={displayValue}
                    {...props}
                />
            </div>
            {error && (
                <span className={styles['input__error']}>{error}</span>
            )}
        </div>
    );
}
