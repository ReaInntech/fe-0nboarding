'use client';

import React, { useState, useEffect } from 'react';
import Icon from '../../../shared/atoms/Icon';
import Button from '../../../shared/atoms/Button';
import WysiwygEmailEditor from '../../../shared/molecule/WysiwygEmailEditor';
import {
  getProductNotificationConfig,
  updateProductNotificationConfig,
  ProductNotificationConfigData,
} from '@/src/lib/api/provider';
import { useApp } from '@/src/context/AppContext';
import { auth } from '@/src/lib/firebase/config';
import styles from './index.module.scss';

export interface ProductNotificationConfigTabProps {
  productId: string;
  productName: string;
  providerLogo?: string | null;
  providerName?: string;
}

export default function ProductNotificationConfigTab({
  productId,
  productName,
  providerLogo,
  providerName = 'Proveedor',
}: ProductNotificationConfigTabProps) {
  const { user } = useApp();
  const orgId = user?.organization?.id || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [config, setConfig] = useState<ProductNotificationConfigData>({
    welcome_email_subject: `Bienvenido a ${productName} - Comienza tu Onboarding`,
    welcome_email_body: `<p>Hola <strong>{{client_name}}</strong>,</p><p>Te damos la bienvenida al servicio <strong>{{product_name}}</strong> gestionado por <strong>{{provider_name}}</strong>.</p><p>Para habilitar tu servicio, por favor ingresa a la plataforma y continúa con los pasos de onboarding requeridos.</p>`,
    notify_on_step_change: true,
    notify_on_rejection: true,
    notify_on_completion: true,
  });

  const getFreshToken = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return user?.accessToken || '';
  };

  useEffect(() => {
    let isMounted = true;
    async function loadConfig() {
      setIsLoading(true);
      try {
        const token = await getFreshToken();
        const data = await getProductNotificationConfig(productId, token, orgId);
        if (isMounted && data) {
          setConfig({
            welcome_email_subject:
              data.welcome_email_subject || `Bienvenido a ${productName} - Comienza tu Onboarding`,
            welcome_email_body: data.welcome_email_body || '',
            notify_on_step_change: data.notify_on_step_change ?? true,
            notify_on_rejection: data.notify_on_rejection ?? true,
            notify_on_completion: data.notify_on_completion ?? true,
          });
        }
      } catch (err) {
        console.warn('[ProductNotificationConfigTab] Could not load config, using defaults:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (productId) {
      loadConfig();
    }
    return () => {
      isMounted = false;
    };
  }, [productId, orgId]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getFreshToken();
      await updateProductNotificationConfig(productId, token, orgId, config);
      showNotification('success', 'Configuración de notificaciones guardada exitosamente.');
    } catch (err: any) {
      console.error('[ProductNotificationConfigTab] Save error:', err);
      showNotification('error', err?.message || 'Error guardando la configuración de notificaciones.');
    } finally {
      setIsSaving(false);
    }
  };

  // Preview interpolations
  const previewBodyHtml = (config.welcome_email_body || '')
    .replace(/\{\{client_name\}\}/g, 'Cliente Ejemplo')
    .replace(/\{\{product_name\}\}/g, productName)
    .replace(/\{\{provider_name\}\}/g, providerName);

  if (isLoading) {
    return (
      <div className={styles['config-tab__loading']}>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Cargando reglas de notificación del producto...</p>
      </div>
    );
  }

  return (
    <div className={styles['config-tab']}>
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`${styles['config-tab__alert']} ${
            feedback.type === 'success' ? styles['config-tab__alert--success'] : styles['config-tab__alert--error']
          }`}
        >
          <Icon name={feedback.type === 'success' ? 'check_circle' : 'error'} className="text-lg" />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header bar with Save button */}
      <div className={styles['config-tab__header']}>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Configure Notifications</h2>
          <p className="text-sm text-slate-400 mt-1">
            Personaliza el correo inicial de invitación y los eventos automáticos para este producto.
          </p>
        </div>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          <div className="flex items-center gap-2">
            <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} />
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </div>
        </Button>
      </div>

      {/* Main Grid: Editor on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & WYSIWYG */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card: Welcome Email Template */}
          <div className={styles['config-tab__card']}>
            <div className={styles['config-tab__card-header']}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Icon name="mail" className="text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Correo Inicial de Vinculación
                  </h3>
                  <p className="text-xs text-slate-400">
                    Se enviará al cliente cuando sea agregado desde "Add Clients".
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Email Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  value={config.welcome_email_subject}
                  onChange={(e) => setConfig({ ...config, welcome_email_subject: e.target.value })}
                  placeholder={`Bienvenido a ${productName} - Comienza tu Onboarding`}
                  className={styles['config-tab__input']}
                />
                <span className="text-[11px] text-slate-500">
                  Puedes incluir la variable <code className="text-cyan-400">&#123;&#123;product_name&#125;&#125;</code> para reemplazar automáticamente.
                </span>
              </div>

              {/* WYSIWYG Editor */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Cuerpo Central del Correo (WYSIWYG Seguro)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    No admite scripts ni imágenes.
                  </span>
                </div>
                <WysiwygEmailEditor
                  value={config.welcome_email_body}
                  onChange={(html) => setConfig({ ...config, welcome_email_body: html })}
                />
              </div>
            </div>
          </div>

          {/* Card: Notification Behavior Switches */}
          <div className={styles['config-tab__card']}>
            <div className={styles['config-tab__card-header']}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon name="tune" className="text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Comportamiento de Notificaciones por Correo
                  </h3>
                  <p className="text-xs text-slate-400">
                    Activa o desactiva el envío de correos transaccionales estándar para cada caso.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex flex-col divide-y divide-slate-800">
              {/* Switch 1: Step Advance */}
              <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    Notificar al correo del usuario cuando pasa de step
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Envía un correo automático indicando que su proceso avanzó satisfactoriamente al siguiente paso.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, notify_on_step_change: !config.notify_on_step_change })
                  }
                  className={`${styles['config-tab__toggle']} ${
                    config.notify_on_step_change ? styles['config-tab__toggle--active'] : ''
                  }`}
                >
                  <span
                    className={`${styles['config-tab__toggle-handle']} ${
                      config.notify_on_step_change ? styles['config-tab__toggle-handle--active'] : ''
                    }`}
                  />
                </button>
              </div>

              {/* Switch 2: Rejection / Feedback */}
              <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    Notificar al correo del usuario del rechazo o feedback
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Envía un correo cuando el proveedor rechaza una solicitud y requiere correcciones u observaciones.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, notify_on_rejection: !config.notify_on_rejection })
                  }
                  className={`${styles['config-tab__toggle']} ${
                    config.notify_on_rejection ? styles['config-tab__toggle--active'] : ''
                  }`}
                >
                  <span
                    className={`${styles['config-tab__toggle-handle']} ${
                      config.notify_on_rejection ? styles['config-tab__toggle-handle--active'] : ''
                    }`}
                  />
                </button>
              </div>

              {/* Switch 3: Completion */}
              <div className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-white">
                    Notificar al correo del usuario de culmino del proceso de onboarding
                  </span>
                  <span className="text-xs text-slate-400 leading-relaxed">
                    Envía un correo de confirmación y activación total cuando se completan todos los pasos del onboarding.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig({ ...config, notify_on_completion: !config.notify_on_completion })
                  }
                  className={`${styles['config-tab__toggle']} ${
                    config.notify_on_completion ? styles['config-tab__toggle--active'] : ''
                  }`}
                >
                  <span
                    className={`${styles['config-tab__toggle-handle']} ${
                      config.notify_on_completion ? styles['config-tab__toggle-handle--active'] : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4 sticky top-24">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Icon name="visibility" className="text-blue-400 text-sm" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Vista Previa del Correo
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Simulación de bandeja</span>
          </div>

          {/* Email Preview Frame */}
          <div className={styles['config-tab__preview-frame']}>
            {/* Window bar */}
            <div className={styles['config-tab__preview-bar']}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                {config.welcome_email_subject || 'Bienvenido a tu Onboarding'}
              </span>
            </div>

            {/* Email Card Container */}
            <div className={styles['config-tab__email-card']}>
              {/* Header (Branding & Logo) */}
              <div className={styles['config-tab__email-header']}>
                {providerLogo ? (
                  <img
                    src={providerLogo}
                    alt={providerName}
                    className="max-h-9 max-w-[150px] object-contain mx-auto"
                  />
                ) : (
                  <span className="text-base font-bold text-white tracking-tight">
                    {providerName}
                  </span>
                )}
                <h4 className="text-base font-bold text-slate-100 mt-2">
                  {productName}
                </h4>
              </div>

              {/* Editable Center Body */}
              <div
                className={styles['config-tab__email-body']}
                dangerouslySetInnerHTML={{ __html: previewBodyHtml }}
              />

              {/* Call to Action Button */}
              <div className="my-5 text-center">
                <button
                  type="button"
                  disabled
                  className={styles['config-tab__email-cta']}
                >
                  Continuar con el Onboarding
                </button>
              </div>

              {/* Footer */}
              <div className={styles['config-tab__email-footer']}>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block">
                  Powered by 0nboarding
                </span>
                <span className="text-[10px] text-slate-600 block mt-0.5">
                  Plataforma de Contratación y Gestión de Servicios en Línea.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
