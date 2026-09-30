import React from 'react';
import Link from 'next/link';
import Icon from '../../../shared/atoms/Icon';
import styles from './index.module.scss';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    period: string; // 'month', 'year', etc.
    sold: number;
    productCode: string;
    category: string;
    status: 'active' | 'maintenance' | 'inactive';
    icon: string;
    iconColor: string;
}

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const statusClass = styles[`product-card__status--${product?.status}`] || styles['product-card__status--active'];
    const price = typeof product?.price === 'number' ? product.price : Number(product?.price) || 0;
    const period = product?.period === 'month' ? 'mo' : (product?.period || 'mo');
    const color = product?.iconColor?.startsWith('#') || product?.iconColor?.startsWith('rgb') ? product.iconColor : '#1978e5';

    return (
        <Link 
            href={`/provider/products/${product?.id || ''}`}
            className={styles['product-card']} 
            style={{ 
                '--icon-color': color,
                '--icon-bg': `${color}15`
            } as React.CSSProperties}
        >
            <div className={styles['product-card__header']}>
                <div className={styles['product-card__icon-box']}>
                    <Icon name={product?.icon || 'inventory_2'} className="text-2xl" />
                </div>
                <span className={`${styles['product-card__status']} ${statusClass}`}>
                    {product?.status || 'active'}
                </span>
            </div>

            <div className={styles['product-card__body']}>
                <h3 className={styles['product-card__title']}>
                    {product?.name || 'Untitled Product'}
                </h3>
                <p className={styles['product-card__description']}>
                    {product?.description || 'No description provided.'}
                </p>
            </div>

            <div className={styles['product-card__stats']}>
                <div className={styles['product-card__stat-item']}>
                    <span className={styles['product-card__label']}>Price</span>
                    <span className={styles['product-card__value']}>
                        ${price.toLocaleString()} 
                        <span className={styles['product-card__period']}>/{period}</span>
                    </span>
                </div>
                <div className={styles['product-card__stat-item']}>
                    <span className={styles['product-card__label']}>Total Sold</span>
                    <div className={styles['product-card__sold']}>
                        <Icon name="trending_up" className="text-[#1978e5] text-sm" />
                        <span>{product?.sold ?? 0}</span>
                    </div>
                </div>
            </div>

            <div className={styles['product-card__footer']}>
                <span className={styles['product-card__code']}>{product?.productCode || 'N/A'}</span>
                <div className={styles['product-card__details-btn']}>
                    Details <Icon name="chevron_right" />
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
