import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface TermsCheckbox {
    id: string | number;
    text: string;
}

export interface TermsAndConditionsRequestProps {
    documentTitle: string;
    content: string;
    checkboxes: TermsCheckbox[];
    status: 'pending' | 'accepted';
    acceptDate?: string;
    onAccept?: () => void;
    className?: string;
}

export default function TermsAndConditionsRequest({
    documentTitle,
    content,
    checkboxes,
    status,
    acceptDate,
    onAccept,
    className = ''
}: TermsAndConditionsRequestProps) {
    const isAccepted = status === 'accepted';

    // Track which checkboxes are checked
    const [checkedState, setCheckedState] = useState<Record<string, boolean>>(
        (checkboxes || []).reduce((acc, cb) => ({ ...acc, [cb.id.toString()]: false }), {})
    );

    const allChecked = (checkboxes || []).every(cb => checkedState[cb.id.toString()]);

    const handleCheckboxChange = (id: string) => {
        if (isAccepted) return;
        setCheckedState(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAccept = () => {
        if (allChecked && onAccept) {
            onAccept();
        }
    };

    return (
        <div className={`${styles['terms-request']} ${className}`}>
            <div className={styles['terms-request__header']}>
                <h3 className={styles['terms-request__title-box']}>
                    <Icon name="gavel" className="text-emerald-500" /> Terms & Conditions
                </h3>
                {isAccepted ? (
                    <Badge variant="success">Accepted</Badge>
                ) : (
                    <Badge variant="warning">Action Required</Badge>
                )}
            </div>

            <div className={styles['terms-request__content']}>
                <div className={styles['terms-request__info']}>
                    <h4 className={styles['terms-request__doc-title']}>{documentTitle}</h4>
                </div>

                {/* Content Reader */}
                <div className={styles['terms-request__reader']}>
                    <div className={styles['terms-request__prose']}>
                        {content}
                    </div>
                </div>

                {isAccepted ? (
                    <div className={styles['terms-request__accepted-view']}>
                        <div className={styles['terms-request__accepted-info']}>
                            <Icon name="verified" className="text-emerald-500 text-2xl" />
                            <div>
                                <h5 className={styles['terms-request__accepted-title']}>Terms Accepted</h5>
                                <p className={styles['terms-request__accepted-subtext']}>
                                    You have agreed to all terms and conditions.
                                </p>
                            </div>
                        </div>
                        {acceptDate && (
                            <div className={styles['terms-request__accepted-date']}>
                                Accepted on {acceptDate}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div className={styles['terms-request__checkboxes-list']}>
                            {checkboxes?.map(cb => {
                                const isChecked = checkedState[cb.id.toString()];
                                const customCheckboxClass = `${styles['terms-request__checkbox-custom']} ${
                                    isChecked ? styles['terms-request__checkbox-custom--checked'] : ''
                                }`;

                                return (
                                    <label key={cb.id} className={styles['terms-request__checkbox-label']}>
                                        <div className={styles['terms-request__checkbox-input-box']}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckboxChange(cb.id.toString())}
                                                className="hidden"
                                            />
                                            <div className={customCheckboxClass}>
                                                {isChecked && (
                                                    <Icon 
                                                        name="check" 
                                                        style={{ fontSize: 14, color: 'white' }} 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <span className={styles['terms-request__checkbox-text']}>
                                            {cb.text}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        <div className={styles['terms-request__footer']}>
                            <Button
                                variant={allChecked ? "primary" : "secondary"}
                                className={styles['terms-request__accept-btn']}
                                onClick={handleAccept}
                                disabled={!allChecked}
                            >
                                <Icon name="task_alt" className="text-sm mr-2" /> Accept Terms
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
