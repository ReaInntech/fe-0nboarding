'use client';

import React, { useState } from 'react';
import { CreateClientDTO, bulkImportClients, BulkImportResult } from '@/src/lib/api/provider';
import Button from '@/src/components/shared/atoms/Button';
import Icon from '@/src/components/shared/atoms/Icon';
import styles from '../index.module.scss';

export interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: BulkImportResult) => void;
  token?: string;
  orgId: string;
}

interface ParsedCsvRow extends CreateClientDTO {
  isValid: boolean;
  error?: string;
}

export default function BulkImportModal({
  isOpen,
  onClose,
  onSuccess,
  token,
  orgId,
}: BulkImportModalProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkImportResult | null>(null);

  if (!isOpen) return null;

  const handleCsvFileUpload = (file: File) => {
    setCsvFile(file);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length <= 1) return;

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows: ParsedCsvRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const rowData: any = {};
        headers.forEach((h, idx) => {
          rowData[h] = values[idx] || '';
        });

        const legal_name = rowData.legal_name || rowData.nombre || rowData.company || '';
        const email = rowData.email || rowData.correo || '';
        const trade_name = rowData.trade_name || rowData.commercial_name || legal_name;
        const client_type = (rowData.client_type === 'natural_person' || rowData.client_type === 'natural')
          ? 'natural_person'
          : 'legal_entity';
        const phone = rowData.phone || rowData.telefono || '';

        const isValid = !!(legal_name && email && email.includes('@'));
        const error = !legal_name ? 'Missing legal name' : !email.includes('@') ? 'Invalid email' : undefined;

        rows.push({
          legal_name,
          trade_name,
          email,
          client_type,
          phone,
          isValid,
          error,
        });
      }

      setParsedRows(rows);
    };

    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setIsImporting(true);
    try {
      const result = await bulkImportClients(validRows, token, orgId);
      setBulkResult(result);
      onSuccess(result);
    } catch (err: any) {
      console.error('Failed bulk import:', err);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadExampleCsv = () => {
    const csvContent =
      'legal_name,trade_name,email,client_type,phone\n' +
      'Alpha Soluciones SAS,Alpha Tech,contacto@alphasoluciones.com,legal_entity,+573001112233\n' +
      'Alpha Soluciones SAS,Alpha Tech,operaciones@alphasoluciones.com,legal_entity,+573001112234\n' +
      'Carlos Andres Gomez,Carlos Gomez,carlos.gomez@gmail.com,natural_person,+573104445566\n' +
      'Beta Logistica SAS,Beta Logistics,gerencia@betalogistica.co,legal_entity,+573207778899\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'clients_template_onboarding.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setCsvFile(null);
    setParsedRows([]);
    setBulkResult(null);
    onClose();
  };

  return (
    <div className={styles['provider-clients__modal-backdrop']}>
      <div className={styles['provider-clients__modal']}>
        <div className={styles['provider-clients__modal-header']}>
          <h2 className={styles['provider-clients__modal-title']}>
            <Icon name="upload_file" className="text-blue-400" />
            Bulk CSV Client Import
          </h2>
          <button
            type="button"
            onClick={handleClose}
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
                  Columns: <code>legal_name, trade_name, email, client_type, phone</code>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Roles are assigned automatically: <strong>Admin</strong> for new organizations or first user; <strong>Operator</strong> for subsequent users.
                </p>
              </div>
            </label>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Need the standard CSV template?</span>
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
                    Pre-Validation Summary ({parsedRows.length} records)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {parsedRows.filter((r) => r.isValid).length} Valid
                    </span>
                    {parsedRows.filter((r) => !r.isValid).length > 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        {parsedRows.filter((r) => !r.isValid).length} With Errors
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/60">
                  {parsedRows.slice(0, 10).map((row, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{row.legal_name || 'No Name'}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {row.client_type === 'natural_person' ? 'Natural Person' : 'Legal Entity'}
                          </span>
                        </div>
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
                      + {parsedRows.length - 10} additional records in file
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleConfirmImport}
                disabled={isImporting || parsedRows.filter((r) => r.isValid).length === 0}
              >
                <div className="flex items-center gap-2">
                  <Icon name={isImporting ? 'sync' : 'publish'} className={isImporting ? 'animate-spin' : ''} />
                  <span>
                    {isImporting
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
                <div className="text-[10px] text-slate-500 uppercase">Total Processed</div>
              </div>
              <div>
                <div className="text-xl font-bold text-emerald-400">{bulkResult.summary.successful}</div>
                <div className="text-[10px] text-slate-500 uppercase">Created / Linked</div>
              </div>
              <div>
                <div className="text-xl font-bold text-rose-400">{bulkResult.summary.failed}</div>
                <div className="text-[10px] text-slate-500 uppercase">Failed / Duplicates</div>
              </div>
            </div>

            {bulkResult.successList && bulkResult.successList.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Successfully Imported Clients</span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-xl bg-slate-950/40 p-3 border border-slate-800 text-xs">
                  {bulkResult.successList.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-slate-200 font-medium truncate">{item.client?.legal_name || 'Client'}</span>
                        <span className="text-slate-500 font-mono text-[10px]">{item.user?.email}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                        item.role === 'admin'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      }`}>
                        {item.role === 'admin' ? 'Admin' : 'Operator'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bulkResult.errors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-rose-400">Issue Details</span>
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
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
