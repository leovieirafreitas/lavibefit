"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
                    pre_title: "Nova Coleção 2026",
                    title: "Treine com",
                    subtitle: "Atitude e Estilo",
                    button_text: "Conferir Agora",
                    description: "Descubra peças desenvolvidas com tecido de alta compressão e tecnologia dry-fit.",
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

    if (slides.length === 0) return <div className="h-[650px] bg-gray-100 flex items-center justify-center">Carregando...</div>;

    const slide = slides[current];

    return (
        <section className="relative h-[650px] w-full bg-gray-100 overflow-hidden group">

            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden">
                        <Image
                            src={slide.image_url}
                            alt={slide.title || 'Banner'}
                            fill
                            priority={current === 0} // Prioridade apenas para primeiro slide
                            quality={85}
                            sizes="100vw"
                            className="object-cover object-center scale-105"
                            style={{ objectPosition: 'center 20%' }}
                        />
                        {/* Styles Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/30 to-transparent sm:via-white/50"></div>
                    </div>

                    <div className="container mx-auto px-6 h-full flex items-center relative z-10">
                        <div className="max-w-xl pl-4 md:pl-0">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                {slide.pre_title && (
                                    <h2 className="text-[#DD3468] font-black tracking-widest uppercase text-sm mb-4">
                                        {slide.pre_title}
                                    </h2>
                                )}

                                <h1 className="text-5xl md:text-7xl font-bold text-black leading-[0.95] mb-6 uppercase">
                                    {slide.title} <br />
                                    <span className="text-[#DD3468]">{slide.subtitle}</span>
                                </h1>

                                {slide.description && (
                                    <p className="text-gray-700 text-lg mb-8 font-medium max-w-md leading-relaxed hidden md:block">
                                        {slide.description}
                                    </p>
                                )}

                                <a
                                    href={slide.link || '#'}
                                    className="inline-block h-12 px-10 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-[#DD3468] transition-colors duration-300 shadow-lg rounded-none leading-[48px] text-center"
                                >
                                    {slide.button_text}
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {slides.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-20">
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${idx === current ? 'bg-[#DD3468]' : 'bg-gray-400 hover:bg-gray-600'}`}
                            ></div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
