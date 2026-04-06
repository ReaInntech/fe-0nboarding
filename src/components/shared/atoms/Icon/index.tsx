import React from 'react';
import styles from './index.module.scss';

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
    name: string;
    className?: string;
}

export default function Icon({ name, className, ...props }: IconProps) {
    return (
        <span
            className={`${styles.icon} material-symbols-outlined ${className || ''}`}
            {...props}
        >
            {name}
        </span>
    );
}
