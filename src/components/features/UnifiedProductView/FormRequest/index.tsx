import React, { useState } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import styles from './index.module.scss';

export interface FormField {
    id: string | number;
    label: string;
    type: string;
    required: boolean;
}

export interface FormRequestProps {
    formTitle: string;
    instructions: string;
    fields: FormField[];
    status: 'pending' | 'submitted' | 'approved';
    submitDate?: string;
    onSubmit?: (data: Record<string, string>) => void;
    className?: string;
}

export default function FormRequest({
    formTitle,
    instructions,
    fields,
    status,
    submitDate,
    onSubmit,
    className = ''
}: FormRequestProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});

    const isSubmitted = status === 'submitted' || status === 'approved';
    const isApproved = status === 'approved';

    const handleInputChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(formData);
        }
    };

    return (
        <div className={`${styles['form-request']} ${className}`}>
            <div className={styles['form-request__header']}>
                <h3 className={styles['form-request__title-box']}>
                    <Icon name="assignment" className={styles['form-request__form-icon']} /> 
                    Form Request
                </h3>
                {isApproved && <Badge variant="success">Approved</Badge>}
                {isSubmitted && !isApproved && <Badge variant="primary">Submitted</Badge>}
                {!isSubmitted && <Badge variant="warning">Action Required</Badge>}
            </div>

            <div className={styles['form-request__content']}>
                <div className={styles['form-request__info']}>
                    <h4 className={styles['form-request__form-title']}>{formTitle}</h4>
                    <p className={styles['form-request__instructions']}>{instructions}</p>
                </div>

                {isSubmitted ? (
                    <div className={styles['form-request__submitted-view']}>
                        <div className={styles['form-request__submitted-header']}>
                            <Icon name="check_circle" className="text-violet-500" />
                            <h5 className={styles['form-request__submitted-title']}>Responses Submitted</h5>
                            {submitDate && (
                                <span className={styles['form-request__submitted-date']}>
                                    on {submitDate}
                                </span>
                            )}
                        </div>
                        <div className={styles['form-request__responses-list']}>
                            {fields?.map(field => (
                                <div key={field.id} className={styles['form-request__response-row']}>
                                    <span className={styles['form-request__response-label']}>{field.label}</span>
                                    <span className={styles['form-request__response-value']}>
                                        {formData[field.id.toString()] || <span className={styles['form-request__not-provided']}>Not provided</span>}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className={styles['form-request__form-body']}>
                        {fields?.map(field => (
                            <div key={field.id} className={styles['form-request__field-group']}>
                                <label className={styles['form-request__field-label']}>
                                    {field.label}
                                    {field.required && <span className={styles['form-request__required-star']}>*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className={styles['form-request__textarea']}
                                        required={field.required}
                                        value={formData[field.id.toString()] || ''}
                                        onChange={(e) => handleInputChange(field.id.toString(), e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                ) : (
                                    <input
                                        type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
                                        className={styles['form-request__input']}
                                        required={field.required}
                                        value={formData[field.id.toString()] || ''}
                                        onChange={(e) => handleInputChange(field.id.toString(), e.target.value)}
                                        placeholder={`Enter ${field.label.toLowerCase()}`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className={styles['form-request__form-footer']}>
                            <Button type="submit" variant="primary" className={styles['form-request__submit-btn']}>
                                <Icon name="send" className="text-sm mr-2" /> Submit Responses
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
