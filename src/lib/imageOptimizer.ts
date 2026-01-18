/**
 * Optimizes Supabase Storage image URLs with transformation parameters
 * @param url - Original Supabase Storage URL
 * @param options - Transformation options
 * @returns Optimized URL with transformations
 */
export function optimizeSupabaseImage(
    url: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'webp' | 'avif' | 'jpg';
    } = {}
): string {
    if (!url) return url;

    // Check if it's a Supabase Storage URL
    if (!url.includes('supabase.co/storage')) {
        return url;
    }

    const { width, height, quality = 75, format = 'webp' } = options;

    // Build transformation parameters
    const params = new URLSearchParams();

    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    params.append('format', format);

    // Add transformation parameters to URL
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
}

/**
 * Generate optimized image URLs for different use cases
 */
export const imageOptimizer = {
    thumbnail: (url: string) => optimizeSupabaseImage(url, { width: 150, quality: 50 }),
    card: (url: string) => optimizeSupabaseImage(url, { width: 600, quality: 60 }),
    product: (url: string) => optimizeSupabaseImage(url, { width: 1200, quality: 70 }),
    hero: (url: string) => optimizeSupabaseImage(url, { width: 1920, quality: 80 }),
};
