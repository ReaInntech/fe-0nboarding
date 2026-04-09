'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import Icon from '../../../shared/atoms/Icon';
import PageHeader from '../../../shared/atoms/PageHeader';
import ProductCard, { Product } from '../ProductCard';
import styles from './index.module.scss';

interface ProviderProductsProps {
    initialProducts: Product[];
    userProfile?: any;
}

const ProviderProducts: React.FC<ProviderProductsProps> = ({ initialProducts, userProfile }) => {
    const { user } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    const categories = ['All', ...Array.from(new Set(initialProducts.map(p => p.category)))];

    const filteredProducts = initialProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
    };

    return (
        <div className={styles['provider-products']}>
            <ProviderTopNavigation activeTab="Products" userProfile={userProfile} />
            <main className={styles['provider-products__main']}>
                <PageHeader
                    title={<>Products & <span className="text-blue-500">Services</span></>}
                    subtitle="Manage your organization's catalog and offerings from a single centralized dashboard."
                    badge={{ text: "Catalog Management", icon: "inventory_2" }}
                    centered={true}
                    actions={
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2.5 border-none cursor-pointer">
                            <Icon name="add" className="text-xl" />
                            Create New Product
                        </button>
                    }
                />

                <section className={styles['provider-products__filters-bar']}>
                    <div className={styles['provider-products__search-wrapper']}>
                        <div className={styles['provider-products__search-icon']}>
                            <Icon name="search" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or product code..."
                            className={styles['provider-products__search-input']}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className={styles['provider-products__categories-wrapper']}>
                        <span className={styles['provider-products__categories-label']}>Category</span>
                        <div className={styles['provider-products__categories-list']}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`${styles['provider-products__category-btn']} ${filterCategory === cat ? styles['provider-products__category-btn--active'] : ''}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {filteredProducts.length > 0 ? (
                    <div className={styles['provider-products__grid']}>
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className={styles['provider-products__empty']}>
                        <div className={styles['provider-products__empty-icon']}>
                            <Icon name="search_off" />
                        </div>
                        <h3 className={styles['provider-products__empty-title']}>No products found</h3>
                        <p className={styles['provider-products__empty-text']}>
                            Adjust your filters or try a different search term to find what you're looking for.
                        </p>
                        <button
                            onClick={handleClearFilters}
                            className={styles['provider-products__clear-btn']}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProviderProducts;
