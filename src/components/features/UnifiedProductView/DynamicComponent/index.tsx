'use client';

import React from 'react';
import Card from '../../../shared/atoms/Card';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface DynamicComponentProps {
    id: string;
    title: string;
    templateFile?: string;
    status?: string;
    data?: any; // The ResolvedRequest data
    config?: any;
}

/**
 * A generic component that renders different UIs based on templateFile.
 * This is used for ResolvedRequests where the UI is dynamic.
 */
export default function DynamicComponent({
    title,
    templateFile,
    status,
    data,
    config
}: DynamicComponentProps) {
    const isCompleted = status === 'completed' || status === 'approved';

    return (
        <Card className={`${styles['dynamic-component']} ${isCompleted ? styles['dynamic-component--completed'] : ''}`}>
            <div className={styles['dynamic-component__header']}>
                <div className={styles['dynamic-component__icon-box']}>
                    <Icon name="extension" className="text-[#1978e5]" />
                </div>
                <div className={styles['dynamic-component__info']}>
                    <h4 className={styles['dynamic-component__title']}>{title}</h4>
                    <p className={styles['dynamic-component__subtitle']}>
                        {templateFile ? `Template: ${templateFile}` : 'Dynamic Component'}
                    </p>
                </div>
                {isCompleted && (
                    <div className={styles['dynamic-component__status']}>
                        <Icon name="check_circle" className="text-emerald-500" />
                    </div>
                )}
            </div>

            <div className={styles['dynamic-component__content']}>
                {/* 
                   In a real implementation, this would dynamically import 
                   and render the component specified by templateFile.
                   For now, we show the instance data if available.
                */}
                {data ? (
                    <div className={styles['dynamic-component__data-preview']}>
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                ) : (
                    <div className={styles['dynamic-component__placeholder']}>
                        <Icon name="hourglass_empty" />
                        <span>Awaiting input...</span>
                    </div>
                )}
            </div>
        </Card>
    );
}
