'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { PublicProviderBranding, BannerFooterTheme } from '../lib/api/provider';
import { EffectiveProvider } from '../lib/api/dashboard';

export interface BannerFooterStyles {
  '--banner-bg': string;
  '--banner-text': string;
  '--banner-text-muted': string;
  '--banner-border': string;
  '--banner-active': string;
  '--footer-bg': string;
  '--footer-text': string;
  '--footer-border': string;
  '--footer-link': string;
  themeType: BannerFooterTheme;
}

export function getBannerFooterStyles(theme?: string, primaryColor: string = '#1978E5'): BannerFooterStyles {
  switch (theme) {
    case 'light':
      return {
        '--banner-bg': '#ffffff',
        '--banner-text': '#1e293b',
        '--banner-text-muted': '#64748b',
        '--banner-border': '#e2e8f0',
        '--banner-active': primaryColor,
        '--footer-bg': '#ffffff',
        '--footer-text': '#64748b',
        '--footer-border': '#e2e8f0',
        '--footer-link': '#1e293b',
        themeType: 'light',
      };
    case 'primary_light_text':
      return {
        '--banner-bg': primaryColor,
        '--banner-text': '#ffffff',
        '--banner-text-muted': '#e2e8f0',
        '--banner-border': 'rgba(255, 255, 255, 0.18)',
        '--banner-active': '#ffffff',
        '--footer-bg': primaryColor,
        '--footer-text': '#f1f5f9',
        '--footer-border': 'rgba(255, 255, 255, 0.18)',
        '--footer-link': '#ffffff',
        themeType: 'primary_light_text',
      };
    case 'primary_dark_text':
      return {
        '--banner-bg': primaryColor,
        '--banner-text': '#0f172a',
        '--banner-text-muted': '#334155',
        '--banner-border': 'rgba(0, 0, 0, 0.15)',
        '--banner-active': '#000000',
        '--footer-bg': primaryColor,
        '--footer-text': '#1e293b',
        '--footer-border': 'rgba(0, 0, 0, 0.15)',
        '--footer-link': '#0f172a',
        themeType: 'primary_dark_text',
      };
    case 'dark':
    default:
      return {
        '--banner-bg': '#0f1523',
        '--banner-text': '#cbd5e1',
        '--banner-text-muted': '#94a3b8',
        '--banner-border': '#1e293b',
        '--banner-active': primaryColor,
        '--footer-bg': '#0f1523',
        '--footer-text': '#94a3b8',
        '--footer-border': '#1e293b',
        '--footer-link': '#cbd5e1',
        themeType: 'dark',
      };
  }
}

interface BrandContextType {
  branding: PublicProviderBranding | null;
  providerSlug?: string;
  availableProviders?: EffectiveProvider[];
  styles: BannerFooterStyles;
}

const BrandContext = createContext<BrandContextType>({
  branding: null,
  styles: getBannerFooterStyles('dark'),
});

export function getContrastColor(hexColor?: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 160 ? '#0f172a' : '#ffffff';
}

export function BrandProvider({
  children,
  branding,
  providerSlug,
  availableProviders = [],
}: {
  children: React.ReactNode;
  branding: PublicProviderBranding | null;
  providerSlug?: string;
  availableProviders?: EffectiveProvider[];
}) {
  const primaryColor = branding?.brand_primary_color || '#1978E5';
  const primaryContrast = getContrastColor(primaryColor);
  const themeStyles = getBannerFooterStyles(branding?.banner_footer_theme, primaryColor);

  useEffect(() => {
    if (branding) {
      if (branding.brand_primary_color) {
        document.documentElement.style.setProperty('--brand-primary', branding.brand_primary_color);
        document.documentElement.style.setProperty('--brand-primary-contrast', getContrastColor(branding.brand_primary_color));
      }
      if (branding.brand_secondary_color) {
        document.documentElement.style.setProperty('--brand-secondary', branding.brand_secondary_color);
      }
      if (branding.brand_accent_color) {
        document.documentElement.style.setProperty('--brand-accent', branding.brand_accent_color);
      }
      if (branding.favicon_url) {
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'shortcut icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = branding.favicon_url;
      }
    }

    return () => {
      document.documentElement.style.removeProperty('--brand-primary');
      document.documentElement.style.removeProperty('--brand-primary-contrast');
      document.documentElement.style.removeProperty('--brand-secondary');
      document.documentElement.style.removeProperty('--brand-accent');
    };
  }, [branding]);

  return (
    <BrandContext.Provider value={{ branding, providerSlug, availableProviders, styles: themeStyles }}>
      <div
        className="white-label-client-scope w-full flex-1 flex flex-col bg-[#f5f6f8] text-slate-900 antialiased"
        style={
          {
            '--brand-primary': primaryColor,
            '--brand-primary-contrast': primaryContrast,
            '--brand-secondary': branding?.brand_secondary_color || '#0f172a',
            '--brand-accent': branding?.brand_accent_color || '#38bdf8',
            ...themeStyles,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </BrandContext.Provider>
  );
}

export function useProviderBranding() {
  return useContext(BrandContext);
}
