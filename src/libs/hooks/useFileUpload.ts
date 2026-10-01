import { useState } from 'react';

// Adjust the base URL to point to NextJS BFF or directly to NestJS (depending on architecture)
// In a typical NextJS+NestJS BFF, requests go to Next.js API Routes, which proxies to NestJS.
// We will assume a direct Next.js to NestJS call for now (or whatever API fetcher is standard in the project).
// In a browser environment, default to Next.js BFF proxy (/api/v1/core) to automatically pass session cookies and avoid CORS
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_CORE_API_URL) {
    return process.env.NEXT_PUBLIC_CORE_API_URL;
  }
  if (typeof window !== 'undefined') {
    return '/api/v1/core';
  }
  return 'http://localhost:3001/api/v1/core';
};

export interface UploadResponse {
  uploadUrl: string;
  key: string;
  publicUrl?: string;
}

export interface UploadResult {
  key: string;
  publicUrl: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    entity: 'products' | 'avatars' | 'documents' | 'branding',
    token?: string, // JWT to authenticate with Core API
    orgId?: string,
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Ensure active authentication token (auto-retrieve from Firebase client SDK if not passed)
      let authToken = token;
      if (!authToken && typeof window !== 'undefined') {
        try {
          const { auth } = await import('@/src/lib/firebase/config');
          if (auth?.currentUser) {
            authToken = await auth.currentUser.getIdToken();
          }
        } catch (authErr) {
          console.warn('[useFileUpload] Could not retrieve fresh token from client Firebase Auth:', authErr);
        }
      }

      // 2. Get Pre-signed URL from Core API
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const baseUrl = getBaseUrl();
      
      console.log(`[useFileUpload] Requesting upload URL for: ${sanitizedFilename} (${file.type}) - Entity: ${entity}`);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (authToken) {
        headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
      }
      if (orgId) {
        headers['X-Org-ID'] = orgId;
      }

      const response = await fetch(`${baseUrl}/storage/upload-url`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: sanitizedFilename,
          contentType: file.type,
          entity,
          orgId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg =
          errorData.error ||
          errorData.message ||
          errorData.detail ||
          `Error ${response.status}: No se pudo obtener la URL de subida`;
        throw new Error(errorMsg);
      }

      const body = await response.json();
      
      // Standardize data extraction based on backend ResponseInterceptor { data, meta, error }
      const result = body.data?.data || body.data || body;
      
      if (!result || !result.uploadUrl || !result.key) {
        console.error('Unexpected response structure from storage/upload-url:', body);
        throw new Error('Server response missing upload configuration (uploadUrl or key)');
      }

      const { uploadUrl, key, publicUrl } = result as UploadResponse;

      // 3. Upload directly to DigitalOcean Spaces via PUT
      const aclHeader = entity === 'branding' ? 'public-read' : 'private';

      setProgress(25);

      const uploadObjectResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'x-amz-acl': aclHeader,
        },
        body: file,
      });

      if (!uploadObjectResponse.ok) {
        const respText = await uploadObjectResponse.text().catch(() => '');
        throw new Error(`Error al subir a DigitalOcean Spaces (${uploadObjectResponse.status}): ${uploadObjectResponse.statusText || respText}`);
      }

      setProgress(100);
      setIsUploading(false);

      // Return publicUrl for branding assets (for direct web loading), or key for documents
      return entity === 'branding' && publicUrl ? publicUrl : key;
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
      throw err;
    }
  };

  return { uploadFile, isUploading, progress, error };
};
