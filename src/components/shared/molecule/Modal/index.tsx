import React, { useEffect } from 'react';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles['modal-overlay']} onClick={onClose}>
            <div 
                className={`${styles['modal-container']} ${styles[`modal-container--${size}`]}`} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles['modal-header']}>
                    <h3 className={styles['modal-title']}>{title}</h3>
                    <button className={styles['modal-close-btn']} onClick={onClose}>
                        <Icon name="close" />
                    </button>
                </div>
                <div className={styles['modal-body']}>
                    {children}
                </div>
                {footer && (
                    <div className={styles['modal-footer']}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
