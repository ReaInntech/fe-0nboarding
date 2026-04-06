import React from 'react';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface PaymentMethod {
    typeLabel: string;
    name: string;
    lastFour: string;
    holder: string;
    expiry: string;
    brand: string;
    primary?: boolean;
}

export interface PaymentMethodsContainerProps {
    methods: PaymentMethod[];
    className?: string;
}

export default function PaymentMethodsContainer({ methods = [], className }: PaymentMethodsContainerProps) {
    return (
        <div className={`${styles['payment-methods']} ${className || ''}`}>
            {methods?.map((method, idx) => (
                <div key={idx} className={`${styles['payment-methods__card']} ${method.primary ? styles['payment-methods__card--primary'] : styles['payment-methods__card--secondary']}`}>
                    <div className={`${styles['payment-methods__bg-gradient']} ${method.primary ? styles['payment-methods__bg-gradient--primary'] : styles['payment-methods__bg-gradient--secondary']}`}></div>
                    
                    <div className={styles['payment-methods__header']}>
                        <div className={styles['payment-methods__info']}>
                            <p className={styles['payment-methods__type-label']}>{method.typeLabel}</p>
                            <p className={styles['payment-methods__name']}>{method.name}</p>
                        </div>
                        <div className={styles['payment-methods__actions']}>
                            <button className={styles['payment-methods__remove-btn']} title="Remove">
                                <Icon name="delete" className={styles['payment-methods__remove-icon']} />
                            </button>
                        </div>
                    </div>

                    <div className={styles['payment-methods__body']}>
                        <div className={styles['payment-methods__card-number']}>
                            <span>****</span>
                            <span>{method.lastFour}</span>
                        </div>
                        <div className={styles['payment-methods__bottom']}>
                            <div className={styles['payment-methods__details']}>
                                <div className={styles['payment-methods__detail-group']}>
                                    <p className={styles['payment-methods__detail-label']}>Holder</p>
                                    <p className={styles['payment-methods__detail-value']}>{method.holder}</p>
                                </div>
                                <div className={styles['payment-methods__detail-group']}>
                                    <p className={styles['payment-methods__detail-label']}>Expires</p>
                                    <p className={styles['payment-methods__detail-value']}>{method.expiry}</p>
                                </div>
                            </div>
                            <div className={styles['payment-methods__brand']}>
                                {method.brand === 'mastercard' ? (
                                    <>
                                        <div className="size-6 rounded-full bg-red-500/80 -mr-3"></div>
                                        <div className="size-6 rounded-full bg-orange-400/80"></div>
                                    </>
                                ) : (
                                    <div className="size-10 bg-white/10 rounded flex items-center justify-center backdrop-blur-sm">
                                        <Icon name="credit_card" className="text-2xl text-white opacity-60" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
