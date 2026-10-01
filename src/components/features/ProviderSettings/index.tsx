'use client';

import React, { useState } from 'react';
import {
  ProviderSettingsResponse,
  ProviderSettingsBranding,
  ProviderSettingsLocalization,
  ProviderSettingsNotifications,
  ProviderOrganizationProfile,
  updateProviderBranding,
  updateProviderLocalization,
  updateProviderNotifications,
  updateOrganizationProfile
} from '@/src/lib/api/provider';
import Button from '@/src/components/shared/atoms/Button';
import Icon from '@/src/components/shared/atoms/Icon';
import ProviderTopNavigation from '../../shared/molecule/ProviderTopNavigation';
import Footer from '../../shared/molecule/Footer';
import BrandingAssetUploadCard from './BrandingAssetUploadCard';
import { getBannerFooterStyles } from '@/src/context/BrandContext';
import styles from './index.module.scss';

export interface ProviderSettingsProps {
  initialSettings: ProviderSettingsResponse;
  orgId: string;
  token?: string;
  userProfile?: any;
}

type TabType = 'branding' | 'profile' | 'localization' | 'notifications' | 'plan';

export default function ProviderSettings({
  initialSettings,
  orgId,
  token,
  userProfile,
}: ProviderSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form States
  const [branding, setBranding] = useState<ProviderSettingsBranding>(initialSettings.branding);
  const [organization, setOrganization] = useState<ProviderOrganizationProfile>(initialSettings.organization);
  const [localization, setLocalization] = useState<ProviderSettingsLocalization>(initialSettings.localization);
  const [notifications, setNotifications] = useState<ProviderSettingsNotifications>(initialSettings.notifications);
  const plan = initialSettings.plan;

  const previewThemeStyles = getBannerFooterStyles(branding.banner_footer_theme, branding.brand_primary_color || '#1978E5');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      await updateProviderBranding(token, orgId, branding);
      showNotification('success', 'Visual identity and white-label tokens saved successfully.');
    } catch (err: any) {
      console.error('Failed to save branding:', err);
      showNotification('error', err?.message || 'Could not update branding. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetChange = async (
    field: 'logo_url' | 'isotype_url' | 'favicon_url',
    newUrl: string | null
  ) => {
    const updatedBranding: ProviderSettingsBranding = {
      ...branding,
      [field]: newUrl ? newUrl : (null as any),
    };
    setBranding(updatedBranding);

    try {
      await updateProviderBranding(token, orgId, updatedBranding);
      const label = field === 'logo_url' ? 'Logotipo' : field === 'isotype_url' ? 'Isotipo' : 'Favicon';
      showNotification('success', `${label} ${newUrl ? 'guardado correctamente' : 'eliminado'}.`);
    } catch (err: any) {
      console.error(`Failed to auto-save ${field}:`, err);
      showNotification('error', 'Asset subido, pero debes hacer clic en "Save Branding" para guardar los cambios.');
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        updateOrganizationProfile(orgId, token, organization),
        updateProviderBranding(token, orgId, { support_phone: branding.support_phone }),
      ]);
      showNotification('success', 'Corporate legal entity details updated successfully.');
    } catch (err: any) {
      console.error('Failed to save corporate profile:', err);
      showNotification('error', err?.message || 'Could not update corporate profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLocalization = async () => {
    setIsSaving(true);
    try {
      await updateProviderLocalization(token, orgId, localization);
      showNotification('success', 'Regional localization preferences saved.');
    } catch (err: any) {
      console.error('Failed to save localization:', err);
      showNotification('error', err?.message || 'Could not update regional localization.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await updateProviderNotifications(token, orgId, notifications);
      showNotification('success', 'Notification preferences and dispatch channels updated.');
    } catch (err: any) {
      console.error('Failed to save notifications:', err);
      showNotification('error', err?.message || 'Could not update notifications.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles['provider-settings']}>
      <ProviderTopNavigation activeTab="Settings" userProfile={userProfile} />
      <div className={styles['provider-settings__container']}>
        {/* Page Header */}
        <div className={styles['provider-settings__header']}>
          <div className={styles['provider-settings__header-title-box']}>
            <div className={styles['provider-settings__header-icon']}>
              <Icon name="palette" />
            </div>
            <div>
              <h1 className={styles['provider-settings__title']}>
                Provider Configuration & Branding
              </h1>
              <p className={styles['provider-settings__subtitle']}>
                Manage your white-label theme, corporate entity details, regional defaults, and alert channels.
              </p>
            </div>
          </div>

          <div className={styles['provider-settings__save-bar']}>
            {activeTab === 'branding' && (
              <Button
                variant="primary"
                onClick={handleSaveBranding}
                disabled={isSaving}
              >
                <div className="flex items-center gap-2">
                  <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} />
                  <span>{isSaving ? 'Saving Tokens...' : 'Save Branding'}</span>
                </div>
              </Button>
            )}
            {activeTab === 'profile' && (
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                <div className="flex items-center gap-2">
                  <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} />
                  <span>{isSaving ? 'Saving Profile...' : 'Save Profile'}</span>
                </div>
              </Button>
            )}
            {activeTab === 'localization' && (
              <Button
                variant="primary"
                onClick={handleSaveLocalization}
                disabled={isSaving}
              >
                <div className="flex items-center gap-2">
                  <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} />
                  <span>{isSaving ? 'Saving...' : 'Save Localization'}</span>
                </div>
              </Button>
            )}
            {activeTab === 'notifications' && (
              <Button
                variant="primary"
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                <div className="flex items-center gap-2">
                  <Icon name={isSaving ? 'sync' : 'save'} className={isSaving ? 'animate-spin' : ''} />
                  <span>{isSaving ? 'Saving Rules...' : 'Save Notifications'}</span>
                </div>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={styles['provider-settings__tabs-wrapper']}>
          <div className={styles['provider-settings__tabs']}>
            <button
              type="button"
              className={`${styles['provider-settings__tab-button']} ${activeTab === 'branding' ? styles['provider-settings__tab-button--active'] : ''}`}
              onClick={() => setActiveTab('branding')}
            >
              <Icon name="brush" />
              <span>Visual Identity & Branding</span>
            </button>
            <button
              type="button"
              className={`${styles['provider-settings__tab-button']} ${activeTab === 'profile' ? styles['provider-settings__tab-button--active'] : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Icon name="corporate_fare" />
              <span>Corporate Profile </span>
            </button>
            <button
              type="button"
              className={`${styles['provider-settings__tab-button']} ${activeTab === 'localization' ? styles['provider-settings__tab-button--active'] : ''}`}
              onClick={() => setActiveTab('localization')}
            >
              <Icon name="language" />
              <span>Regional Localization </span>
            </button>
            <button
              type="button"
              className={`${styles['provider-settings__tab-button']} ${activeTab === 'notifications' ? styles['provider-settings__tab-button--active'] : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Icon name="notifications_active" />
              <span>Notification Rules</span>
            </button>
            <button
              type="button"
              className={`${styles['provider-settings__tab-button']} ${activeTab === 'plan' ? styles['provider-settings__tab-button--active'] : ''}`}
              onClick={() => setActiveTab('plan')}
            >
              <Icon name="diamond" />
              <span>Plan & Quotas </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Visual Identity & Branding (RF-PV-24) */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div className={styles['provider-settings__card']}>
                <div className={styles['provider-settings__card-header']}>
                  <div>
                    <h2 className={styles['provider-settings__card-title']}>
                      <Icon name="palette" className="text-blue-400" />
                      Institutional Color Tokens
                    </h2>
                    <p className={styles['provider-settings__card-description']}>
                      These colors are applied across client-facing onboarding screens, email templates, and portals.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Primary Color */}
                  <div className={styles['provider-settings__field-group']}>
                    <label className={styles['provider-settings__field-label']}>
                      Primary Brand Color
                      <span className={styles['provider-settings__field-hint']}>Main CTA buttons, navigation highlights</span>
                    </label>
                    <div className={styles['provider-settings__color-picker-box']}>
                      <input
                        type="color"
                        value={branding.brand_primary_color || '#1978E5'}
                        onChange={(e) => setBranding({ ...branding, brand_primary_color: e.target.value })}
                        className={styles['provider-settings__color-swatch-input']}
                      />
                      <input
                        type="text"
                        value={branding.brand_primary_color || '#1978E5'}
                        onChange={(e) => setBranding({ ...branding, brand_primary_color: e.target.value })}
                        className={styles['provider-settings__color-hex-input']}
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className={styles['provider-settings__field-group']}>
                    <label className={styles['provider-settings__field-label']}>
                      Secondary Brand Color
                      <span className={styles['provider-settings__field-hint']}>Success states, active badges</span>
                    </label>
                    <div className={styles['provider-settings__color-picker-box']}>
                      <input
                        type="color"
                        value={branding.brand_secondary_color || '#10B981'}
                        onChange={(e) => setBranding({ ...branding, brand_secondary_color: e.target.value })}
                        className={styles['provider-settings__color-swatch-input']}
                      />
                      <input
                        type="text"
                        value={branding.brand_secondary_color || '#10B981'}
                        onChange={(e) => setBranding({ ...branding, brand_secondary_color: e.target.value })}
                        className={styles['provider-settings__color-hex-input']}
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className={styles['provider-settings__field-group']}>
                    <label className={styles['provider-settings__field-label']}>
                      Accent Color
                      <span className={styles['provider-settings__field-hint']}>Badges, warnings, highlighted items</span>
                    </label>
                    <div className={styles['provider-settings__color-picker-box']}>
                      <input
                        type="color"
                        value={branding.brand_accent_color || '#F59E0B'}
                        onChange={(e) => setBranding({ ...branding, brand_accent_color: e.target.value })}
                        className={styles['provider-settings__color-swatch-input']}
                      />
                      <input
                        type="text"
                        value={branding.brand_accent_color || '#F59E0B'}
                        onChange={(e) => setBranding({ ...branding, brand_accent_color: e.target.value })}
                        className={styles['provider-settings__color-hex-input']}
                      />
                    </div>
                  </div>

                  {/* Banner & Footer Theme Style */}
                  <div className={styles['provider-settings__field-group']}>
                    <label className={styles['provider-settings__field-label']}>
                      Banner & Footer Theme Style
                      <span className={styles['provider-settings__field-hint']}>Background and text color scheme for the client portal</span>
                    </label>
                    <div className="relative">
                      <select
                        value={branding.banner_footer_theme || 'dark'}
                        onChange={(e) => setBranding({ ...branding, banner_footer_theme: e.target.value as any })}
                        className={styles['provider-settings__select']}
                      >
                        <option value="dark">Dark (Black background, light gray text) — Default</option>
                        <option value="light">Light (White background, dark gray text)</option>
                        <option value="primary_light_text">Brand Primary (Brand color background, light text)</option>
                        <option value="primary_dark_text">Brand Primary (Brand color background, dark text)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo & Media Assets */}
              <div className={styles['provider-settings__card']}>
                <div className={styles['provider-settings__card-header']}>
                  <div>
                    <h2 className={styles['provider-settings__card-title']}>
                      <Icon name="image" className="text-blue-400" />
                      Visual Media Assets (DigitalOcean Storage)
                    </h2>
                    <p className={styles['provider-settings__card-description']}>
                      Upload and manage your corporate brand assets. They are securely stored in DigitalOcean Spaces and applied in real time.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Primary Logo */}
                  <BrandingAssetUploadCard
                    title="Primary Logo"
                    assetType="logo"
                    icon="image"
                    badgeSpec="240×60 px · Max 2MB · PNG/SVG/WEBP"
                    helperText="Horizontal logo for navigation bars, transactional emails, and invoices."
                    currentUrl={branding.logo_url}
                    allowedFormats={['.png', '.svg', '.webp', '.jpg', '.jpeg']}
                    maxSizeBytes={2 * 1024 * 1024}
                    recommendedAspect="wide"
                    token={token}
                    orgId={orgId}
                    onAssetChange={(newUrl) => handleAssetChange('logo_url', newUrl)}
                    onError={(msg) => showNotification('error', msg)}
                  />

                  {/* Isotype / Symbol */}
                  <BrandingAssetUploadCard
                    title="Isotype / Symbol"
                    assetType="isotype"
                    icon="token"
                    badgeSpec="128×128 px (1:1) · Max 2MB · PNG/SVG/WEBP"
                    helperText="Square icon for collapsed menus, avatars, and mobile navigation."
                    currentUrl={branding.isotype_url}
                    allowedFormats={['.png', '.svg', '.webp', '.jpg', '.jpeg']}
                    maxSizeBytes={2 * 1024 * 1024}
                    recommendedAspect="square"
                    token={token}
                    orgId={orgId}
                    onAssetChange={(newUrl) => handleAssetChange('isotype_url', newUrl)}
                    onError={(msg) => showNotification('error', msg)}
                  />

                  {/* Browser Favicon */}
                  <BrandingAssetUploadCard
                    title="Browser Favicon"
                    assetType="favicon"
                    icon="tab"
                    badgeSpec="32×32 px · Max 512KB · ICO/PNG/SVG"
                    helperText="Square icon displayed in the browser tab for your clients."
                    currentUrl={branding.favicon_url}
                    allowedFormats={['.ico', '.png', '.svg']}
                    maxSizeBytes={512 * 1024}
                    recommendedAspect="square"
                    token={token}
                    orgId={orgId}
                    onAssetChange={(newUrl) => handleAssetChange('favicon_url', newUrl)}
                    onError={(msg) => showNotification('error', msg)}
                  />
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="lg:col-span-5 sticky top-28 space-y-4">
              <div className={styles['provider-settings__preview-card']}>
                <div className="flex items-center justify-between">
                  <span className={styles['provider-settings__preview-badge']}>
                    <Icon name="wb_sunny" className="text-xs text-amber-400" />
                    Client-Facing Live Preview (Light Theme)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">White-Label Engine</span>
                </div>

                <p className="text-xs text-slate-400">
                  White-label branding applies exclusively to your clients&apos; experience (light mode). Preview how their portal renders with your customized tokens.
                </p>

                {/* Mock Client Portal Window (Light Theme) */}
                <div className={styles['provider-settings__preview-mockup']}>
                  {/* Browser Window Header with Tab and Favicon */}
                  <div className={styles['provider-settings__preview-browser-header']}>
                    <div className={styles['provider-settings__preview-browser-dots']}>
                      <span className={`${styles['provider-settings__preview-browser-dot']} ${styles['provider-settings__preview-browser-dot--red']}`} />
                      <span className={`${styles['provider-settings__preview-browser-dot']} ${styles['provider-settings__preview-browser-dot--yellow']}`} />
                      <span className={`${styles['provider-settings__preview-browser-dot']} ${styles['provider-settings__preview-browser-dot--green']}`} />
                    </div>
                    <div className={styles['provider-settings__preview-browser-tab']}>
                      {branding.favicon_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={branding.favicon_url}
                          alt="Favicon"
                          className={styles['provider-settings__preview-browser-favicon']}
                        />
                      ) : (
                        <Icon name="tab" className="text-slate-500 text-xs flex-shrink-0" />
                      )}
                      <span className="truncate">
                        {organization.trade_name || organization.legal_name || 'Portal'} · Onboarding
                      </span>
                    </div>
                  </div>

                  {/* Browser URL Bar */}
                  <div className={styles['provider-settings__preview-browser-url']}>
                    <div className="flex items-center gap-1.5 flex-1 bg-white px-2 py-0.5 rounded border border-slate-200/80 shadow-2xs">
                      <Icon name="lock" className="text-emerald-600 text-[11px]" />
                      <span className="text-slate-400">https://</span>
                      <span className="text-slate-700 font-medium">
                        {(organization.trade_name || 'portal').toLowerCase().replace(/[^a-z0-9]/g, '')}.onboarding.com
                      </span>
                      <span className="text-slate-400">/welcome</span>
                    </div>
                  </div>

                  {/* Portal Body (Light Theme Client Portal) */}
                  <div className={styles['provider-settings__preview-body']}>
                    {/* Mock Client Portal Navbar */}
                    <div
                      className={styles['provider-settings__preview-navbar']}
                      style={{
                        backgroundColor: previewThemeStyles['--banner-bg'],
                        borderColor: previewThemeStyles['--banner-border'],
                        color: previewThemeStyles['--banner-text'],
                      }}
                    >
                      <div className={styles['provider-settings__preview-brand']}>
                        {branding.logo_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={branding.logo_url}
                            alt="Brand Logo"
                            className={styles['provider-settings__preview-logo']}
                          />
                        ) : branding.isotype_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <div className={styles['provider-settings__preview-isotype']}>
                            <img
                              src={branding.isotype_url}
                              alt="Isotype"
                              className="size-full object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className={styles['provider-settings__preview-isotype']}
                            style={{ backgroundColor: branding.brand_primary_color || '#1978E5' }}
                          >
                            {organization.trade_name?.charAt(0) || '0'}
                          </div>
                        )}
                        {(!branding.logo_url || branding.isotype_url) && (
                          <span
                            className="text-xs font-bold tracking-tight"
                            style={{ color: previewThemeStyles['--banner-text'] }}
                          >
                            {organization.trade_name || organization.legal_name || 'My Organization'}
                          </span>
                        )}
                      </div>

                      <span
                        className={styles['provider-settings__preview-client-badge']}
                        style={{ backgroundColor: branding.brand_secondary_color || '#10B981' }}
                      >
                        Active Onboarding
                      </span>
                    </div>

                    {/* Mock Onboarding Step Card (Client Light Theme) */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-6 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-2xs"
                            style={{ backgroundColor: branding.brand_primary_color || '#1978E5' }}
                          >
                            1
                          </span>
                          <span className="text-xs font-bold text-slate-800">Legal Agreement & SLA</span>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full font-bold border"
                          style={{
                            backgroundColor: `${branding.brand_accent_color || '#F59E0B'}15`,
                            color: branding.brand_accent_color || '#B45309',
                            borderColor: `${branding.brand_accent_color || '#F59E0B'}40`,
                          }}
                        >
                          Pending Review
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Please review the service agreement and sign the corporate onboarding contract.
                      </p>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">Step 1 of 3</span>
                        <button
                          type="button"
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm transition-all cursor-default flex items-center gap-1.5"
                          style={{ backgroundColor: branding.brand_primary_color || '#1978E5' }}
                        >
                          <span>Review Document</span>
                          <Icon name="arrow_forward" className="text-xs" />
                        </button>
                      </div>

                      {(branding.support_phone || organization.phone) && (
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <span className="text-[10px] text-slate-400">Support Channel</span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <Icon name="chat" className="text-xs" />
                            WhatsApp: {branding.support_phone || organization.phone}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Mock Client Portal Footer */}
                    <div
                      className="flex items-center justify-between p-2.5 rounded-lg border text-[10px] transition-colors"
                      style={{
                        backgroundColor: previewThemeStyles['--footer-bg'],
                        borderColor: previewThemeStyles['--footer-border'],
                        color: previewThemeStyles['--footer-text'],
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Icon name="hub" className="text-xs" style={{ color: branding.brand_primary_color || '#1978E5' }} />
                        <span>© 2026 {organization.trade_name || organization.legal_name || '0nbording'}. All rights reserved.</span>
                      </div>
                      <div className="flex items-center gap-3 opacity-80">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Support</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/50 flex items-start gap-2.5">
                  <Icon name="verified" className="text-blue-400 text-sm mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-blue-200/90 leading-relaxed">
                    White-label tokens (logo, isotype, favicon, and brand colors) are automatically served to the client portal via <code>/settings/branding/:orgId</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Corporate Profile (RF-PV-23) */}
        {activeTab === 'profile' && (
          <div className={styles['provider-settings__panel']}>
            <div className={styles['provider-settings__card']}>
              <div className={styles['provider-settings__card-header']}>
                <div>
                  <h2 className={styles['provider-settings__card-title']}>
                    <Icon name="business" className="text-blue-400" />
                    Corporate Entity Information
                  </h2>
                  <p className={styles['provider-settings__card-description']}>
                    Base commercial and legal data of your company, stored in the core organization registry.
                  </p>
                </div>
              </div>

              <div className={styles['provider-settings__form-grid']}>
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Legal Business Name</label>
                  <input
                    type="text"
                    value={organization.legal_name || ''}
                    onChange={(e) => setOrganization({ ...organization, legal_name: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="Acme Cloud Technologies S.A.S."
                  />
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Commercial / Trade Name</label>
                  <input
                    type="text"
                    value={organization.trade_name || ''}
                    onChange={(e) => setOrganization({ ...organization, trade_name: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="Acme Cloud"
                  />
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Tax ID / NIT / RUT</label>
                  <input
                    type="text"
                    value={organization.tax_id || ''}
                    onChange={(e) => setOrganization({ ...organization, tax_id: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="900.123.456-7"
                  />
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Primary Corporate Email</label>
                  <input
                    type="email"
                    value={organization.email || ''}
                    onChange={(e) => setOrganization({ ...organization, email: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="billing@acmecloud.com"
                  />
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Official Phone Number</label>
                  <input
                    type="tel"
                    value={organization.phone || ''}
                    onChange={(e) => setOrganization({ ...organization, phone: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="+57 300 000 0000"
                  />
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>
                    Support Phone (WhatsApp)
                    <span className={styles['provider-settings__field-hint']}>Direct client support channel in client portal</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                      <Icon name="chat" className="text-sm text-emerald-500" />
                    </div>
                    <input
                      type="text"
                      placeholder="+57 300 123 4567"
                      value={branding.support_phone || ''}
                      onChange={(e) => setBranding({ ...branding, support_phone: e.target.value })}
                      className={`${styles['provider-settings__input']} pl-9`}
                    />
                  </div>
                </div>

                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Country of Incorporation</label>
                  <input
                    type="text"
                    value={organization.country || ''}
                    onChange={(e) => setOrganization({ ...organization, country: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="Colombia"
                  />
                </div>

                <div className={`${styles['provider-settings__field-group']} ${styles['provider-settings__form-full']}`}>
                  <label className={styles['provider-settings__field-label']}>Headquarters Physical Address</label>
                  <input
                    type="text"
                    value={organization.address || ''}
                    onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="Calle 100 # 8A-49, Torre B, Piso 5"
                  />
                </div>

                <div className={`${styles['provider-settings__field-group']} ${styles['provider-settings__form-full']}`}>
                  <label className={styles['provider-settings__field-label']}>Official Website</label>
                  <input
                    type="url"
                    value={organization.website || ''}
                    onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="https://acmecloud.com"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Regional Localization (RF-PV-25) */}
        {activeTab === 'localization' && (
          <div className={styles['provider-settings__panel']}>
            <div className={styles['provider-settings__card']}>
              <div className={styles['provider-settings__card-header']}>
                <div>
                  <h2 className={styles['provider-settings__card-title']}>
                    <Icon name="public" className="text-blue-400" />
                    Regional & Financial Standards
                  </h2>
                  <p className={styles['provider-settings__card-description']}>
                    Set how monetary figures, timestamps, and localized interface copies are rendered.
                  </p>
                </div>
              </div>

              <div className={styles['provider-settings__form-grid']}>
                {/* Currency */}
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Default Currency</label>
                  <select
                    value={localization.currency || 'COP'}
                    onChange={(e) => setLocalization({ ...localization, currency: e.target.value })}
                    className={styles['provider-settings__select']}
                  >
                    <option value="COP">COP - Colombian Peso ($)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="MXN">MXN - Mexican Peso ($)</option>
                    <option value="BRL">BRL - Brazilian Real (R$)</option>
                    <option value="CLP">CLP - Chilean Peso ($)</option>
                  </select>
                </div>

                {/* Language */}
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Primary Platform Language</label>
                  <select
                    value={localization.language || 'es'}
                    onChange={(e) => setLocalization({ ...localization, language: e.target.value })}
                    className={styles['provider-settings__select']}
                  >
                    <option value="es">Español (Latinoamérica)</option>
                    <option value="en">English (US)</option>
                    <option value="pt">Português (Brasil)</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Timezone</label>
                  <select
                    value={localization.timezone || 'America/Bogota'}
                    onChange={(e) => setLocalization({ ...localization, timezone: e.target.value })}
                    className={styles['provider-settings__select']}
                  >
                    <option value="America/Bogota">America/Bogota (UTC -5)</option>
                    <option value="America/Mexico_City">America/Mexico_City (UTC -6)</option>
                    <option value="America/Lima">America/Lima (UTC -5)</option>
                    <option value="America/Santiago">America/Santiago (UTC -3 / -4)</option>
                    <option value="America/Buenos_Aires">America/Buenos_Aires (UTC -3)</option>
                    <option value="America/New_York">America/New_York (UTC -5 / -4)</option>
                    <option value="America/Sao_Paulo">America/Sao_Paulo (UTC -3)</option>
                    <option value="Europe/Madrid">Europe/Madrid (UTC +1 / +2)</option>
                  </select>
                </div>

                {/* Date Format */}
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>Date Display Format</label>
                  <select
                    value={localization.date_format || 'DD/MM/YYYY'}
                    onChange={(e) => setLocalization({ ...localization, date_format: e.target.value })}
                    className={styles['provider-settings__select']}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 28/09/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard, 2026-09-28)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/28/2026)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notification Rules (RF-PV-26) */}
        {activeTab === 'notifications' && (
          <div className={styles['provider-settings__panel']}>
            <div className={styles['provider-settings__card']}>
              <div className={styles['provider-settings__card-header']}>
                <div>
                  <h2 className={styles['provider-settings__card-title']}>
                    <Icon name="mark_email_unread" className="text-blue-400" />
                    Notification Delivery & Channel Rules
                  </h2>
                  <p className={styles['provider-settings__card-description']}>
                    Configure where notifications should be routed and which onboarding milestones trigger alerts.
                  </p>
                </div>
              </div>

              {/* Master Mute & Dispatch Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
                <div className={styles['provider-settings__field-group']}>
                  <label className={styles['provider-settings__field-label']}>
                    Central Notification Email
                    <span className={styles['provider-settings__field-hint']}>Where provider system alerts are sent</span>
                  </label>
                  <input
                    type="email"
                    value={notifications.notification_email || ''}
                    onChange={(e) => setNotifications({ ...notifications, notification_email: e.target.value })}
                    className={styles['provider-settings__input']}
                    placeholder="ops-alerts@acmecloud.com"
                  />
                </div>

                <div className="flex items-center">
                  <div className={`${styles['provider-settings__toggle-card']} w-full`}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>Master Mute Notifications</span>
                      <p className={styles['provider-settings__toggle-desc']}>
                        Temporarily suspend all email and webhook dispatches.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, mute_notifications: !notifications.mute_notifications })}
                      className={`${styles['provider-settings__switch']} ${notifications.mute_notifications ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.mute_notifications ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Specific Trigger Channels */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Onboarding Milestones & Event Subscriptions
                </h3>

                {/* Requests / Homologation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>Email on Action Request Resolved</span>
                      <p className={styles['provider-settings__toggle-desc']}>Notify when a client submits a document or evidence</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, email_on_request: !notifications.email_on_request })}
                      className={`${styles['provider-settings__switch']} ${notifications.email_on_request ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.email_on_request ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>

                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>In-App Badge on Action Request</span>
                      <p className={styles['provider-settings__toggle-desc']}>Create notification bell item in the provider dashboard</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, inapp_on_request: !notifications.inapp_on_request })}
                      className={`${styles['provider-settings__switch']} ${notifications.inapp_on_request ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.inapp_on_request ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Support Tickets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>Email on Support Ticket</span>
                      <p className={styles['provider-settings__toggle-desc']}>Notify when a client opens or replies to a support ticket</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, email_on_ticket: !notifications.email_on_ticket })}
                      className={`${styles['provider-settings__switch']} ${notifications.email_on_ticket ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.email_on_ticket ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>

                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>In-App Badge on Support Ticket</span>
                      <p className={styles['provider-settings__toggle-desc']}>Display ticket counter badge in top navigation</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, inapp_on_ticket: !notifications.inapp_on_ticket })}
                      className={`${styles['provider-settings__switch']} ${notifications.inapp_on_ticket ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.inapp_on_ticket ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Payments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>Email on Subscription Payment</span>
                      <p className={styles['provider-settings__toggle-desc']}>Receive instant confirmation for successful client payments</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, email_on_payment: !notifications.email_on_payment })}
                      className={`${styles['provider-settings__switch']} ${notifications.email_on_payment ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.email_on_payment ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>

                  <div className={styles['provider-settings__toggle-card']}>
                    <div className={styles['provider-settings__toggle-info']}>
                      <span className={styles['provider-settings__toggle-title']}>In-App Badge on Payment</span>
                      <p className={styles['provider-settings__toggle-desc']}>Audit payment events in notifications bell</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifications({ ...notifications, inapp_on_payment: !notifications.inapp_on_payment })}
                      className={`${styles['provider-settings__switch']} ${notifications.inapp_on_payment ? styles['provider-settings__switch--checked'] : ''}`}
                    >
                      <span className={`${styles['provider-settings__switch-thumb']} ${notifications.inapp_on_payment ? styles['provider-settings__switch-thumb--checked'] : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Plan & Quotas (RF-PV-27) */}
        {activeTab === 'plan' && plan && (
          <div className={styles['provider-settings__panel']}>
            <div className={styles['provider-settings__card']}>
              <div className={styles['provider-settings__card-header']}>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className={styles['provider-settings__card-title']}>
                      <Icon name="workspace_premium" className="text-amber-400" />
                      Plan: {plan.name}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active Subscription
                    </span>
                  </div>
                  <p className={styles['provider-settings__card-description']}>
                    Next automated billing renewal date: <strong className="text-white">{plan.renewal_date}</strong>
                  </p>
                </div>

                <Button variant="outline" size="sm">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <Icon name="upgrade" />
                    <span>Upgrade Plan</span>
                  </div>
                </Button>
              </div>

              {/* Usage Quotas */}
              <div className={styles['provider-settings__quota-grid']}>
                {/* Products Quota */}
                <div className={styles['provider-settings__quota-card']}>
                  <div className={styles['provider-settings__quota-header']}>
                    <span>Published Products</span>
                    <Icon name="inventory_2" />
                  </div>
                  <div className={styles['provider-settings__quota-numbers']}>
                    <span>{plan.products_used}</span>
                    <span className={styles['provider-settings__quota-limit']}>/ {plan.products_limit}</span>
                  </div>
                  <div className={styles['provider-settings__progress-track']}>
                    <div
                      className={styles['provider-settings__progress-fill']}
                      style={{ width: `${Math.min(100, (plan.products_used / plan.products_limit) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {plan.products_limit - plan.products_used} product slots remaining
                  </span>
                </div>

                {/* Clients Quota */}
                <div className={styles['provider-settings__quota-card']}>
                  <div className={styles['provider-settings__quota-header']}>
                    <span>Managed Clients</span>
                    <Icon name="people" />
                  </div>
                  <div className={styles['provider-settings__quota-numbers']}>
                    <span>{plan.clients_used}</span>
                    <span className={styles['provider-settings__quota-limit']}>/ {plan.clients_limit}</span>
                  </div>
                  <div className={styles['provider-settings__progress-track']}>
                    <div
                      className={styles['provider-settings__progress-fill']}
                      style={{ width: `${Math.min(100, (plan.clients_used / plan.clients_limit) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {plan.clients_limit - plan.clients_used} client slots available
                  </span>
                </div>

                {/* Storage Quota */}
                <div className={styles['provider-settings__quota-card']}>
                  <div className={styles['provider-settings__quota-header']}>
                    <span>Document Storage</span>
                    <Icon name="cloud" />
                  </div>
                  <div className={styles['provider-settings__quota-numbers']}>
                    <span>{plan.storage_used_gb} GB</span>
                    <span className={styles['provider-settings__quota-limit']}>/ {plan.storage_limit_gb} GB</span>
                  </div>
                  <div className={styles['provider-settings__progress-track']}>
                    <div
                      className={styles['provider-settings__progress-fill']}
                      style={{ width: `${Math.min(100, (plan.storage_used_gb / plan.storage_limit_gb) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {(plan.storage_limit_gb - plan.storage_used_gb).toFixed(1)} GB cloud capacity left
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Alert */}
        {feedback && (
          <div
            className={`${styles['provider-settings__toast']} ${feedback.type === 'success'
                ? styles['provider-settings__toast--success']
                : styles['provider-settings__toast--error']
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
      <Footer />
    </div>
  );
}
