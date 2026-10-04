'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import Badge from '../../../shared/atoms/Badge';
import Modal from '../../../shared/molecule/Modal';
import { useApp } from '../../../../context/AppContext';
import { auth } from '../../../../lib/firebase/config';
import { useFileUpload } from '../../../../libs/hooks/useFileUpload';
import styles from './index.module.scss';

export interface LineItem {
    description: string;
    amount: string;
}

export interface PaymentRequestProps {
    id?: string;
    subscriptionId?: string;
    title: string;
    invoiceNumber?: string;
    issuedDate?: string;
    dueDate?: string;
    status: 'pending' | 'processing' | 'paid' | 'approved' | 'rejected' | 'waiting_client';
    bank?: string;
    accountNumber?: string;
    nit?: string;
    instructions?: string;
    certificateFile?: string | null;
    amount?: number | string;
    isItemized?: boolean;
    items?: Array<{ id: number; description: string; price: number }>;
    uploadDate?: string;
    paymentDate?: string;
    lineItems?: LineItem[];
    total?: string;
    data?: any;
    feedbackNotes?: string;
    onUpload?: () => void;
    className?: string;
}

export default function PaymentRequest({
    id,
    subscriptionId,
    title,
    invoiceNumber,
    issuedDate,
    dueDate,
    status,
    bank,
    accountNumber,
    nit,
    instructions,
    certificateFile,
    amount,
    isItemized,
    items,
    uploadDate,
    paymentDate,
    lineItems,
    total,
    data,
    feedbackNotes,
    onUpload,
    className = ''
}: PaymentRequestProps) {
    const { user } = useApp();
    const { uploadFile, isUploading } = useFileUpload();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial receipt state from data
    const initialReceipt = data?.receiptFile || data?.receiptUrl ? {
        fileKey: data.receiptFile || data.receiptUrl,
        fileName: data.fileName || (data.receiptFile ? data.receiptFile.split('/').pop() : 'Comprobante_Pago.pdf'),
        uploadedAt: data.uploadedAt || uploadDate,
    } : null;

    const [uploadedReceipt, setUploadedReceipt] = useState<{
        fileKey: string;
        fileName: string;
        uploadedAt?: string;
    } | null>(initialReceipt);

    const [currentStatus, setCurrentStatus] = useState<string>(status);
    const [hasCopiedAccount, setHasCopiedAccount] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (status) {
            setCurrentStatus(status);
        }
        if (data?.receiptFile || data?.receiptUrl) {
            setUploadedReceipt({
                fileKey: data.receiptFile || data.receiptUrl,
                fileName: data.fileName || (data.receiptFile ? data.receiptFile.split('/').pop() : 'Comprobante_Pago.pdf'),
                uploadedAt: data.uploadedAt || uploadDate,
            });
        }
    }, [status, data, uploadDate]);

    // Modal Document Viewer State (for receipt & bank certificate)
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [viewerTitle, setViewerTitle] = useState('Document Preview');
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [isLoadingViewer, setIsLoadingViewer] = useState(false);
    const [viewerError, setViewerError] = useState<string | null>(null);
    const [isLoadingCert, setIsLoadingCert] = useState(false);

    // Format currency helper
    const formatAmount = (val: number | string | undefined): string => {
        if (val === undefined || val === null || val === '') return '$0.00';
        const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
        if (isNaN(num)) return String(val);
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const isPaid = currentStatus === 'paid' || currentStatus === 'approved';
    const isProcessing = currentStatus === 'processing' || (Boolean(uploadedReceipt) && !isPaid && currentStatus !== 'rejected');
    const isRejected = currentStatus === 'rejected';

    // Format line items
    const displayLineItems: LineItem[] = lineItems && lineItems.length > 0
        ? lineItems
        : (isItemized && items && items.length > 0
            ? items.map(item => ({ description: item.description, amount: formatAmount(item.price) }))
            : [{ description: title || 'Service Fee', amount: formatAmount(amount || total) }]);

    const displayTotal = total || formatAmount(amount) || '$0.00';
    const displayInvoiceNumber = invoiceNumber || data?.invoiceNumber || (id ? id.substring(0, 8).toUpperCase() : 'INV-001');
    const displayIssuedDate = issuedDate || data?.issuedDate || 'Today';
    const hasCertificate = Boolean(certificateFile && certificateFile.trim() !== '');

    // Copy Account Number with Feedback
    const handleCopyAccountNumber = async () => {
        if (!accountNumber || accountNumber === 'N/A') return;
        try {
            await navigator.clipboard.writeText(accountNumber);
            setHasCopiedAccount(true);
            setTimeout(() => setHasCopiedAccount(false), 2000);
        } catch (err) {
            console.error('Failed to copy account number:', err);
        }
    };

    // Helper to fetch download URL from Core API
    const fetchDownloadUrl = async (key: string): Promise<string> => {
        const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
        if (!freshToken) throw new Error('No authentication token available');

        const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
        const response = await fetch(`${baseUrl}/storage/download-url?key=${encodeURIComponent(key)}`, {
            headers: { Authorization: `Bearer ${freshToken}` },
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.message || 'Failed to get file URL');
        }

        const body = await response.json();
        return body.data?.url || body.url;
    };

    // Download / View Bank Certificate
    const handleDownloadCertificate = async () => {
        if (!certificateFile) return;
        setIsLoadingCert(true);
        setViewerError(null);
        setViewerTitle('Bank Certificate');
        setIsViewerOpen(true);
        setIsLoadingViewer(true);

        try {
            const url = await fetchDownloadUrl(certificateFile);
            setViewerUrl(url);
        } catch (err: any) {
            console.error('Failed to load bank certificate:', err);
            setViewerError(err.message || 'Could not load bank certificate');
        } finally {
            setIsLoadingViewer(false);
            setIsLoadingCert(false);
        }
    };

    // View Uploaded Receipt
    const handleViewReceipt = async () => {
        if (!uploadedReceipt?.fileKey) return;
        setViewerError(null);
        setViewerTitle(uploadedReceipt.fileName || 'Payment Receipt');
        setIsViewerOpen(true);
        setIsLoadingViewer(true);

        try {
            const url = await fetchDownloadUrl(uploadedReceipt.fileKey);
            setViewerUrl(url);
        } catch (err: any) {
            console.error('Failed to load receipt preview:', err);
            setViewerError(err.message || 'Could not load receipt preview');
        } finally {
            setIsLoadingViewer(false);
        }
    };

    // Handle Receipt Upload
    const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSubmitting(true);
        try {
            const freshToken = await (auth.currentUser?.getIdToken() || Promise.resolve(user?.accessToken));
            const orgId = user?.org_id || user?.organization?.id;

            // 1. Upload to DigitalOcean Spaces via Core API S3 presigned URL
            const uploadedKey = await uploadFile(file, 'documents', freshToken, orgId);

            // 2. Persist in Core API resolved request
            const nowIso = new Date().toISOString();
            if (subscriptionId && id) {
                const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';
                const res = await fetch(`${baseUrl}/subscriptions/${subscriptionId}/resolved-requests/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${freshToken}`,
                        ...(orgId ? { 'x-org-id': orgId } : {}),
                    },
                    body: JSON.stringify({
                        status: 'pending',
                        data: {
                            receiptFile: uploadedKey,
                            fileName: file.name,
                            uploadedAt: nowIso,
                            status: 'pending',
                            clientStatus: 'processing',
                            providerStatus: null,
                            feedbackNotes: null,
                        },
                    }),
                });

                if (!res.ok) {
                    console.warn('Backend update failed, maintaining local state');
                }
            }

            // 3. Update local state
            setUploadedReceipt({
                fileKey: uploadedKey,
                fileName: file.name,
                uploadedAt: nowIso,
            });
            setCurrentStatus('processing');

            if (onUpload) {
                onUpload();
            }
        } catch (err) {
            console.error('Failed to upload receipt:', err);
            alert('Failed to upload receipt. Please try again.');
        } finally {
            setIsSubmitting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };

    const contentClass = `${styles['payment-request__content']} ${
        isPaid ? styles['payment-request__content--paid'] : 
        isProcessing ? styles['payment-request__content--processing'] : 
        styles['payment-request__content--pending']
    }`;

    const iconBoxClass = `${styles['payment-request__icon-box']} ${
        isPaid ? styles['payment-request__icon-box--paid'] : 
        isProcessing ? styles['payment-request__icon-box--processing'] : 
        styles['payment-request__icon-box--pending']
    }`;

    return (
        <div className={`${styles['payment-request']} ${className}`}>
            <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*,application/pdf" 
                className="hidden" 
                onChange={handleReceiptFileChange}
            />

            <div className={styles['payment-request__header']}>
                <h3 className={styles['payment-request__title-box']}>
                    <Icon 
                        name="payments" 
                        className={isPaid ? 'text-emerald-500' : 'text-[#1978e5]'} 
                    /> 
                    Payment Request
                </h3>
                {isPaid && <Badge variant="success">Paid</Badge>}
                {isProcessing && <Badge variant="primary">Verifying Payment</Badge>}
                {isRejected && <Badge variant="warning">Receipt Rejected</Badge>}
                {!isPaid && !isProcessing && !isRejected && <Badge variant="warning">Pending Payment</Badge>}
            </div>

            <div className={contentClass}>
                <div className={styles['payment-request__layout']}>
                    {/* Left Column: Invoice Details */}
                    <div className={styles['payment-request__details']}>
                        <div className={styles['payment-request__details-top']}>
                            <div className={iconBoxClass}>
                                <Icon name="receipt_long" />
                            </div>
                            <div className={styles['payment-request__info-body']}>
                                <p className={styles['payment-request__info-title']}>{title}</p>
                                <p className={styles['payment-request__info-meta']}>
                                    Invoice #{displayInvoiceNumber} • Issued {displayIssuedDate}
                                </p>

                                <div className={styles['payment-request__status-row']}>
                                    {isPaid ? (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--paid']}`}>
                                            <Icon name="check_circle" className="text-base" />
                                            <span>Payment Completed</span>
                                        </div>
                                    ) : isProcessing ? (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--processing']}`}>
                                            <Icon name="hourglass_top" className="text-base" />
                                            <span>Payment Under Review</span>
                                        </div>
                                    ) : isRejected ? (
                                        <div className={`${styles['payment-request__status-indicator']} text-red-600 dark:text-red-400`}>
                                            <Icon name="error" className="text-base" />
                                            <span>Payment Rejected</span>
                                            {dueDate && <span className={styles['payment-request__due-date']}>Due: {dueDate}</span>}
                                        </div>
                                    ) : (
                                        <div className={`${styles['payment-request__status-indicator']} ${styles['payment-request__status-indicator--pending']}`}>
                                            <Icon name="pending" className="text-base" />
                                            <span>Action Required</span>
                                            {dueDate && <span className={styles['payment-request__due-date']}>Due: {dueDate}</span>}
                                        </div>
                                    )}
                                </div>

                                {/* Centered Instructions Box in Main Section */}
                                {instructions && (
                                    <div className={styles['payment-request__instruction-box']}>
                                        <Icon name="info" className="text-amber-500 text-sm flex-shrink-0" />
                                        <span>{instructions}</span>
                                    </div>
                                )}

                                <div className={styles['payment-request__invoice-table']}>
                                    {displayLineItems.map((item, idx) => (
                                        <div key={idx} className={styles['payment-request__invoice-row']}>
                                            <span>{item.description}</span>
                                            <span className={styles['payment-request__invoice-item-amount']}>
                                                {item.amount}
                                            </span>
                                        </div>
                                    ))}
                                    <div className={styles['payment-request__invoice-total-row']}>
                                        <span className={styles['payment-request__invoice-total-label']}>Total Amount</span>
                                        <span className={styles['payment-request__invoice-total-value']}>{displayTotal}</span>
                                    </div>
                                </div>

                                {/* Rejection Feedback if rejected */}
                                {isRejected && (feedbackNotes || data?.feedbackNotes) && (
                                    <div className={styles['payment-request__rejection-box']}>
                                        <Icon name="feedback" className="text-red-500 text-sm flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-red-700 dark:text-red-400">Feedback from Provider:</p>
                                            <p className="mt-0.5">{feedbackNotes || data?.feedbackNotes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Bank Details, Bank Certificate & Uploaded Receipt */}
                    <div className={styles['payment-request__sidebar']}>
                        {!isPaid && (
                            <div className={styles['payment-request__sidebar-section']}>
                                <div>
                                    <h4 className={styles['payment-request__bank-title']}>Bank Transfer Details</h4>
                                    <div className={styles['payment-request__bank-card']}>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Bank Name</p>
                                            <p className={styles['payment-request__bank-value']}>{bank || 'N/A'}</p>
                                        </div>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Account Number</p>
                                            <div className={styles['payment-request__bank-copy-row']}>
                                                <p className={styles['payment-request__bank-mono']}>{accountNumber || 'N/A'}</p>
                                                <button 
                                                    type="button"
                                                    onClick={handleCopyAccountNumber}
                                                    className="text-slate-400 hover:text-[#1978e5] p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 cursor-pointer" 
                                                    title={hasCopiedAccount ? "Copied!" : "Copy Account Number"}
                                                >
                                                    <Icon 
                                                        name={hasCopiedAccount ? "check" : "content_copy"} 
                                                        className={`text-sm ${hasCopiedAccount ? "text-emerald-500 font-bold" : ""}`} 
                                                    />
                                                    {hasCopiedAccount && (
                                                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                                            Copied!
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles['payment-request__bank-field']}>
                                            <p className={styles['payment-request__bank-label']}>Tax ID (NIT)</p>
                                            <p className={styles['payment-request__bank-value']}>{nit || 'N/A'}</p>
                                        </div>

                                        {/* Download Bank Certificate (Strictly Optional) */}
                                        {hasCertificate && (
                                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    type="button"
                                                    onClick={handleDownloadCertificate}
                                                    disabled={isLoadingCert}
                                                    className={styles['payment-request__cert-btn']}
                                                >
                                                    <Icon 
                                                        name={isLoadingCert ? "sync" : "verified_user"} 
                                                        className={`text-sm ${isLoadingCert ? "animate-spin" : "text-[#1978e5]"}`} 
                                                    />
                                                    <span>{isLoadingCert ? 'Loading Certificate...' : 'Download Bank Certificate'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Receipt Dropzone vs Uploaded Receipt Card */}
                                {!uploadedReceipt ? (
                                    <div
                                        onClick={handleTriggerUpload}
                                        className={styles['payment-request__upload-dropzone']}
                                    >
                                        <div className={styles['payment-request__upload-icon-box']}>
                                            <Icon 
                                                name={isSubmitting || isUploading ? "sync" : "upload_file"} 
                                                className={isSubmitting || isUploading ? "animate-spin" : ""}
                                            />
                                        </div>
                                        <span className={styles['payment-request__upload-text']}>
                                            {isSubmitting || isUploading ? 'Uploading Receipt...' : 'Upload Receipt'}
                                        </span>
                                        <span className={styles['payment-request__upload-subtext']}>
                                            Upload your transfer receipt or payment certificate here (PDF or Image)
                                        </span>
                                    </div>
                                ) : (
                                    <div className={styles['payment-request__receipt-card']}>
                                        <div className={styles['payment-request__receipt-header']}>
                                            <div className={styles['payment-request__receipt-file-info']}>
                                                <div className={styles['payment-request__receipt-icon-box']}>
                                                    <Icon name="receipt_long" className="text-xl" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={styles['payment-request__receipt-name']} title={uploadedReceipt.fileName}>
                                                        {uploadedReceipt.fileName}
                                                    </p>
                                                    <p className={styles['payment-request__receipt-meta']}>
                                                        {uploadedReceipt.uploadedAt 
                                                            ? `Uploaded ${new Date(uploadedReceipt.uploadedAt).toLocaleDateString()}` 
                                                            : 'Uploaded recently'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={isRejected ? "warning" : "primary"}>
                                                {isRejected ? "Rejected" : "Under Review"}
                                            </Badge>
                                        </div>

                                        <div className={styles['payment-request__receipt-actions']}>
                                            <button
                                                type="button"
                                                onClick={handleViewReceipt}
                                                className={`${styles['payment-request__receipt-btn']} ${styles['payment-request__receipt-btn--primary']}`}
                                            >
                                                <Icon name="visibility" className="text-sm" />
                                                <span>View Receipt</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleTriggerUpload}
                                                disabled={isSubmitting || isUploading}
                                                className={`${styles['payment-request__receipt-btn']} ${styles['payment-request__receipt-btn--secondary']}`}
                                                title="Upload a new receipt file"
                                            >
                                                <Icon name={isSubmitting || isUploading ? "sync" : "refresh"} className={`text-sm ${isSubmitting || isUploading ? "animate-spin" : ""}`} />
                                                <span>{isRejected ? 'Upload New Receipt' : 'Replace'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paid Status View (when payment is approved/paid) */}
                        {isPaid && (
                            <div className="flex flex-col gap-3 h-full justify-center">
                                <div className={styles['payment-request__paid-info']}>
                                    <div className={styles['payment-request__paid-header']}>
                                        <Icon name="verified" className="text-emerald-500 text-xl" />
                                        <h4 className={styles['payment-request__paid-title']}>Payment Verified</h4>
                                    </div>
                                    {paymentDate && (
                                        <div className={styles['payment-request__paid-meta-row']}>
                                            <span className={styles['payment-request__paid-date-label']}>Verified On</span>
                                            <span className={styles['payment-request__paid-date-value']}>{paymentDate}</span>
                                        </div>
                                    )}
                                    <p className={styles['payment-request__paid-description']}>
                                        Your payment has been successfully matched with our records. Thank you!
                                    </p>
                                </div>

                                {/* Also display receipt card when paid so client can review their verified receipt */}
                                {uploadedReceipt && (
                                    <div className={styles['payment-request__receipt-card']}>
                                        <div className={styles['payment-request__receipt-header']}>
                                            <div className={styles['payment-request__receipt-file-info']}>
                                                <div className={styles['payment-request__receipt-icon-box']}>
                                                    <Icon name="verified" className="text-emerald-500 text-xl" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={styles['payment-request__receipt-name']} title={uploadedReceipt.fileName}>
                                                        {uploadedReceipt.fileName}
                                                    </p>
                                                    <p className={styles['payment-request__receipt-meta']}>
                                                        {uploadedReceipt.uploadedAt 
                                                            ? `Uploaded ${new Date(uploadedReceipt.uploadedAt).toLocaleDateString()}` 
                                                            : 'Receipt attached'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="success">Verified</Badge>
                                        </div>
                                        <div className={styles['payment-request__receipt-actions']}>
                                            <button
                                                type="button"
                                                onClick={handleViewReceipt}
                                                className={`${styles['payment-request__receipt-btn']} ${styles['payment-request__receipt-btn--secondary']}`}
                                            >
                                                <Icon name="visibility" className="text-sm" />
                                                <span>View Receipt</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document / Receipt / Certificate Preview Modal */}
            <Modal
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
                title={viewerTitle}
                size="lg"
                footer={
                    viewerUrl ? (
                        <div className="flex justify-end gap-3 w-full">
                            <a
                                href={viewerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1978e5] text-white text-xs font-semibold hover:bg-[#1567c5] transition-colors"
                            >
                                <Icon name="download" className="text-sm" /> Download File
                            </a>
                            <Button variant="secondary" size="sm" onClick={() => setIsViewerOpen(false)}>
                                Close
                            </Button>
                        </div>
                    ) : undefined
                }
            >
                <div className="h-[520px] w-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                    {isLoadingViewer ? (
                        <div className="flex flex-col items-center gap-3">
                            <Icon name="progress_activity" className="animate-spin text-3xl text-blue-500" />
                            <p className="text-sm text-slate-500">Loading document preview...</p>
                        </div>
                    ) : viewerUrl ? (
                        <iframe
                            src={viewerUrl}
                            className="w-full h-full border-none"
                            title={viewerTitle}
                        />
                    ) : viewerError ? (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="error_outline" className="text-4xl text-red-500 mb-2" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">Could not load preview</p>
                            <p className="text-sm text-slate-400 mt-1">{viewerError}</p>
                        </div>
                    ) : (
                        <div className="text-center p-8 text-slate-500">
                            <Icon name="description" className="text-5xl text-blue-500 mb-3" />
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{viewerTitle}</p>
                            <p className="text-sm text-slate-400 mt-1">No document available to preview.</p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}
