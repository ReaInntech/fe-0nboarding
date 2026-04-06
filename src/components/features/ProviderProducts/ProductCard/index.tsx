import React from 'react';
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
    onClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
    const statusClass = styles[`product-card__status--${product.status}`];

    return (
        <div className={styles['product-card']} onClick={() => onClick?.(product)}>
            <div className={styles['product-card__header']}>
                <div
                    className={styles['product-card__icon-box']}
                    style={{ 
                        backgroundColor: `${product.iconColor}15`, 
                        color: product.iconColor,
                        borderColor: `${product.iconColor}30`
                    }}
                >
                    <Icon name={product.icon} className="text-2xl" />
                </div>
                <span className={`${styles['product-card__status']} ${statusClass}`}>
                    {product.status}
                </span>
            </div>

            <div className={styles['product-card__body']}>
                <h3 className={styles['product-card__title']}>
                    {product.name}
                </h3>
                <p className={styles['product-card__description']}>
                    {product.description}
                </p>
            </div>

            <div className={styles['product-card__stats']}>
                <div>
                    <span className={styles['product-card__label']}>Price</span>
                    <span className={styles['product-card__value']}>
                        ${product.price.toLocaleString()} 
                        <span className={styles['product-card__period']}>/{product.period === 'month' ? 'mo' : product.period}</span>
                    </span>
                </div>
                <div className="text-right">
                    <span className={styles['product-card__label']}>Total Sold</span>
                    <div className={styles['product-card__sold']}>
                        <Icon name="trending_up" className="text-[#1978e5]" />
                        <span>{product.sold}</span>
                    </div>
                </div>
            </div>

            <div className={styles['product-card__footer']}>
                <span className={styles['product-card__code']}>{product.productCode}</span>
                <button className={styles['product-card__details-btn']}>
                    Details <Icon name="chevron_right" />
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
