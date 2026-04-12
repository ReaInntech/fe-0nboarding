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
            {src ? (
                <img
                    alt={alt || 'Avatar'}
                    className={styles['avatar__image']}
                    src={src}
                />
            ) : (
                <span className="material-symbols-outlined text-[1.2em] text-slate-500 dark:text-slate-400">
                    person
                </span>
            )}
        </div>
    );
}
