import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import Badge from '../../../shared/atoms/Badge';
import Card from '../../../shared/atoms/Card';
import styles from './index.module.scss';

export interface AuxiliarOverviewProps {
    badges: string[];
    badgesTitle: string;
    healthTitle: string;
    healthLabel: string;
    healthIcon: string;
    healthColor: string; // Tailwind class like 'text-emerald-500'
    className?: string;
}

export default function AuxiliarOverview({
    badges,
    badgesTitle,
    healthTitle,
    healthLabel,
    healthIcon,
    healthColor,
    className = ''
}: AuxiliarOverviewProps) {
    return (
        <div className={`${styles['auxiliar-overview']} ${className}`}>
            <Card className={styles['auxiliar-overview__card']} noPadding={true}>
                <h4 className={styles['auxiliar-overview__title']}>{badgesTitle}</h4>
                <div className={styles['auxiliar-overview__badges']}>
                    {badges?.map((badge, idx) => (
                        <Badge key={idx} variant="default">{badge}</Badge>
                    ))}
                </div>
            </Card>
            <Card className={styles['auxiliar-overview__card']} noPadding={true}>
                <div className={styles['auxiliar-overview__health-box']}>
                    <div className={styles['auxiliar-overview__health-info']}>
                        <h4 className={styles['auxiliar-overview__title']}>{healthTitle}</h4>
                        <p className={`${styles['auxiliar-overview__health-label']} ${healthColor}`}>{healthLabel}</p>
                    </div>
                    <Icon name={healthIcon} className={`${styles['auxiliar-overview__health-icon']} ${healthColor}`} />
                </div>
            </Card>
        </div>
    );
}
