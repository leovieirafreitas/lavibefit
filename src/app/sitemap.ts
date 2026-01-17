import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://site-lavibefit.vercel.app';

    // Static Routes
    const routes = [
        '',
        '/lancamentos',
        '/feminino',
        '/feminino/leggings',
        '/feminino/shorts',
        '/feminino/tops',
        '/feminino/conjuntos',
        '/blusas-regatas',
        '/acessorios',
        '/combos',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Routes (Products)
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: products } = await supabase
            .from('products')
            .select('id, updated_at');

        const productRoutes = products?.map((product) => ({
            url: `${baseUrl}/produto/${product.id}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        })) || [];

        return [...routes, ...productRoutes];

    } catch (error) {
        console.error('Sitemap Error:', error);
        return routes;
    }
}
