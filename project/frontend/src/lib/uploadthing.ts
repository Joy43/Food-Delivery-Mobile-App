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

const UPLOAD_URL = `${process.env.EXPO_PUBLIC_SERVER_URL}/api/uploadthing`;

async function uploadFileToUploadthing(
  endpoint: string,
  uri: string,
  name: string,
  mimeType: string,
): Promise<UploadedFile> {
  // Step 1: Request a pre-signed URL from our uploadthing endpoint
  const presignRes = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      files: [{ name, size: 0, type: mimeType }],
      acl: 'public-read',
      endpoint,
    }),
  });

  if (!presignRes.ok) {
    throw new Error(`Failed to get upload URL: ${presignRes.status}`);
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

  const uploadRes = await fetch(url, { method: 'POST', body: formData });
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${uploadRes.status}`);
  }

  return {
    key,
    url: fileUrl,
    ufsUrl: ufsUrl ?? fileUrl,
    name,
    size: 0,
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

      setIsUploading(true);
      const uploaded = await uploadFileToUploadthing(
        endpoint,
        asset.uri,
        name,
        mimeType,
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

      setIsUploading(true);
      const uploaded = await uploadFileToUploadthing(
        endpoint,
        asset.uri,
        name,
        mimeType,
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
