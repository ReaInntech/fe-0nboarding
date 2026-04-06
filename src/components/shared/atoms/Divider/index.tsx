import React from 'react';
import styles from './index.module.scss';

interface DividerProps {
    children?: React.ReactNode;
    className?: string;
}

const Divider = ({ children, className = "" }: DividerProps) => {
    return (
        <div className={`${styles.divider} ${className}`}>
            <div className={styles['divider__line-container']}>
                <div className={styles['divider__line']}></div>
            </div>
            {children && (
                <div className={styles['divider__content']}>
                    <span className={styles['divider__text']}>
                        {children}
                    </span>
                </div>
            )}
        </div>
    );
};

export default Divider;
