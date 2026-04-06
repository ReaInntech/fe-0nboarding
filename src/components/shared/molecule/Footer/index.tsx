import React from 'react';
import Icon from '../../atoms/Icon';
import styles from './index.module.scss';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles['footer__container']}>
                <div className={styles['footer__brand']}>
                    <Icon name="hub" className={styles['footer__brand-icon']} />
                    <span className={styles['footer__copyright']}>© 2024 Enterprise Cloud Services. All rights reserved.</span>
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
