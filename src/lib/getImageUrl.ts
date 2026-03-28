import { supabase } from '../supabase';

/**
 * Returns an optimized image URL from Supabase Storage.
 * Falls back to the raw URL if the path is already a full URL.
 */
export function smartImageUrl(
  pathOrUrl: string | null | undefined,
  { width = 800, quality = 80 }: { width?: number; quality?: number } = {}
): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  const { data } = supabase.storage.from('listings').getPublicUrl(pathOrUrl, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: { width, quality, format: 'webp' } as any,
  });
  return data?.publicUrl ?? '';
}
