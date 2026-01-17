"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { ShoppingBag, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id;

    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [topBarText, setTopBarText] = useState('');
    const [reviewName, setReviewName] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const { addToCart } = useCart();
    const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

    useEffect(() => {
        fetchData();
    }, [productId]);

    useEffect(() => {
        if (variants.length > 0) {
            const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
            if (colors.length > 0 && !selectedColor) {
                setSelectedColor(colors[0]); // Auto-select first color
            }
        }
    }, [variants]);

    // Clear size if color changes (optional, but safer)
    useEffect(() => {
        setSelectedSize('');
    }, [selectedColor]);

    async function fetchData() {
        try {
            // Fetch top bar text
            const { data: settingsData } = await supabase
                .from('global_settings')
                .select('value')
                .eq('key', 'top_bar_text')
                .single();
            if (settingsData) setTopBarText(settingsData.value);

            // Fetch product
            const { data: productData, error: productError } = await supabase
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (productError) throw productError;
            setProduct(productData);

            // Fetch variants (sizes and stock)
            const { data: variantsData } = await supabase
                .from('product_variants')
                .select('*')
                .eq('product_id', productId)
                .order('size');
            setVariants(variantsData || []);

            // Fetch reviews
            const { data: reviewsData } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false });
            setReviews(reviewsData || []);

        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitReview(e: React.FormEvent) {
        e.preventDefault();
        if (!reviewName || !reviewComment) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        setSubmittingReview(true);
        try {
            const { error } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: productId,
                    customer_name: reviewName,
                    rating: reviewRating,
                    comment: reviewComment,
                    verified: false // User generated
                });

            if (error) throw error;

            alert('Avaliação enviada com sucesso!');
            setReviewName('');
            setReviewComment('');
            setReviewRating(5);
            // Refresh details to show new review
            fetchData();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Erro ao enviar avaliação.');
        } finally {
            setSubmittingReview(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar initialTopBarText={topBarText} />
                <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                    <p className="text-gray-500">Carregando produto...</p>
                </div>
                <Footer />
            </main>
        );
    }

    if (!product) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar initialTopBarText={topBarText} />
                <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                    <p className="text-gray-500">Produto não encontrado</p>
                    <button onClick={() => router.push('/')} className="mt-4 text-[#DD3468] font-bold">
                        Voltar para a loja
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    // Parse images - always include main image first, then gallery images
    let images = [];
    if (product.image_url) {
        images.push(product.image_url);
    }
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        // Add gallery images, but avoid duplicating the main image
        const galleryImages = product.images.filter((img: string) => img !== product.image_url);
        images = [...images, ...galleryImages];
    }
    // Fallback to placeholder if no images at all
    if (images.length === 0) {
        images = ["https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=2574&auto=format&fit=crop"];
    }

    // Calculate prices
    const hasDiscount = (product.discount_percent || 0) > 0;
    const originalPrice = hasDiscount ? product.price / (1 - (product.discount_percent || 0) / 100) : product.price;
    const selectedVariant = variants.find(v => v.size === selectedSize && (v.color === selectedColor || !v.color));
    const finalPrice = selectedVariant?.price || product.price;
    const hasPix = (product.pix_discount || 0) > 0;
    const pixPrice = hasPix ? finalPrice * (1 - (product.pix_discount || 0) / 100) : null;

    // Stock & Availability Logic
    const totalStock = variants.length > 0
        ? variants.reduce((acc, v) => acc + v.stock, 0)
        : product.stock;

    const isComingSoon = product.is_coming_soon;
    const isUnavailable = !isComingSoon && totalStock === 0;

    // Calculate average rating
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return (
        <main className="min-h-screen bg-white">
            <Navbar initialTopBarText={topBarText} />

            <div className="pt-24 pb-12 container mx-auto px-4 md:px-6">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <button onClick={() => router.push('/')} className="hover:text-[#DD3468]">Página inicial</button>
                    <span className="mx-2">/</span>
                    <span>{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left: Image Gallery */}
                    <div>
                        {/* Main Image */}
                        <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden mb-4">
                            <Image
                                src={images[selectedImageIndex] || product.image_url}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
                                quality={85}
                            />
                            {hasDiscount && (
                                <span className="absolute top-4 right-4 bg-[#DD3468] text-white text-xs font-bold px-3 py-1 uppercase rounded">
                                    -{product.discount_percent}%
                                </span>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImageIndex(idx)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-[#DD3468]' : 'border-transparent'
                                            }`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="(max-width: 768px) 25vw, 150px" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product Info */}
                    <div>
                        {/* Badge */}
                        {hasDiscount && (
                            <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1 uppercase rounded mb-3">
                                PRODUTO EM PROMOÇÃO
                            </span>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

                        {/* Rating */}
                        {reviews.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">({reviews.length})</span>
                            </div>
                        )}

                        {/* Price */}
                        {!isComingSoon && (
                            <div className="mb-6">
                                <p className="text-xs text-gray-500 uppercase mb-1">Preço Individual</p>
                                <div className="flex items-baseline gap-3">
                                    {hasDiscount && (
                                        <span className="text-gray-400 text-lg line-through">R$ {originalPrice.toFixed(2)}</span>
                                    )}
                                    <span className="text-4xl font-bold text-gray-900">R$ {finalPrice.toFixed(2)}</span>
                                </div>
                                {product.installments && (
                                    <p className="text-sm text-gray-600 mt-2">{product.installments}</p>
                                )}
                                {hasPix && pixPrice && (
                                    <p className="text-green-600 font-bold mt-2">
                                        R$ {pixPrice.toFixed(2)} no PIX ({product.pix_discount}% OFF)
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Color Selector */}
                        {[...new Set(variants.map(v => v.color).filter(Boolean))].length > 0 && (
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-3">Cor: {selectedColor}</label>
                                <div className="flex flex-wrap gap-2">
                                    {[...new Set(variants.map(v => v.color).filter(Boolean))].map((color: string) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 border-2 rounded-lg font-bold text-sm transition-all ${selectedColor === color
                                                ? 'border-black bg-black text-white'
                                                : 'border-gray-200 text-gray-600 hover:border-black'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Size Selector */}
                        {variants.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold mb-3">Tamanho: {selectedSize || 'Selecione'}</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {variants
                                        .filter(v => !v.color || v.color === selectedColor)
                                        .map((variant) => (
                                            <div key={variant.id} className="flex flex-col">
                                                <button
                                                    onClick={() => setSelectedSize(variant.size)}
                                                    disabled={variant.stock === 0}
                                                    className={`py-3 px-4 border-2 rounded font-bold text-sm transition-all ${selectedSize === variant.size
                                                        ? 'border-[#DD3468] bg-[#DD3468] text-white'
                                                        : variant.stock > 0
                                                            ? 'border-gray-300 hover:border-[#DD3468]'
                                                            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    {variant.size}
                                                </button>
                                                <span className={`text-xs text-center mt-1 ${variant.stock === 0
                                                    ? 'text-red-500 font-bold'
                                                    : variant.stock <= 5
                                                        ? 'text-orange-500 font-bold'
                                                        : 'text-gray-500'
                                                    }`}>
                                                    {variant.stock === 0 ? 'Esgotado' : `${variant.stock} un.`}
                                                </span>
                                                {variant.price && variant.price !== product.price && !isComingSoon && (
                                                    <span className="text-[10px] text-center text-green-600 font-bold">
                                                        R$ {variant.price}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart / Availablity Button */}
                        <button
                            onClick={() => {
                                if (isComingSoon || isUnavailable) return;
                                if (!selectedSize) {
                                    alert('Por favor, selecione um tamanho');
                                    return;
                                }
                                const selectedVariant = variants.find(v => v.size === selectedSize);
                                if (selectedVariant && selectedVariant.stock > 0) {
                                    addToCart({
                                        productId: product.id,
                                        name: product.name,
                                        price: finalPrice,
                                        size: selectedSize,
                                        image: product.image_url,
                                        discount_percent: product.discount_percent,
                                        pix_discount: product.pix_discount,
                                        stock: selectedVariant.stock,
                                        color: selectedVariant.color // Pass color to cart
                                    });
                                    alert('Produto adicionado ao carrinho!');
                                } else {
                                    alert('Produto sem estoque');
                                }
                            }}
                            disabled={isComingSoon || isUnavailable || (!selectedSize && variants.length > 0) || (selectedSize && variants.find(v => v.size === selectedSize)?.stock === 0)}
                            className={`w-full font-bold py-4 rounded-lg uppercase tracking-wide transition-colors flex items-center justify-center gap-2 mb-3 
                                ${isComingSoon
                                    ? 'bg-orange-500 text-white cursor-not-allowed opacity-90'
                                    : isUnavailable
                                        ? 'bg-red-500 text-white cursor-not-allowed opacity-90'
                                        : 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white'
                                }`}
                        >
                            {isComingSoon ? (
                                <>
                                    <Star className="w-5 h-5 fill-white" />
                                    {product.launch_date ? `EM BREVE - LANÇAMENTO DIA ${product.launch_date}` : 'LANÇAMENTO EM BREVE'}
                                </>
                            ) : isUnavailable ? (
                                'INDISPONÍVEL'
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    Adicionar ao Carrinho
                                </>
                            )}
                        </button>

                        {/* Wishlist */}
                        <button
                            onClick={() => {
                                if (isFavorite(product.id)) {
                                    removeFromFavorites(product.id);
                                } else {
                                    addToFavorites({
                                        productId: product.id,
                                        name: product.name,
                                        price: finalPrice,
                                        image: product.image_url || '',
                                        category: product.category
                                    });
                                }
                            }}
                            className={`w-full border-2 font-bold py-3 rounded-lg uppercase tracking-wide transition-colors flex items-center justify-center gap-2 ${isFavorite(product.id)
                                ? 'border-[#DD3468] text-[#DD3468] bg-pink-50'
                                : 'border-gray-300 text-gray-700 hover:border-[#DD3468] hover:text-[#DD3468]'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                            {isFavorite(product.id) ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                        </button>

                        {/* Description */}
                        {product.description && (
                            <div className="mt-8 pt-8 border-t">
                                <h3 className="font-bold text-lg mb-3">Descrição</h3>
                                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                    {product.description}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 pt-16 border-t">
                    <h2 className="text-2xl font-bold mb-8">Avaliações</h2>

                    {/* Review Form */}
                    <div className="bg-gray-50 p-6 rounded-lg mb-8 border">
                        <h3 className="font-bold text-lg mb-4">Deixe sua avaliação</h3>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Seu Nome</label>
                                <input
                                    type="text"
                                    value={reviewName}
                                    onChange={(e) => setReviewName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Ex: Maria Silva"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Sua Nota</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Comentário</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full p-2 border rounded h-24"
                                    placeholder="O que você achou deste produto?"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="bg-black text-white font-bold py-2 px-6 rounded hover:bg-gray-800 disabled:bg-gray-400"
                            >
                                {submittingReview ? 'Enviando...' : 'Enviar Avaliação'}
                            </button>
                        </form>
                    </div>

                    {/* Reviews List */}
                    {reviews.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.slice(0, 6).map((review) => (
                                <div key={review.id} className="border rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="font-bold text-sm mb-1">{review.customer_name}</p>
                                    {review.verified && (
                                        <span className="text-xs text-green-600 font-bold">Verificado</span>
                                    )}
                                    <p className="text-gray-700 text-sm mt-3">{review.comment}</p>
                                </div>
                            ))}
                        </div>

                    )}
                </div>

            </div>
            <Footer />
        </main>
    );
}
