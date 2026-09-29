import React, { useState } from 'react';
import Modal from '../Modal';
import Input from '../../atoms/Input';
import Icon from '../../atoms/Icon';
import * as api from '@/src/lib/api/provider';
import { useApp } from '@/src/context/AppContext';

export interface CreateSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    productPrice: number;
    productId: string;
    productBillingPeriod?: string;
    productMetadata?: Record<string, any>;
    onSuccess?: () => void;
}

export default function CreateSubscriptionModal({
    isOpen,
    onClose,
    productPrice,
    productId,
    productBillingPeriod = 'monthly',
    productMetadata = {},
    onSuccess,
}: CreateSubscriptionModalProps) {
    const { user } = useApp();
    const [step, setStep] = useState<1 | 2>(1);
    
    // Step 1: Validation
    const [email, setEmail] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [clientData, setClientData] = useState<any>(null);
    const [error, setError] = useState('');
    const [hasChecked, setHasChecked] = useState(false);
    
    // Step 1.5: Creation if not found
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    
    const [price, setPrice] = useState<string>(String(productPrice));
    const [overridePrice, setOverridePrice] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Metadata Overrides
    const [metadataOverrides, setMetadataOverrides] = useState<Record<string, string>>({});
    const [showMetadataSection, setShowMetadataSection] = useState(false);

    // Filter editable attributes
    const editableAttributes = Object.entries(productMetadata)
        .filter(([, data]) => typeof data === 'object' && data?.isCustomByUser === true);

    // Reset state on close/open
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setEmail('');
            setClientData(null);
            setError('');
            setHasChecked(false);
            setPrice(String(productPrice));
            setOverridePrice(false);
            setMetadataOverrides({});
            setShowMetadataSection(false);
        }
    }, [isOpen, productPrice]);

    const handleValidateEmail = async () => {
        if (!email) return;
        setIsValidating(true);
        setError('');
        setHasChecked(true);
        try {
            const token = user?.accessToken || '';
            const orgId = user?.organization?.id || '';
            const res: any = await api.checkEmail(email, token, orgId);
            
            if (res.exists) {
                setClientData(res.user);
                setStep(2);
            } else if (res.isSelf) {
                setError('No puedes crear una suscripción para ti mismo.');
            } else {
                setClientData(null);
            }
        } catch (e) {
            setError('Error validando el correo.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleCreateClient = async () => {
        setIsCreatingClient(true);
        setError('');
        try {
            const token = user?.accessToken || '';
            const orgId = user?.organization?.id || '';
            const newOrg: any = await api.createClientOrganization(token, orgId, {
                legal_name: newClientName,
                email: email,
            });
            setClientData({
                id: newOrg.id,
                full_name: newClientName,
                client_id: newOrg.id,
                organization: { legal_name: newOrg.legal_name || newClientName }
            });
            setStep(2);
        } catch (e) {
            setError('Error creando el cliente.');
        } finally {
            setIsCreatingClient(false);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = user?.accessToken || '';
            const orgId = user?.organization?.id || '';
            await api.createSubscription(token, orgId, {
                product_id: productId,
                client_id: clientData?.client_id,
                price: Number(String(price).replace(/,/g, '')),
                product_metadata_override: Object.keys(metadataOverrides).length > 0 ? metadataOverrides : undefined,
            });
            onSuccess?.();
            onClose();
        } catch (e) {
            setError('Error creando la suscripción.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderFooter = () => {
        if (step === 1) {
            return (
                <div className="flex justify-end gap-3 w-full">
                    <button className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition text-sm" onClick={onClose}>
                        Cancelar
                    </button>
                    {!clientData && (!hasChecked || error) && (
                        <button 
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                            onClick={handleValidateEmail}
                            disabled={!email || isValidating}
                        >
                            {isValidating ? 'Validando...' : 'Validar Correo'}
                            <Icon name="search" className="text-sm" />
                        </button>
                    )}
                    {!clientData && hasChecked && !error && (
                        <button 
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                            onClick={handleCreateClient}
                            disabled={!newClientName || isCreatingClient}
                        >
                            {isCreatingClient ? 'Creando...' : 'Crear Cliente'}
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="flex justify-end gap-3 w-full">
                <button className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition text-sm" onClick={() => setStep(1)}>
                    Atrás
                </button>
                <button 
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-50"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Guardando...' : 'Crear Suscripción'}
                    <Icon name="check" className="text-sm" />
                </button>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Agregar Cliente a Producto"
            size="md"
            footer={renderFooter()}
        >
            <div className="flex flex-col gap-6 py-2">
                {error && (
                    <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}
                
                {step === 1 && (
                    <div className="flex flex-col gap-4">
                        <Input
                            label="Correo Electrónico"
                            placeholder="cliente@empresa.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setHasChecked(false);
                            }}
                            disabled={isValidating}
                        />
                        {hasChecked && !clientData && !error && (
                            <div className="flex flex-col gap-4 mt-2 p-4 border border-slate-700/50 rounded-lg bg-slate-800/30">
                                <p className="text-sm text-slate-300">
                                    El correo no existe en la plataforma. Por favor, ingresa su nombre para agregarlo.
                                </p>
                                <Input
                                    label="Nombre Completo / Empresa"
                                    placeholder="Nombre del cliente"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <Icon name="person" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">
                                    {clientData?.organization?.legal_name || clientData?.full_name}
                                </p>
                                <p className="text-xs text-slate-400">{email}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between border border-slate-700/50 rounded-lg p-3 bg-slate-800/20">
                                <span className="text-sm text-slate-300">Precio Base del Producto</span>
                                <span className="text-sm font-medium text-slate-200">${productPrice}</span>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer mt-1">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                                    checked={overridePrice}
                                    onChange={(e) => {
                                        setOverridePrice(e.target.checked);
                                        if (!e.target.checked) setPrice(String(productPrice));
                                    }}
                                />
                                <span className="text-sm text-slate-300 select-none">Habilitar edición de precio (Precio Promocional)</span>
                            </label>

                            <Input
                                label="Precio Final"
                                type="currency"
                                prefix="$"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                disabled={!overridePrice}
                            />

                            <div className="flex items-center justify-between border border-slate-700/50 rounded-lg p-3 bg-slate-800/20">
                                <span className="text-sm text-slate-300">Periodo de Cobro</span>
                                <span className="text-sm font-medium text-slate-200 capitalize">
                                    {productBillingPeriod === 'monthly' ? 'Mensual' : productBillingPeriod === 'annual' ? 'Anual' : productBillingPeriod}
                                    <span className="text-xs text-slate-500 ml-1">(definido por el producto)</span>
                                </span>
                            </div>

                            {/* Metadata Overrides Section */}
                            {editableAttributes.length > 0 && (
                                <div className="mt-2 border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/10">
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between p-3 hover:bg-slate-800/30 transition-colors"
                                        onClick={() => setShowMetadataSection(!showMetadataSection)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon name="tune" className="text-blue-400 text-sm" />
                                            <span className="text-sm font-medium text-slate-200">Personalizar Atributos (Opcional)</span>
                                        </div>
                                        <Icon 
                                            name={showMetadataSection ? "expand_less" : "expand_more"} 
                                            className="text-slate-400" 
                                        />
                                    </button>

                                    {showMetadataSection && (
                                        <div className="p-4 pt-0 flex flex-col gap-4 border-t border-slate-700/50 animate-in slide-in-from-top-1 duration-200">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-3 mb-1">
                                                Valores específicos para esta suscripción
                                            </p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {editableAttributes.map(([key, data]: [string, any]) => (
                                                    <Input
                                                        key={key}
                                                        label={key}
                                                        placeholder={data.value || "Ingrese valor"}
                                                        value={metadataOverrides[key] ?? data.value ?? ''}
                                                        onChange={(e) => setMetadataOverrides(prev => ({
                                                            ...prev,
                                                            [key]: e.target.value
                                                        }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
