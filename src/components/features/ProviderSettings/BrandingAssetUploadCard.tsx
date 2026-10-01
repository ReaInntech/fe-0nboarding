'use client';

import React, { useState, useRef } from 'react';
import { useFileUpload } from '@/src/libs/hooks/useFileUpload';
import Icon from '@/src/components/shared/atoms/Icon';
import Button from '@/src/components/shared/atoms/Button';

export interface BrandingAssetUploadCardProps {
  title: string;
  assetType: 'logo' | 'isotype' | 'favicon';
  icon: string;
  badgeSpec: string;
  helperText: string;
  currentUrl?: string | null;
  allowedFormats: string[];
  maxSizeBytes: number;
  recommendedAspect?: 'square' | 'wide';
  token?: string;
  orgId?: string;
  onAssetChange: (newUrl: string | null) => void;
  onError: (msg: string) => void;
}

export default function BrandingAssetUploadCard({
  title,
  assetType,
  icon,
  badgeSpec,
  helperText,
  currentUrl,
  allowedFormats,
  maxSizeBytes,
  recommendedAspect,
  token,
  orgId,
  onAssetChange,
  onError,
}: BrandingAssetUploadCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, isUploading, progress } = useFileUpload();

  const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(1).replace('.0', '');

  const validateAndUploadFile = async (file: File) => {
    // 1. Validate file existence
    if (!file) return;

    // 2. Validate format / extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedFormats.includes(ext)) {
      onError(`Invalid format (${ext || 'unknown'}). Supported formats: ${allowedFormats.join(', ')}`);
      return;
    }

    // 3. Validate size
    if (file.size > maxSizeBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      onError(`File size is ${sizeMb} MB and exceeds the maximum allowed size of ${maxMb} MB.`);
      return;
    }

    // 4. Validate aspect ratio if recommended
    if (recommendedAspect === 'square' && file.type.startsWith('image/')) {
      try {
        const dimensions = await getImageDimensions(file);
        if (Math.abs(dimensions.width - dimensions.height) > 4) {
          console.warn(`Asset ${file.name} is not square: ${dimensions.width}x${dimensions.height}`);
        }
      } catch (e) {
        // Dimension check is advisory, continue upload if read fails
      }
    }

    // 5. Upload to DigitalOcean Spaces
    try {
      const publicUrl = await uploadFile(file, 'branding', token, orgId);
      onAssetChange(publicUrl);
    } catch (err: any) {
      console.error(`Failed to upload ${assetType}:`, err);
      onError(err?.message || `Failed to upload ${title} to DigitalOcean Spaces.`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndUploadFile(file);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3.5 transition-all hover:border-slate-700/80">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedFormats.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) validateAndUploadFile(file);
        }}
      />

      {/* Header with Title and Specification Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Icon name={icon} className="text-base" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide">{title}</h4>
            <p className="text-[11px] text-slate-400">{helperText}</p>
          </div>
        </div>

        {/* Dimension & Size Badge Chip */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold whitespace-nowrap shrink-0">
          {badgeSpec}
        </span>
      </div>

      {/* Upload State / Preview State */}
      {currentUrl ? (
        /* Image Preview Box with Checkerboard background for transparent PNGs/SVGs */
        <div className="space-y-3">
          <div className="relative rounded-xl border border-slate-800 p-4 flex items-center justify-center min-h-[100px] overflow-hidden bg-slate-950/80">
            {/* Transparency Checkerboard */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #475569 25%, transparent 25%),
                  linear-gradient(-45deg, #475569 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #475569 75%),
                  linear-gradient(-45deg, transparent 75%, #475569 75%)
                `,
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt={title}
              className={`relative z-10 object-contain max-h-16 ${
                assetType === 'favicon' ? 'size-8' : assetType === 'isotype' ? 'size-14' : 'max-w-[220px]'
              }`}
            />
          </div>

          {/* Action Buttons: Replace & Remove (No DigitalOcean link) */}
          <div className="flex items-center justify-end gap-2 text-xs pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="py-1 px-3 text-xs"
            >
              <div className="flex items-center gap-1.5 text-slate-100">
                <Icon name="sync" className="text-xs text-blue-400" />
                <span>Replace</span>
              </div>
            </Button>
            <button
              type="button"
              onClick={() => onAssetChange(null)}
              disabled={isUploading}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center gap-1"
              title="Remove asset"
            >
              <Icon name="delete" className="text-xs" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 py-2">
              <Icon name="sync" className="text-2xl text-blue-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-200">Uploading to DigitalOcean Spaces...</p>
              <div className="w-48 mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="size-10 mx-auto rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center text-lg">
                <Icon name="cloud_upload" />
              </div>
              <p className="text-xs font-semibold text-white">
                Click to upload or drag and drop your file
              </p>
              <p className="text-[11px] text-slate-400">
                Formats: <code className="text-slate-300">{allowedFormats.join(', ')}</code> · Max {maxMb} MB
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
