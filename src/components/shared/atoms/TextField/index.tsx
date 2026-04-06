import React from 'react';
import styles from './index.module.scss';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'action'> {
    label?: string;
    id: string;
    type?: string;
    placeholder?: string;
    value?: string | number | readonly string[];
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
    error?: string | null;
    action?: React.ReactNode;
    className?: string;
}

const TextField = ({
    label,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
    error = null,
    action = null,
    className = "",
    ...props
}: TextFieldProps) => {
    return (
        <div className={`${styles.field} ${className}`}>
            {label && (
                <label
                    className={styles['field__label']}
                    htmlFor={id}
                >
                    {label}
                </label>
            )}
            <div className={styles['field__input-container']}>
                <input
                    id={id}
                    type={type}
                    required={required}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${styles['field__input']} ${action ? styles['field__input--with-action'] : ''} ${error ? styles['field__input--error'] : ''}`}
                    {...props}
                />
                {action && (
                    <div className={styles['field__action']}>
                        {action}
                    </div>
                )}
            </div>
            {error && (
                <span className={styles['field__error']}>{error}</span>
            )}
        </div>
    );
};

export default TextField;
