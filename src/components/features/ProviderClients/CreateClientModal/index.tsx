'use client';

import React, { useState, useEffect } from 'react';
import { CreateClientDTO, checkClientDomain, createProviderClient } from '@/src/lib/api/provider';
import Button from '@/src/components/shared/atoms/Button';
import Icon from '@/src/components/shared/atoms/Icon';
import styles from '../index.module.scss';

export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (client: any) => void;
  token?: string;
  orgId: string;
}

export default function CreateClientModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  orgId,
}: CreateClientModalProps) {
  const [singleForm, setSingleForm] = useState<CreateClientDTO>({
    legal_name: '',
    trade_name: '',
    email: '',
    client_type: 'legal_entity',
    tax_id: '',
    phone: '',
    country: 'Colombia',
    address: '',
    role: 'admin',
  });

  const [domainCheckStatus, setDomainCheckStatus] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string | null;
  }>({ checking: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Debounced domain availability check
  useEffect(() => {
    if (!singleForm.email || !singleForm.email.includes('@')) {
      setDomainCheckStatus({ checking: false });
      return;
    }

    const domain = singleForm.email.split('@')[1];
    if (!domain || !domain.includes('.')) {
      setDomainCheckStatus({ checking: false });
      return;
    }

    setDomainCheckStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const result = await checkClientDomain(domain, singleForm.email, token, orgId);
        setDomainCheckStatus({
          checking: false,
          available: result.available,
          reason: result.reason,
        });
      } catch {
        setDomainCheckStatus({ checking: false, available: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [singleForm.email, token, orgId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isNatural = singleForm.client_type === 'natural_person';
      const payload: CreateClientDTO = {
        ...singleForm,
        legal_name: singleForm.legal_name.trim(),
        admin_name: isNatural ? singleForm.legal_name.trim() : (singleForm.admin_name?.trim() || singleForm.legal_name.trim()),
        trade_name: isNatural ? undefined : (singleForm.trade_name?.trim() || undefined),
      };
      const res = await createProviderClient(payload, token, orgId);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      console.error('Error creating client:', err);
      setErrorMsg(err?.message || 'Error creating client organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['provider-clients__modal-backdrop']}>
      <div className={styles['provider-clients__modal']}>
        <div className={styles['provider-clients__modal-header']}>
          <h2 className={styles['provider-clients__modal-title']}>
            <Icon name="person_add" className="text-blue-400" />
            New Client Registration
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={styles['provider-clients__modal-close']}
          >
            <Icon name="close" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Entity Type Selector */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              type="button"
              onClick={() => setSingleForm({ ...singleForm, client_type: 'legal_entity' })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs transition-all ${
                singleForm.client_type === 'legal_entity'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="domain" className="text-base" />
              <span>Legal Entity (Company)</span>
            </button>
            <button
              type="button"
              onClick={() => setSingleForm({ ...singleForm, client_type: 'natural_person', trade_name: '' })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs transition-all ${
                singleForm.client_type === 'natural_person'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon name="person" className="text-base" />
              <span>Natural Person (Individual)</span>
            </button>
          </div>

          <div className={styles['provider-clients__form-grid']}>
            {singleForm.client_type === 'natural_person' ? (
              /* --- NATURAL PERSON FIELDS --- */
              <>
                <div className={`${styles['provider-clients__field-group']} ${styles['provider-clients__form-full']}`}>
                  <label className={styles['provider-clients__field-label']}>
                    Full Name (Person & Legal Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daniel Bernal"
                    value={singleForm.legal_name}
                    onChange={(e) => setSingleForm({ ...singleForm, legal_name: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    As a Natural Person, this name represents both the legal client and the platform user.
                  </p>
                </div>

                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>National ID / Document *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1020304050"
                    value={singleForm.tax_id || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, tax_id: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>

                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+57 300 000 0000"
                    value={singleForm.phone || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>
              </>
            ) : (
              /* --- LEGAL ENTITY FIELDS --- */
              <>
                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>
                    Company Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp LLC"
                    value={singleForm.legal_name}
                    onChange={(e) => setSingleForm({ ...singleForm, legal_name: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>

                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>
                    Trade Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme"
                    value={singleForm.trade_name || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, trade_name: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>

                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>Tax ID / NIT *</label>
                  <input
                    type="text"
                    required
                    placeholder="900.829.102-1"
                    value={singleForm.tax_id || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, tax_id: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>

                <div className={styles['provider-clients__field-group']}>
                  <label className={styles['provider-clients__field-label']}>
                    Admin Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juan Perez"
                    value={singleForm.admin_name || ''}
                    onChange={(e) => setSingleForm({ ...singleForm, admin_name: e.target.value })}
                    className={styles['provider-clients__input']}
                  />
                </div>
              </>
            )}

            {/* Email & Domain Check */}
            <div className={`${styles['provider-clients__field-group']} ${styles['provider-clients__form-full']}`}>
              <label className={styles['provider-clients__field-label']}>
                {singleForm.client_type === 'natural_person' ? 'Email Address *' : 'Administrator Corporate Email *'}
              </label>
              <input
                type="email"
                required
                placeholder={singleForm.client_type === 'natural_person' ? 'user@example.com' : 'admin@acme.com'}
                value={singleForm.email}
                onChange={(e) => setSingleForm({ ...singleForm, email: e.target.value })}
                className={styles['provider-clients__input']}
              />
              {domainCheckStatus.checking && (
                <div className={`${styles['provider-clients__domain-badge']} ${styles['provider-clients__domain-badge--checking']}`}>
                  <Icon name="sync" className="animate-spin text-xs" />
                  <span>Checking domain availability...</span>
                </div>
              )}
              {!domainCheckStatus.checking && domainCheckStatus.available === true && (
                <div className={`${styles['provider-clients__domain-badge']} ${styles['provider-clients__domain-badge--available']}`}>
                  <Icon name="check_circle" className="text-xs" />
                  <span>Domain available to register a new organization.</span>
                </div>
              )}
              {!domainCheckStatus.checking && domainCheckStatus.available === false && (
                <div className={`${styles['provider-clients__domain-badge']} ${styles['provider-clients__domain-badge--unavailable']}`}>
                  <Icon name="warning" className="text-xs" />
                  <span>{domainCheckStatus.reason || 'This domain is already registered by another organization.'}</span>
                </div>
              )}
            </div>

            {/* Country */}
            <div className={styles['provider-clients__field-group']}>
              <label className={styles['provider-clients__field-label']}>Country</label>
              <input
                type="text"
                placeholder="Colombia"
                value={singleForm.country || 'Colombia'}
                onChange={(e) => setSingleForm({ ...singleForm, country: e.target.value })}
                className={styles['provider-clients__input']}
              />
            </div>

            {singleForm.client_type === 'legal_entity' && (
              <div className={styles['provider-clients__field-group']}>
                <label className={styles['provider-clients__field-label']}>Company Phone</label>
                <input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={singleForm.phone || ''}
                  onChange={(e) => setSingleForm({ ...singleForm, phone: e.target.value })}
                  className={styles['provider-clients__input']}
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              <div className="flex items-center gap-2">
                <Icon name={isSubmitting ? 'sync' : 'send'} className={isSubmitting ? 'animate-spin' : ''} />
                <span>{isSubmitting ? 'Registering...' : 'Register & Send Invitation'}</span>
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
