"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
    const [slides, setSlides] = useState<any[]>([]);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        async function fetchSlides() {
            const { data } = await supabase.from('hero_slides').select('*').eq('active', true).order('display_order', { ascending: true });
            if (data && data.length > 0) {
                setSlides(data);
            } else {
                // Fallback default slide
                setSlides([{
                    id: 0,
                    image_url: "https://images.unsplash.com/photo-1574680096141-1cddd32e38e1?q=80&w=2669&auto=format&fit=crop",
                    link: "#"
                }]);
            }
        }
        fetchSlides();
    }, []);

    // Auto-advance
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [current, slides.length]);

    const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

    if (slides.length === 0) return <div className="h-[50vh] bg-gray-100 flex items-center justify-center">Carregando...</div>;

    const slide = slides[current];

    return (
        <section className="relative w-full overflow-hidden group">
            {/* 
                Responsive Aspect Ratio Container 
                Mobile: 1080x1080 (1:1 or square)
                Desktop: 1800x900 (2:1)
            */}
            <div className="relative w-full aspect-square md:aspect-[2/1]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Link wrapper for the entire slide */}
                        <Link href={slide.link || '#'} className="block w-full h-full relative cursor-pointer">

                            {/* Desktop Image (Visible on md+) */}
                            <div className="hidden md:block absolute inset-0 w-full h-full">
                                <Image
                                    src={slide.image_url}
                                    alt={slide.title || 'Banner'}
                                    fill
                                    priority={true} // Always priority as it is the active slide
                                    quality={80}
                                    sizes="100vw"
                                    className="object-cover object-center"
                                />
                            </div>

                            {/* Mobile Image (Visible on mobile) - Fallback to desktop image if no mobile url */}
                            <div className="block md:hidden absolute inset-0 w-full h-full">
                                <Image
                                    src={slide.mobile_image_url || slide.image_url}
                                    alt={slide.title || 'Banner Mobile'}
                                    fill
                                    priority={true}
                                    quality={80}
                                    sizes="100vw"
                                    className="object-cover object-center"
                                />
                            </div>

                        </Link>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                    <>
                        <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20">
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20">
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Dots */}
                        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                            {slides.map((_, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setCurrent(idx)}
                                    className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer transition-colors ${idx === current ? 'bg-[#DD3468]' : 'bg-gray-400 hover:bg-gray-600'}`}
                                ></div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
