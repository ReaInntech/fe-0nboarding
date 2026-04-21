import { useState } from 'react';

// Adjust the base URL to point to NextJS BFF or directly to NestJS (depending on architecture)
// In a typical NextJS+NestJS BFF, requests go to Next.js API Routes, which proxies to NestJS.
// We will assume a direct Next.js to NestJS call for now (or whatever API fetcher is standard in the project).
const API_BASE_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'http://localhost:3001/api/v1/core';

interface UploadResponse {
  uploadUrl: string;
  key: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    entity: 'products' | 'avatars' | 'documents',
    token: string, // JWT to authenticate with Core API
  ): Promise<string> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // 1. Get Pre-signed URL from Core API
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      
      console.log(`Requesting upload URL for: ${sanitizedFilename} (${file.type})`);

      const response = await fetch(`${API_BASE_URL}/storage/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filename: sanitizedFilename,
          contentType: file.type,
          entity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get upload URL from server');
      }

      const body = await response.json();
      
      // Standardize data extraction based on backend ResponseInterceptor { data, meta, error }
      // and possible double nesting from API proxies/BFF
      const result = body.data?.data || body.data || body;
      
      if (!result || !result.uploadUrl || !result.key) {
        console.error('Unexpected response structure from storage/upload-url:', body);
        throw new Error('Server response missing upload configuration (uploadUrl or key)');
      }

      const { uploadUrl, key } = result as UploadResponse;

      // 2. Upload directly to DigitalOcean Spaces via PUT
      // This fetch is native and won't have the typical Authorization headers for DO Spaces,
      // as they are embedded in the uploadUrl (query parameters).
      const uploadObjectResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          // x-amz-acl is optional but common if forcing private, DO may require it matching the command
          'x-amz-acl': 'private',
        },
        body: file,
      });

      if (!uploadObjectResponse.ok) {
        throw new Error(`Failed to upload to S3: ${uploadObjectResponse.statusText}`);
      }

      setProgress(100);
      setIsUploading(false);

      // Return ONLY the key, to be stored in the database
      return key;
    } catch (err: any) {
      setError(err.message);
      setIsUploading(false);
      throw err;
    }
  };

  return { uploadFile, isUploading, progress, error };
};
