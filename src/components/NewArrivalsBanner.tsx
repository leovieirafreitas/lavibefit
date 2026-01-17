import Link from 'next/link';
import { supabase } from '@/lib/supabase';

async function getBannerContent() {
    const { data } = await supabase.from('home_content').select('*').eq('id', 2).single();
    return data;
}

export default async function NewArrivalsBanner() {
    const content = await getBannerContent();
    const title = content?.title || "Lançamentos";
    const linkUrl = content?.link_url || "/lancamentos";
    const imageUrl = content?.image_url || "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2670&auto=format&fit=crop";
    const mobileImageUrl = content?.mobile_image_url || imageUrl;
    const desktopPosition = content?.desktop_position || 'center center';
    const mobilePosition = content?.mobile_position || 'center center';

    return (
        <section className="w-full h-auto md:h-[720px] overflow-hidden relative">
            <Link href={linkUrl} className="block w-full h-full">
                {/* Desktop Image */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="hidden md:block w-full h-full object-cover"
                    style={{ objectPosition: desktopPosition }}
                />

                {/* Mobile Image */}
                <img
                    src={mobileImageUrl}
                    alt={title}
                    className="block md:hidden w-full h-auto object-cover"
                    style={{ objectPosition: mobilePosition }}
                />
            </Link>
        </section>
    );
}
