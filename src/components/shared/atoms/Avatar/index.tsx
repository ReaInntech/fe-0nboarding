'use client';

import React, { useState } from 'react';
import styles from './index.module.scss';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    sizeClasses?: string;
    className?: string;
}

export default function Avatar({ src, alt, sizeClasses, className }: AvatarProps) {
    const [hasError, setHasError] = useState(false);

    const hasValidImage = Boolean(src && !hasError);

    return (
        <div className={`${styles.avatar} ${sizeClasses || 'size-8'} ${className || ''}`}>
            {hasValidImage ? (
                <img
                    alt={alt || 'Avatar'}
                    className={styles['avatar__image']}
                    src={src!}
                    onError={() => setHasError(true)}
                />
            ) : (
                <span className="material-symbols-outlined text-[1.2em] text-slate-500 dark:text-slate-400 select-none">
                    person
                </span>
            )}
        </div>
    );
}

