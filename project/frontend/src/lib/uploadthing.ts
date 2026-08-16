import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UploadedFile = {
  ufsUrl: string;
  url: string;
  name: string;
  size: number;
  key: string;
};

type UseUploadthingProps = {
  onClientUploadComplete?: (res: UploadedFile[]) => void;
  onUploadError?: (error: Error) => void;
};

type ImageUploaderResult = {
  openImagePicker: (opts?: {
    source?: 'library' | 'camera';
    onCancel?: () => void;
    onInsufficientPermissions?: () => void;
  }) => Promise<void>;
  isUploading: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000';
const UPLOAD_URL = `${SERVER_URL}/uploadthing`;

async function uploadFileToUploadthing(
  endpoint: string,
  uri: string,
  name: string,
  mimeType: string,
  size: number = 0,
): Promise<UploadedFile> {
  const targetUrl = `${UPLOAD_URL}?actionType=upload&slug=${endpoint}`;

  // Step 1: Request a pre-signed URL from our uploadthing endpoint
  const presignRes = await fetch(targetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name, size, type: mimeType }],
      acl: 'public-read',
      endpoint,
    }),
  });

  if (!presignRes.ok) {
    const errorText = await presignRes.text();
    console.error('Uploadthing presign error:', errorText);
    throw new Error(`Failed to get upload URL: ${presignRes.status}. ${errorText}`);
  }

  const presignData = (await presignRes.json()) as Array<{
    url: string;
    fields?: Record<string, string>;
    key: string;
    fileUrl: string;
    ufsUrl?: string;
  }>;

  const { url, fields = {}, key, fileUrl, ufsUrl } = presignData[0];

  // Step 2: Upload the file using a multipart form
  const formData = new FormData();
  Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
  formData.append('file', { uri, name, type: mimeType } as any);

  const uploadRes = await fetch(url, { method: 'PUT', body: formData });
  if (!uploadRes.ok) {
    const uploadErr = await uploadRes.text();
    throw new Error(`Upload failed: ${uploadRes.status} ${uploadErr}`);
  }

  const uploadedData = await uploadRes.json();

  return {
    key,
    url: uploadedData.url || `https://utfs.io/f/${key}`,
    ufsUrl: uploadedData.ufsUrl || uploadedData.url || `https://utfs.io/f/${key}`,
    name,
    size,
  };
}

// ---------------------------------------------------------------------------
// Hook – same API as @uploadthing/expo's useImageUploader
// Uses expo-document-picker (pure JS, no native module required)
// ---------------------------------------------------------------------------

export function useImageUploader(
  endpoint: 'restaurantImage' | 'menuItemImage',
  props: UseUploadthingProps = {},
): ImageUploaderResult {
  const [isUploading, setIsUploading] = useState(false);

  async function openImagePicker(opts?: {
    source?: 'library' | 'camera';
    onCancel?: () => void;
    onInsufficientPermissions?: () => void;
  }) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        opts?.onCancel?.();
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const name = asset.name ?? `upload-${Date.now()}.jpg`;
      const size = asset.size ?? 0;

      setIsUploading(true);
      const uploaded = await uploadFileToUploadthing(
        endpoint,
        asset.uri,
        name,
        mimeType,
        size,
      );
      props.onClientUploadComplete?.([uploaded]);
    } catch (err) {
      props.onUploadError?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return { openImagePicker, isUploading };
}

// ---------------------------------------------------------------------------
// useDocumentUploader – same API as @uploadthing/expo's useDocumentUploader
// ---------------------------------------------------------------------------

export function useDocumentUploader(
  endpoint: string,
  props: UseUploadthingProps = {},
) {
  const [isUploading, setIsUploading] = useState(false);

  async function openDocumentPicker(opts?: { onCancel?: () => void }) {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        opts?.onCancel?.();
        return;
      }

      const asset = result.assets[0];
      const mimeType = asset.mimeType ?? 'application/octet-stream';
      const name = asset.name ?? `upload-${Date.now()}`;
      const size = asset.size ?? 0;

      setIsUploading(true);
      const uploaded = await uploadFileToUploadthing(
        endpoint,
        asset.uri,
        name,
        mimeType,
        size,
      );
      props.onClientUploadComplete?.([uploaded]);
    } catch (err) {
      props.onUploadError?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return { openDocumentPicker, isUploading };
}
