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
      const res = await createProviderClient(singleForm, token, orgId);
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
          <div className={styles['provider-clients__form-grid']}>
            {/* Legal Name */}
            <div className={styles['provider-clients__field-group']}>
              <label className={styles['provider-clients__field-label']}>
                Legal Name *
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

            {/* Trade Name */}
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

            {/* Corporate Email & Domain Validation */}
            <div className={`${styles['provider-clients__field-group']} ${styles['provider-clients__form-full']}`}>
              <label className={styles['provider-clients__field-label']}>
                Administrator Corporate Email *
              </label>
              <input
                type="email"
                required
                placeholder="admin@acme.com"
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

            {/* Client Type */}
            <div className={styles['provider-clients__field-group']}>
              <label className={styles['provider-clients__field-label']}>Entity Type</label>
              <select
                value={singleForm.client_type || 'legal_entity'}
                onChange={(e) => setSingleForm({ ...singleForm, client_type: e.target.value as any })}
                className={styles['provider-clients__select']}
              >
                <option value="legal_entity">Legal Entity (Company / Org)</option>
                <option value="natural_person">Natural Person (Individual)</option>
              </select>
            </div>

            {/* Tax ID */}
            <div className={styles['provider-clients__field-group']}>
              <label className={styles['provider-clients__field-label']}>Tax ID / NIT / Document</label>
              <input
                type="text"
                placeholder="900.829.102-1"
                value={singleForm.tax_id || ''}
                onChange={(e) => setSingleForm({ ...singleForm, tax_id: e.target.value })}
                className={styles['provider-clients__input']}
              />
            </div>

            {/* Phone */}
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
