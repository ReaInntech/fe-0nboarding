'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { PublicProviderBranding } from '../lib/api/provider';
import { EffectiveProvider } from '../lib/api/dashboard';

interface BrandContextType {
  branding: PublicProviderBranding | null;
  providerSlug?: string;
  availableProviders?: EffectiveProvider[];
}

const BrandContext = createContext<BrandContextType>({
  branding: null,
});

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
  useEffect(() => {
    if (branding) {
      if (branding.brand_primary_color) {
        document.documentElement.style.setProperty('--brand-primary', branding.brand_primary_color);
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
      document.documentElement.style.removeProperty('--brand-secondary');
      document.documentElement.style.removeProperty('--brand-accent');
    };
  }, [branding]);

  return (
    <BrandContext.Provider value={{ branding, providerSlug, availableProviders }}>
      <div
        className="white-label-client-scope w-full flex-1 flex flex-col bg-[#f5f6f8] text-slate-900 antialiased"
        style={
          {
            '--brand-primary': branding?.brand_primary_color || '#1978e5',
            '--brand-secondary': branding?.brand_secondary_color || '#0f172a',
            '--brand-accent': branding?.brand_accent_color || '#38bdf8',
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
