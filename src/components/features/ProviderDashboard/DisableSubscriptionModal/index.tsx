'use client';

import React from 'react';
import { Subscription } from '@/src/lib/api/types';
import Icon from '@/src/components/shared/atoms/Icon';

export interface DisableSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onConfirm: (sub: Subscription, newStatus: 'suspended' | 'active') => Promise<void>;
  isUpdating?: boolean;
}

export default function DisableSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onConfirm,
  isUpdating = false,
}: DisableSubscriptionModalProps) {
  if (!isOpen || !subscription) return null;

  const isCurrentlySuspended = subscription.status === 'suspended' || subscription.status === 'cancelled';
  const targetStatus = isCurrentlySuspended ? 'active' : 'suspended';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl text-slate-100">
        {/* Header Icon & Close */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`size-12 rounded-xl flex items-center justify-center text-2xl border ${
              isCurrentlySuspended
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
          >
            <Icon name={isCurrentlySuspended ? 'play_circle' : 'pause_circle'} />
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-white mb-2">
          {isCurrentlySuspended ? 'Reactivate Subscription' : 'Disable Subscription'}
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {isCurrentlySuspended
            ? 'The service will become active again and the client will regain regular access.'
            : 'This subscription has approved payments and cannot be deleted physically. Disabling will suspend the service while preserving all accounting records.'}
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
            <span>Current Status</span>
            <span className="capitalize font-medium text-slate-300">{subscription.status}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
            <span>Audit Trail</span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <Icon name="verified_user" className="text-xs" /> Payment history protected
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => onConfirm(subscription, targetStatus)}
            disabled={isUpdating}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 ${
              isCurrentlySuspended
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {isUpdating ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Icon name={isCurrentlySuspended ? 'play_arrow' : 'pause'} />
                <span>{isCurrentlySuspended ? 'Reactivate Service' : 'Suspend Service'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
