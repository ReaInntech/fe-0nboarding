'use client';

import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Card from '../../../shared/atoms/Card';
import Button from '../../../shared/atoms/Button';
import { RequirementField } from '@/src/lib/api/types';
import styles from './index.module.scss';

export interface ProviderRequirementsManagerProps {
    initialRequirements: RequirementField[];
}

export default function ProviderRequirementsManager({
    initialRequirements,
}: ProviderRequirementsManagerProps) {
    const [requirements, setRequirements] = useState<RequirementField[]>(initialRequirements);

    return (
        <Card className="bg-slate-900/50 border-slate-800">
            <div className={styles['requirements-manager__header']}>
                <h3 className={styles['requirements-manager__title']}>
                    <Icon name="assignment_turned_in" className="text-[#1978e5]" /> Service Requirements
                </h3>
                <Button variant="ghost" size="sm" className={styles['requirements-manager__add-btn']}>
                    <Icon name="add" className="mr-1" /> Add Field
                </Button>
            </div>

            <div className={styles['requirements-manager__list']}>
                {requirements.map((req) => (
                    <div key={req.id} className={styles['requirements-manager__item']}>
                        <div className={styles['requirements-manager__item-left']}>
                            <div className={styles['requirements-manager__drag-handle']}>
                                <Icon name="drag_indicator" className="cursor-grab" />
                            </div>
                            <div>
                                <span className={styles['requirements-manager__label']}>
                                    {req.label} {req.required && <span className={styles['requirements-manager__label--required']}>*</span>}
                                </span>
                                <span className={styles['requirements-manager__value']}>{req.value}</span>
                            </div>
                        </div>
                        <div className={styles['requirements-manager__actions']}>
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

            <div className={styles['requirements-manager__info-box']}>
                <p className={styles['requirements-manager__info-text']}>
                    <Icon name="info" className="text-sm mr-1 inline-block" />
                    These requirements are defined in the product template. Changes made here will only affect <strong>this specific client's</strong> instance.
                </p>
            </div>
        </Card>
    );
}
