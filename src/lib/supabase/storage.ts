import { getSupabaseClient } from './client';

export type StorageBucketName =
  | 'product-images'
  | 'business-assets'
  | 'storefront-assets'
  | 'avatars'
  | 'documents'
  | 'appeals';

export async function uploadSupabaseFile(
  bucket: StorageBucketName,
  path: string,
  file: File | Blob
): Promise<{ publicUrl: string | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { publicUrl: null, error: 'Supabase client is not configured.' };
  }

  const { data, error } = await client.storage
    .from(bucket)
    .upload(path, file, { upsert: true });

  if (error) {
    return { publicUrl: null, error: error.message };
  }

  const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(data.path);
  return { publicUrl: publicUrlData.publicUrl, error: null };
}

export async function deleteSupabaseFile(
  bucket: StorageBucketName,
  path: string
): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client is not configured.' };
  }

  const { error } = await client.storage.from(bucket).remove([path]);
  return { error: error ? error.message : null };
}

export function getSupabasePublicUrl(bucket: StorageBucketName, path: string): string | null {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
