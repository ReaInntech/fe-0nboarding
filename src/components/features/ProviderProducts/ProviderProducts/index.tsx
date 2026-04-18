'use client';

import React, { useState } from 'react';
import { useApp } from '@/src/context/AppContext';
import ProviderTopNavigation from '../../../shared/molecule/ProviderTopNavigation';
import Footer from '../../../shared/molecule/Footer';
import Icon from '../../../shared/atoms/Icon';
import PageHeader from '../../../shared/atoms/PageHeader';
import Modal from '../../../shared/molecule/Modal';
import Button from '../../../shared/atoms/Button';
import ProductCard, { Product } from '../ProductCard';
import ProviderProductForm, { ProductFormData } from '../../ProviderProductView/ProviderProductHeader/ProviderProductForm';
import { createProduct } from '@/src/lib/api/provider';
import styles from './index.module.scss';

interface ProviderProductsProps {
    initialProducts: Product[];
    userProfile?: any;
}

const ProviderProducts: React.FC<ProviderProductsProps> = ({ initialProducts, userProfile }) => {
    const { user } = useApp();
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.productCode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterCategory('All');
    };

    const handleCreateProduct = async (formData: ProductFormData) => {
        if (!user) return;
        
        setIsSubmitting(true);
        try {
            const orgId = user.org_id || user.organization?.id;
            
            if (!orgId) {
                throw new Error('Organization context missing');
            }

            // Map form data to DTO
            const dto = {
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                icon_color: formData.color,
                product_code: formData.name.toUpperCase().replace(/\s+/g, '_') + '_' + Math.floor(Math.random() * 1000), // Helper for mock code
                service_type: formData.billing, // Maps Billing Model to service_type as per backend schema
                deployment_region: 'us-east-1' // Default for now
            };

            const response: any = await createProduct(undefined, orgId, dto);
            
            // Add to local state (assuming the response contains the new product or we map it)
            const newProduct: Product = {
                id: response.id || `prod_${Date.now()}`,
                name: dto.name,
                description: dto.description || '',
                price: Number(formData.price) || 0,
                period: formData.billing === 'monthly' ? 'month' : 'annual',
                sold: 0,
                productCode: dto.product_code,
                category: 'General', // Default
                status: (formData.status as any) || 'active',
                icon: dto.icon,
                iconColor: dto.icon_color
            };

            setProducts([newProduct, ...products]);
            setIsCreateModalOpen(false);
            alert('Product created successfully!');
        } catch (error: any) {
            console.error('Error creating product:', error);
            alert(`Failed to create product: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
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
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-2.5 border-none cursor-pointer"
                        >
                            <Icon name="add" className="text-xl" />
                            Create New Product
                        </button>
                    }
                />

                {/* Filters ... */}
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
                            {categories.map((cat, index) => (
                                <button
                                    key={`category-${cat || 'none'}-${index}`}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`${styles['provider-products__category-btn']} ${filterCategory === cat ? styles['provider-products__category-btn--active'] : ''}`}
                                >
                                    {cat || 'Uncategorized'}
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

            {/* Creation Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
                title="Create New Product"
                size="lg"
            >
                <ProviderProductForm 
                    initialData={{
                        name: '',
                        description: '',
                        icon: 'rocket_launch',
                        color: '#1978e5',
                        price: '',
                        billing: 'monthly',
                        status: 'active'
                    }}
                    onSave={handleCreateProduct}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isSubmitting={isSubmitting}
                    submitLabel="Guardar"
                    cancelLabel="Cerrar"
                />
            </Modal>
        </div>
    );
};

export default ProviderProducts;
