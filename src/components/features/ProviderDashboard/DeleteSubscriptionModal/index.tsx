'use client';

import React from 'react';
import { Subscription } from '@/src/lib/api/types';
import Icon from '@/src/components/shared/atoms/Icon';

export interface DeleteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onConfirm: (sub: Subscription) => Promise<void>;
  isDeleting?: boolean;
}

export default function DeleteSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onConfirm,
  isDeleting = false,
}: DeleteSubscriptionModalProps) {
  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/20 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <Icon name="delete_forever" className="text-2xl" />
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">Delete Subscription</h3>
        <p className="text-sm text-slate-400 mb-4">
          Are you sure you want to permanently delete this subscription? This will remove the client association and all onboarding progress.
        </p>

        {/* Subscription Info Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Client</span>
            <span className="font-semibold text-slate-200">{subscription.client?.legalName || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Service</span>
            <span className="font-semibold text-slate-200">{subscription.product?.name || subscription.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Subscription ID</span>
            <span className="font-mono text-slate-400 truncate max-w-[200px]">{subscription.id}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Payment Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
              <Icon name="check_circle" className="text-xs" /> No approved payments
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs mb-6">
          <Icon name="warning" className="text-rose-400 shrink-0 mt-0.5" />
          <span>
            This action is permanent and cannot be undone.
          </span>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => onConfirm(subscription)}
            disabled={isDeleting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Icon name="delete" />
                <span>Delete Subscription</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
