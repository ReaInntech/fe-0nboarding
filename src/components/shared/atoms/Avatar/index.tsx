import React from 'react';
import styles from './index.module.scss';

interface AvatarProps {
    src: string;
    alt?: string;
    sizeClasses?: string;
    className?: string;
}

export default function Avatar({ src, alt, sizeClasses, className }: AvatarProps) {
    return (
        <div className={`${styles.avatar} ${sizeClasses || 'size-8'} ${className || ''}`}>
            <img
                alt={alt || 'Avatar'}
                className={styles['avatar__image']}
                src={src}
            />
        </div>
    );
}
