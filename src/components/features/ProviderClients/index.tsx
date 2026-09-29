'use client';

import React, { useState, useEffect } from 'react';
import {
  ProviderClient,
  ProviderClientsMetrics,
  CreateClientDTO,
  createProviderClient,
  checkClientDomain,
  bulkImportClients,
  BulkImportResult
} from '@/src/lib/api/provider';
import Button from '@/src/components/shared/atoms/Button';
import Icon from '@/src/components/shared/atoms/Icon';
import ProviderTopNavigation from '../../shared/molecule/ProviderTopNavigation';
import Footer from '../../shared/molecule/Footer';
import styles from './index.module.scss';

export interface ProviderClientsProps {
  initialClients: ProviderClient[];
  initialMetrics: ProviderClientsMetrics;
  orgId: string;
  token?: string;
  userProfile?: any;
}

export default function ProviderClients({
  initialClients,
  initialMetrics,
  orgId,
  token,
}: ProviderClientsProps) {
  const [clients, setClients] = useState<ProviderClient[]>(initialClients);
  const [metrics, setMetrics] = useState<ProviderClientsMetrics>(initialMetrics);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'in_progress' | 'suspended'>('all');

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // --- Single Client Form State (RF-PV-29) ---
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
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

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
      } catch (err) {
        setDomainCheckStatus({ checking: false, available: true });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [singleForm.email, token, orgId]);

  const handleCreateSingleClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.legal_name || !singleForm.email) {
      showNotification('error', 'Legal name and corporate email are required.');
      return;
    }

    setIsSubmittingSingle(true);
    try {
      const res: any = await createProviderClient(singleForm, token, orgId);
      showNotification('success', res.message || 'Client created and invitation delivered.');

      // Update local state
      const newClientEntry: ProviderClient = {
        id: res.client?.id || `org-cli-${Date.now()}`,
        legal_name: singleForm.legal_name,
        trade_name: singleForm.trade_name || singleForm.legal_name,
        dominio: singleForm.email.split('@')[1] || 'client.local',
        email: singleForm.email,
        phone: singleForm.phone || '',
        country: singleForm.country || 'Colombia',
        client_type: singleForm.client_type || 'legal_entity',
        created_at: new Date().toISOString(),
        subscriptions_count: 0,
        active_subscriptions_count: 0,
        status: 'in_progress',
      };

      setClients([newClientEntry, ...clients]);
      setMetrics((prev) => ({
        ...prev,
        total: prev.total + 1,
        in_progress: prev.in_progress + 1,
      }));

      setIsSingleModalOpen(false);
      setSingleForm({
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
    } catch (err: any) {
      console.error('Failed to create client:', err);
      showNotification('error', err?.message || 'Error creating client.');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // --- Bulk CSV State (RF-PV-30) ---
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Array<CreateClientDTO & { isValid: boolean; error?: string }>>([]);
  const [isImportingBulk, setIsImportingBulk] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);

  const handleCsvFileUpload = (file: File) => {
    setCsvFile(file);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        showNotification('error', 'CSV file contains no records.');
        return;
      }

      // Read header
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const legalNameIdx = headers.findIndex((h) => h.includes('legal') || h.includes('name') || h.includes('razon'));
      const tradeNameIdx = headers.findIndex((h) => h.includes('trade') || h.includes('comercial'));
      const emailIdx = headers.findIndex((h) => h.includes('email') || h.includes('correo'));
      const typeIdx = headers.findIndex((h) => h.includes('type') || h.includes('tipo'));
      const roleIdx = headers.findIndex((h) => h.includes('role') || h.includes('rol'));
      const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('telefono'));

      const rows: Array<CreateClientDTO & { isValid: boolean; error?: string }> = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const legal_name = legalNameIdx >= 0 ? cols[legalNameIdx] : cols[0];
        const trade_name = tradeNameIdx >= 0 ? cols[tradeNameIdx] : legal_name;
        const email = emailIdx >= 0 ? cols[emailIdx] : cols[1];
        const client_type = (typeIdx >= 0 && cols[typeIdx]?.includes('natural')) ? 'natural_person' : 'legal_entity';
        const role = (roleIdx >= 0 && cols[roleIdx]) ? (cols[roleIdx] as any) : 'admin';
        const phone = phoneIdx >= 0 ? cols[phoneIdx] : '';

        const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isValid = Boolean(legal_name && isValidEmail);
        const error = !legal_name ? 'Missing legal name' : !isValidEmail ? 'Invalid email format' : undefined;

        rows.push({
          legal_name: legal_name || '',
          trade_name: trade_name || legal_name || '',
          email: email || '',
          client_type,
          role,
          phone,
          isValid,
          error,
        });
      }

      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleConfirmBulkImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      showNotification('error', 'No valid rows found to import.');
      return;
    }

    setIsImportingBulk(true);
    try {
      const result = await bulkImportClients(validRows, token, orgId);
      setBulkResult(result);
      showNotification(
        'success',
        `Bulk import complete: ${result.summary.successful} succeeded, ${result.summary.failed} failed.`
      );

      // Refresh list with new clients
      if (result.successList && result.successList.length > 0) {
        const newItems: ProviderClient[] = result.successList.map((item) => ({
          id: item.client.id,
          legal_name: item.client.legal_name,
          trade_name: item.client.trade_name || item.client.legal_name,
          dominio: item.client.dominio,
          email: item.client.email,
          phone: item.client.phone,
          country: item.client.country || 'Colombia',
          client_type: item.client.client_type,
          created_at: new Date().toISOString(),
          subscriptions_count: 0,
          active_subscriptions_count: 0,
          status: 'in_progress',
        }));

        setClients((prev) => [...newItems, ...prev]);
        setMetrics((prev) => ({
          ...prev,
          total: prev.total + newItems.length,
          in_progress: prev.in_progress + newItems.length,
        }));
      }
    } catch (err: any) {
      console.error('Bulk import error:', err);
      showNotification('error', err?.message || 'Error processing batch.');
    } finally {
      setIsImportingBulk(false);
    }
  };

  const downloadExampleCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,legal_name,trade_name,email,client_type,role,phone\nAcme Cloud Latam S.A.S.,Acme Cloud,contacto@acmelatam.com,legal_entity,admin,+573001234567\nCarlos Martinez,Martinez Consultores,carlos@martinezconsultores.com,natural_person,admin,+573109876543\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'plantilla_clientes_0nbording.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.trade_name && c.trade_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.dominio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.status === 'active') ||
      (statusFilter === 'in_progress' && c.status === 'in_progress') ||
      (statusFilter === 'suspended' && c.status === 'suspended');

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles['provider-clients']}>
      <div className={styles['provider-clients__container']}>
        {/* Page Header */}
        <div className={styles['provider-clients__header']}>
          <div className={styles['provider-clients__header-title-box']}>
            <div className={styles['provider-clients__header-icon']}>
              <Icon name="people" />
            </div>
            <div>
              <h1 className={styles['provider-clients__title']}>Clients Directory</h1>
              <p className={styles['provider-clients__subtitle']}>
                Monitor registered client organizations, onboarding progress, and manage individual or bulk access.
              </p>
            </div>
          </div>

          <div className={styles['provider-clients__actions']}>
            <Button variant="outline" onClick={() => setIsBulkModalOpen(true)}>
              <div className="flex items-center gap-2 text-slate-300">
                <Icon name="upload_file" />
                <span>Bulk CSV Import</span>
              </div>
            </Button>
            <Button variant="primary" onClick={() => setIsSingleModalOpen(true)}>
              <div className="flex items-center gap-2">
                <Icon name="person_add" />
                <span>New Client</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Quick KPI Metric Cards */}
        <div className={styles['provider-clients__metrics-grid']}>
          <div className={styles['provider-clients__metric-card']}>
            <div className={styles['provider-clients__metric-header']}>
              <span>Total Clients</span>
              <Icon name="business" className="text-blue-400" />
            </div>
            <div className={styles['provider-clients__metric-value']}>{metrics.total}</div>
            <div className={styles['provider-clients__metric-subtext']}>Registered client entities</div>
          </div>

          <div className={styles['provider-clients__metric-card']}>
            <div className={styles['provider-clients__metric-header']}>
              <span>Active Subscriptions</span>
              <Icon name="verified" className="text-emerald-400" />
            </div>
            <div className={styles['provider-clients__metric-value']}>{metrics.active}</div>
            <div className={styles['provider-clients__metric-subtext']}>Fully onboarded & active</div>
          </div>

          <div className={styles['provider-clients__metric-card']}>
            <div className={styles['provider-clients__metric-header']}>
              <span>In Homologation</span>
              <Icon name="hourglass_top" className="text-amber-400" />
            </div>
            <div className={styles['provider-clients__metric-value']}>{metrics.in_progress}</div>
            <div className={styles['provider-clients__metric-subtext']}>Pending review or setup</div>
          </div>

          <div className={styles['provider-clients__metric-card']}>
            <div className={styles['provider-clients__metric-header']}>
              <span>Suspended / Stalled</span>
              <Icon name="pause_circle" className="text-rose-400" />
            </div>
            <div className={styles['provider-clients__metric-value']}>{metrics.suspended}</div>
            <div className={styles['provider-clients__metric-subtext']}>Requires operational attention</div>
          </div>
        </div>

        {/* Controls: Search & Status Filter Tabs */}
        <div className={styles['provider-clients__controls-bar']}>
          <div className={styles['provider-clients__search-box']}>
            <Icon name="search" className={styles['provider-clients__search-icon']} />
            <input
              type="text"
              placeholder="Search by legal name, commercial name, domain, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles['provider-clients__search-input']}
            />
          </div>

          <div className={styles['provider-clients__filter-tabs']}>
            <button
              type="button"
              className={`${styles['provider-clients__filter-tab']} ${statusFilter === 'all' ? styles['provider-clients__filter-tab--active'] : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Clients ({clients.length})
            </button>
            <button
              type="button"
              className={`${styles['provider-clients__filter-tab']} ${statusFilter === 'active' ? styles['provider-clients__filter-tab--active'] : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active ({metrics.active})
            </button>
            <button
              type="button"
              className={`${styles['provider-clients__filter-tab']} ${statusFilter === 'in_progress' ? styles['provider-clients__filter-tab--active'] : ''}`}
              onClick={() => setStatusFilter('in_progress')}
            >
              In Onboarding ({metrics.in_progress})
            </button>
            <button
              type="button"
              className={`${styles['provider-clients__filter-tab']} ${statusFilter === 'suspended' ? styles['provider-clients__filter-tab--active'] : ''}`}
              onClick={() => setStatusFilter('suspended')}
            >
              Suspended ({metrics.suspended})
            </button>
          </div>
        </div>

        {/* Clients Table */}
        <div className={styles['provider-clients__table-wrapper']}>
          {filteredClients.length > 0 ? (
            <table className={styles['provider-clients__table']}>
              <thead className={styles['provider-clients__thead']}>
                <tr>
                  <th>Client Organization</th>
                  <th>Contact Details</th>
                  <th>Entity Type</th>
                  <th>Active Products</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className={styles['provider-clients__tbody']}>
                {filteredClients.map((client) => {
                  const initialLetter = client.trade_name?.charAt(0) || client.legal_name?.charAt(0) || 'C';
                  return (
                    <tr key={client.id}>
                      {/* Identity */}
                      <td>
                        <div className={styles['provider-clients__client-identity']}>
                          <div className={styles['provider-clients__client-avatar']}>
                            {initialLetter}
                          </div>
                          <div>
                            <div className={styles['provider-clients__client-name']}>
                              {client.trade_name || client.legal_name}
                            </div>
                            <div className={styles['provider-clients__client-domain']}>
                              <Icon name="link" className="text-xs" />
                              {client.dominio}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="space-y-0.5">
                          <div className="text-slate-200 font-medium">{client.email}</div>
                          <div className="text-[11px] text-slate-500">{client.phone || client.country || 'N/A'}</div>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300">
                          {client.client_type === 'natural_person' ? 'Natural Person' : 'Legal Entity'}
                        </span>
                      </td>

                      {/* Subscriptions */}
                      <td>
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-200">
                            {client.subscriptions_count} {client.subscriptions_count === 1 ? 'Subscription' : 'Subscriptions'}
                          </span>
                          {client.subscriptions && client.subscriptions.length > 0 && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              {client.subscriptions.map((s) => s.productName).filter(Boolean).join(', ')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={`${styles['provider-clients__status-badge']} ${client.status === 'active'
                              ? styles['provider-clients__status-badge--active']
                              : client.status === 'in_progress'
                                ? styles['provider-clients__status-badge--in_progress']
                                : styles['provider-clients__status-badge--suspended']
                            }`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          {client.status === 'active'
                            ? 'Active'
                            : client.status === 'in_progress'
                              ? 'In Onboarding'
                              : 'Suspended'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <Button variant="ghost" size="sm">
                          <div className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                            <Icon name="launch" className="text-xs" />
                            <span>Details</span>
                          </div>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className={styles['provider-clients__empty']}>
              <div className={styles['provider-clients__empty-icon']}>
                <Icon name="search_off" />
              </div>
              <p className="text-sm font-semibold text-white">No clients found</p>
              <p className="text-xs text-slate-500">
                Try modifying your search criteria or register a new client using the button above.
              </p>
            </div>
          )}
        </div>

        {/* --- MODAL 1: Individual Client Onboarding (RF-PV-29) --- */}
        {isSingleModalOpen && (
          <div className={styles['provider-clients__modal-backdrop']}>
            <div className={styles['provider-clients__modal']}>
              <div className={styles['provider-clients__modal-header']}>
                <h2 className={styles['provider-clients__modal-title']}>
                  <Icon name="person_add" className="text-blue-400" />
                  New Client Registration (RF-PV-29)
                </h2>
                <button
                  type="button"
                  onClick={() => setIsSingleModalOpen(false)}
                  className={styles['provider-clients__modal-close']}
                >
                  <Icon name="close" />
                </button>
              </div>

              <form onSubmit={handleCreateSingleClient} className="space-y-5">
                <div className={styles['provider-clients__form-grid']}>
                  {/* Legal Name */}
                  <div className={styles['provider-clients__field-group']}>
                    <label className={styles['provider-clients__field-label']}>
                      Legal Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Innovations Corp"
                      value={singleForm.legal_name}
                      onChange={(e) => setSingleForm({ ...singleForm, legal_name: e.target.value })}
                      className={styles['provider-clients__input']}
                    />
                  </div>

                  {/* Trade Name */}
                  <div className={styles['provider-clients__field-group']}>
                    <label className={styles['provider-clients__field-label']}>
                      Trade / Commercial Name
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
                        <span>Verifying domain availability in platform...</span>
                      </div>
                    )}
                    {!domainCheckStatus.checking && domainCheckStatus.available === true && (
                      <div className={`${styles['provider-clients__domain-badge']} ${styles['provider-clients__domain-badge--available']}`}>
                        <Icon name="check_circle" className="text-xs" />
                        <span>Domain is available for a new organization.</span>
                      </div>
                    )}
                    {!domainCheckStatus.checking && domainCheckStatus.available === false && (
                      <div className={`${styles['provider-clients__domain-badge']} ${styles['provider-clients__domain-badge--unavailable']}`}>
                        <Icon name="warning" className="text-xs" />
                        <span>{domainCheckStatus.reason || 'Domain is already registered by another organization.'}</span>
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
                    <label className={styles['provider-clients__field-label']}>Tax ID / NIT / RUT</label>
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
                    <label className={styles['provider-clients__field-label']}>Phone</label>
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
                    disabled={isSubmittingSingle}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name={isSubmittingSingle ? 'sync' : 'send'} className={isSubmittingSingle ? 'animate-spin' : ''} />
                      <span>{isSubmittingSingle ? 'Registering...' : 'Register & Send Invitation'}</span>
                    </div>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL 2: Bulk CSV Import (RF-PV-30) --- */}
        {isBulkModalOpen && (
          <div className={styles['provider-clients__modal-backdrop']}>
            <div className={styles['provider-clients__modal']}>
              <div className={styles['provider-clients__modal-header']}>
                <h2 className={styles['provider-clients__modal-title']}>
                  <Icon name="upload_file" className="text-blue-400" />
                  Bulk CSV Import
                </h2>
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className={styles['provider-clients__modal-close']}
                >
                  <Icon name="close" />
                </button>
              </div>

              {!bulkResult ? (
                <div className="space-y-6">
                  {/* Upload Drop Zone */}
                  <label className={styles['provider-clients__csv-zone']}>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCsvFileUpload(file);
                      }}
                    />
                    <div className={styles['provider-clients__csv-icon']}>
                      <Icon name="cloud_upload" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {csvFile ? csvFile.name : 'Click or drag a CSV file to upload'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Headers: <code>legal_name, trade_name, email, client_type, role, phone</code>
                      </p>
                    </div>
                  </label>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Need the standard CSV structure?</span>
                    <button
                      type="button"
                      onClick={downloadExampleCsv}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      <Icon name="download" className="text-xs" />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>

                  {/* Parsed Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-slate-400">
                          Pre-Validation Summary ({parsedRows.length} rows detected)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {parsedRows.filter((r) => r.isValid).length} Valid
                          </span>
                          {parsedRows.filter((r) => !r.isValid).length > 0 && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              {parsedRows.filter((r) => !r.isValid).length} Issues
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60">
                        {parsedRows.slice(0, 10).map((row, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between text-xs">
                            <div className="space-y-0.5">
                              <span className="font-semibold text-white">{row.legal_name || 'Missing Name'}</span>
                              <div className="text-[11px] text-slate-400">{row.email}</div>
                            </div>
                            {row.isValid ? (
                              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                <Icon name="check" className="text-xs" /> Ready
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                                <Icon name="error" className="text-xs" /> {row.error}
                              </span>
                            )}
                          </div>
                        ))}
                        {parsedRows.length > 10 && (
                          <div className="p-2 text-center text-[10px] text-slate-500">
                            + {parsedRows.length - 10} more records in file
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleConfirmBulkImport}
                      disabled={isImportingBulk || parsedRows.filter((r) => r.isValid).length === 0}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={isImportingBulk ? 'sync' : 'publish'} className={isImportingBulk ? 'animate-spin' : ''} />
                        <span>
                          {isImportingBulk
                            ? 'Processing Batch...'
                            : `Import ${parsedRows.filter((r) => r.isValid).length} Valid Clients`}
                        </span>
                      </div>
                    </Button>
                  </div>
                </div>
              ) : (
                /* Bulk Results View */
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-around text-center">
                    <div>
                      <div className="text-xl font-bold text-white">{bulkResult.summary.total}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Total Rows</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-emerald-400">{bulkResult.summary.successful}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Imported</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-rose-400">{bulkResult.summary.failed}</div>
                      <div className="text-[10px] text-slate-500 uppercase">Failed</div>
                    </div>
                  </div>

                  {bulkResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-rose-400">Errors Breakdown</span>
                      <div className="max-h-40 overflow-y-auto space-y-1 rounded-xl bg-slate-950/40 p-3 border border-slate-800 text-xs text-slate-400">
                        {bulkResult.errors.map((err, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="font-mono text-[10px] text-slate-500">Row {err.row}:</span>
                            <span className="text-slate-300 font-medium">{err.email}</span>
                            <span className="text-rose-400">— {err.error}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-800 flex justify-end">
                    <Button variant="primary" onClick={() => setIsBulkModalOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        {feedback && (
          <div
            className={`${styles['provider-clients__toast']} ${feedback.type === 'success'
                ? styles['provider-clients__toast--success']
                : styles['provider-clients__toast--error']
              }`}
          >
            <Icon
              name={feedback.type === 'success' ? 'check_circle' : 'error'}
              className="text-base"
            />
            <span>{feedback.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
