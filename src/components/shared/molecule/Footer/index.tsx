'use client';

import React from 'react';
import Icon from '../../atoms/Icon';
import { useProviderBranding } from '@/src/context/BrandContext';
import styles from './index.module.scss';

export default function Footer() {
    const { branding } = useProviderBranding();
    const brandName = branding?.name || '0nbording';
    const year = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles['footer__container']}>
                <div className={styles['footer__brand']}>
                    <Icon name="hub" className={styles['footer__brand-icon']} />
                    <span className={styles['footer__copyright']}>© {year} {brandName}. All rights reserved.</span>
                </div>
                <div className={styles['footer__links']}>
                    <a className={styles['footer__link']} href="#">Privacy Policy</a>
                    <a className={styles['footer__link']} href="#">Terms of Service</a>
                    <a className={styles['footer__link']} href="#">Contact Support</a>
                </div>
            </div>
        </footer>
    );
}
