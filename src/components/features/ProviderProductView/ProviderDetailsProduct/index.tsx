'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import { RequirementField } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface ProviderDetailsProductProps {
    initialRequirements: RequirementField[];
}

export default function ProviderDetailsProduct({
    initialRequirements,
}: ProviderDetailsProductProps) {
    const [requirements, setRequirements] = useState<RequirementField[]>(initialRequirements);

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['details-product__header']}>
                <h3 className={styles['details-product__title']}>
                    <Icon name="assignment_turned_in" className="text-[#1978e5]" /> Details Product
                </h3>
                <Button variant="ghost" size="sm" className={styles['details-product__add-btn']}>
                    <Icon name="add" className="mr-1" /> Add Field
                </Button>
            </div>

            <div className={styles['details-product__list']}>
                {requirements.map((req) => (
                    <div key={req.id} className={styles['details-product__item']}>
                        <div className={styles['details-product__item-left']}>
                            <div className={styles['details-product__drag-handle']}>
                                <Icon name="drag_indicator" className="cursor-grab" />
                            </div>
                            <div>
                                <span className={styles['details-product__label']}>
                                    {req.label} {req.required && <span className={styles['details-product__label--required']}>*</span>}
                                </span>
                                <span className={styles['details-product__value']}>{req.value}</span>
                            </div>
                        </div>
                        <div className={styles['details-product__actions']}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                <Icon name="edit" className="text-sm" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-400">
                                <Icon name="delete" className="text-sm" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles['details-product__info-box']}>
                <p className={styles['details-product__info-text']}>
                    <Icon name="info" className="text-sm mr-1 inline-block" />
                    Specify the required and optional fields that your product requires for onboarding.
                </p>
            </div>
        </Card>
    );
}
