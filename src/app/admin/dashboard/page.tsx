"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Images,
    LayoutTemplate,
    LogOut,
    Menu,
    X,
    Image as ImageIcon,
    Plus,
    Trash2,
    Edit,
    Users,
    DollarSign,
    Save,
    MessageCircle,
    GripVertical
} from 'lucide-react';

// --- Types ---
type Order = {
    id: number;
    order_number: string;
    customer_name: string;
    total: number;
    payment_status: string;
    created_at: string;
    items: any[];
    address_city: string;
    address_state: string;
    customer_phone?: string;
};

type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    images?: string[];
    category: string;
    variants: ProductVariant[];
    slug?: string;
    discount_percent?: number;
    installments?: string;
    pix_discount?: number;
    is_coming_soon?: boolean;
    launch_date?: string;
    color?: string;
    display_order?: number;
};

type Review = {
    id: number;
    product_id: number;
    customer_name: string;
    rating: number;
    comment: string;
    created_at: string;
    verified: boolean;
};

type ProductVariant = {
    id?: number;
    product_id?: number;
    size: string;
    stock: number;
    color?: string;
    price?: number;
};

type HeroSlide = {
    id: number;
    title: string;
    subtitle: string;
    image_url: string;
    mobile_image_url?: string;
    link_url: string;
    button_text: string;
    active: boolean;
    display_order: number;
};

// Mapeando a tabela home_content real do usuário
type HomeContent = {
    id: number; // 1 = PromoBlack, 2 = NewArrivalsBlue
    title?: string;
    subtitle?: string;
    pre_title?: string;
    description?: string;
    button_text?: string;
    image_url?: string;
    mobile_image_url?: string;
    link_url?: string;
    desktop_position?: string;
    mobile_position?: string;
    active?: boolean;
};

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [homeContent, setHomeContent] = useState<HomeContent[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [topBarText, setTopBarText] = useState('');
    const [topBarActive, setTopBarActive] = useState(true);

    // Stats
    const [stats, setStats] = useState({
        todaySales: 0,
        monthSales: 0,
        totalSales: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        lowStock: 0
    });

    useEffect(() => {
        checkUser();
        fetchData();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) router.push('/admin/login');
    };

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchOrders(),
            fetchProducts(),
            fetchHeroSlides(),
            fetchHomeContent(),
            fetchReviews(),
            fetchGlobalSettings()
        ]);
        setLoading(false);
    };



    // --- Fetchers ---
    const fetchOrders = async () => {
        const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (data) {
            setOrders(data);
            calculateStats(data);
        }
    };

    const fetchProducts = async () => {
        const { data } = await supabase.from('products').select(`*, variants:product_variants(*)`).order('created_at', { ascending: false });
        if (data) {
            setProducts(data);

            // Calculate Product Stats
            let lowStockCount = 0;
            data.forEach(p => {
                const hasLowStock = p.variants?.some((v: any) => v.stock < 3) || !p.variants?.length;
                if (hasLowStock) lowStockCount++;
            });

            setStats(prev => ({
                ...prev,
                totalProducts: data.length,
                lowStock: lowStockCount
            }));
        }
    };

    const fetchHeroSlides = async () => {
        const { data } = await supabase.from('hero_slides').select('*').order('display_order', { ascending: true });
        if (data) setHeroSlides(data);
    };

    const fetchHomeContent = async () => {
        const { data } = await supabase.from('home_content').select('*').order('id', { ascending: true });
        if (data) setHomeContent(data);
    };

    const fetchReviews = async () => {
        const { data } = await supabase.from('product_reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviews(data);
    };

    const calculateStats = (ordersData: Order[]) => {
        const today = new Date().toDateString();
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let todayTotal = 0, monthTotal = 0, allTotal = 0, pending = 0;

        ordersData.forEach(order => {
            if (order.payment_status === 'approved') {
                allTotal += order.total;
                const d = new Date(order.created_at);
                if (d.toDateString() === today) todayTotal += order.total;
                if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthTotal += order.total;
            }
            if (['pending', 'in_process'].includes(order.payment_status)) pending++;
        });
        setStats(prev => ({
            ...prev,
            todaySales: todayTotal,
            monthSales: monthTotal,
            totalSales: allTotal,
            totalOrders: ordersData.length,
            pendingOrders: pending
        }));
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, bucket: string): Promise<string | null> => {
        if (!e.target.files?.length) return null;
        const file = e.target.files[0];
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        setUploading(true);

        const { error } = await supabase.storage.from(bucket).upload(fileName, file);
        if (error) {
            alert('Erro no upload: ' + error.message);
            setUploading(false);
            return null;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
        setUploading(false);
        return data.publicUrl;
    };

    // --- Product Actions ---
    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setLoading(true);

        const payload = {
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            image_url: editingProduct.image_url,
            images: editingProduct.images || [],
            category: editingProduct.category,
            discount_percent: editingProduct.discount_percent,
            installments: editingProduct.installments,
            pix_discount: editingProduct.pix_discount,
            is_coming_soon: editingProduct.is_coming_soon,
            launch_date: editingProduct.launch_date,
            color: editingProduct.color
        };

        try {
            let pid = editingProduct.id;
            if (pid) {
                await supabase.from('products').update(payload).eq('id', pid);
            } else {
                const { data } = await supabase.from('products').insert(payload).select().single();
                if (data) pid = data.id;
            }

            if (editingProduct.variants) {
                for (const v of editingProduct.variants) {
                    if (v.id) await supabase.from('product_variants').update({ stock: v.stock, color: v.color, size: v.size, price: v.price }).eq('id', v.id);
                    else await supabase.from('product_variants').insert({ ...v, product_id: pid });
                }
            }
            setIsProductModalOpen(false);
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar produto');
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm('Excluir produto?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchProducts();
    };

    // --- Slide Actions ---
    const saveSlide = async () => {
        if (!editingSlide) return;

        // Explicit payload to avoid sending system columns like 'created_at'
        const payload = {
            title: editingSlide.title,
            subtitle: editingSlide.subtitle,
            image_url: editingSlide.image_url,
            link: editingSlide.link_url, // Adjusted to match DB column 'link'
            button_text: editingSlide.button_text || 'Ver Agora',
            active: editingSlide.active !== undefined ? editingSlide.active : true,
            display_order: editingSlide.display_order || 0
        };

        const { error } = editingSlide.id
            ? await supabase.from('hero_slides').update(payload).eq('id', editingSlide.id)
            : await supabase.from('hero_slides').insert(payload);

        if (error) {
            console.error('Erro salvar slide:', error);
            alert('Erro ao salvar slide. Verifique se todos os campos estão preenchidos.');
        } else {
            setIsSlideModalOpen(false);
            fetchHeroSlides();
        }
    };

    const deleteSlide = async (id: number) => {
        if (!confirm('Excluir slide?')) return;
        await supabase.from('hero_slides').delete().eq('id', id);
        fetchHeroSlides();
    };

    const deleteReview = async (id: number) => {
        if (!confirm('Excluir avaliação?')) return;
        await supabase.from('product_reviews').delete().eq('id', id);
        fetchReviews();
    };

    // --- Home Content Actions ---
    const saveHomeContent = async (item: HomeContent) => {
        // Explicit payload
        const payload = {
            title: item.title,
            subtitle: item.subtitle,
            pre_title: item.pre_title,
            description: item.description,
            button_text: item.button_text,
            image_url: item.image_url,
            mobile_image_url: item.mobile_image_url,
            link_url: item.link_url,
            desktop_position: item.desktop_position,
            mobile_position: item.mobile_position,
            active: item.active !== false // Default to true if undefined
        };

        const { error } = await supabase.from('home_content').upsert({ ...payload, id: item.id }).select();

        if (error) {
            alert('Erro ao salvar conteúdo home.');
        } else {
            alert('Conteúdo salvo com sucesso!');
            fetchHomeContent();
        }
    };

    const saveTopBarText = async () => {
        const { error: textError } = await supabase
            .from('global_settings')
            .upsert({ key: 'top_bar_text', value: topBarText });

        const { error: activeError } = await supabase
            .from('global_settings')
            .upsert({ key: 'top_bar_active', value: String(topBarActive) });

        if (textError || activeError) {
            alert('Erro ao salvar configurações do topo.');
        } else {
            alert('Configurações do topo salvas com sucesso!');
        }
    };

    const fetchGlobalSettings = async () => {
        const { data: textData } = await supabase
            .from('global_settings')
            .select('value')
            .eq('key', 'top_bar_text')
            .single();
        if (textData) setTopBarText(textData.value);

        const { data: activeData } = await supabase
            .from('global_settings')
            .select('value')
            .eq('key', 'top_bar_active')
            .single();
        if (activeData) setTopBarActive(activeData.value === 'true');
    };



    const sendWhatsApp = (order: Order) => {
        if (!order.customer_phone) {
            alert('Telefone do cliente não disponível neste pedido.');
            return;
        }

        const phone = order.customer_phone.replace(/\D/g, '');
        const paymentLink = `${window.location.origin}/checkout/success?order=${order.order_number}`;

        let message = `Olá, ${order.customer_name}! 👋\n\n`;
        message += `Vimos que seu pedido *#${order.order_number}* na La Vibe Fit está pendente.\n`;
        message += `Para finalizar sua compra e garantir seus produtos, acesse o link abaixo:\n\n`;
        message += `${paymentLink}\n\n`;
        message += `Qualquer dúvida, estamos à disposição parça!`;

        const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const clearPendingOrders = async () => {
        if (!confirm('⚠️ ATENÇÃO: Tem certeza que deseja EXCLUIR TODOS os pedidos PENDENTES?\n\nEssa ação apagará permanentemente todos os pedidos não pagos e não poderá ser desfeita.')) {
            return;
        }

        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('payment_status', 'pending');

        if (error) {
            alert('Erro ao excluir pedidos: ' + error.message);
        } else {
            alert('Todos os pedidos pendentes foram excluídos com sucesso!');
            fetchOrders();
            // Update stats too if needed, but let's re-fetch all
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">

            {/* Sidebar Dark */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-black text-white shadow-xl transform ${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300`}>
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div className="relative w-48 h-14">
                        <Image
                            src="/logosite.png"
                            alt="La Vibe Fit"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <button onClick={() => setMenuOpen(false)} className="md:hidden"><X size={24} /></button>
                </div>

                <nav className="p-4 space-y-1">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Visão Geral' },
                        { id: 'orders', icon: ShoppingBag, label: 'Pedidos' },
                        { id: 'products', icon: Package, label: 'Produtos' },
                        { id: 'order-products', icon: GripVertical, label: 'Ordenar Produtos' },
                        { id: 'reviews', icon: MessageCircle, label: 'Avaliações' },
                        { id: 'slides', icon: Images, label: 'Banner / Slides' },
                        { id: 'offers', icon: LayoutTemplate, label: 'Conteúdo Home' },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${activeTab === item.id
                                ? 'bg-white text-black font-bold'
                                : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                }`}
                        >
                            <item.icon size={18} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button - Fixed at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-black">
                    <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-gray-900 rounded-md transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm font-medium">Sair do Painel</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-x-hidden">
                <div className="md:hidden mb-6 flex justify-between items-center bg-white p-4 rounded shadow">
                    <button onClick={() => setMenuOpen(true)}><Menu size={24} /></button>
                    <span className="font-bold uppercase tracking-wide">{activeTab}</span>
                </div>

                {/* --- OVERVIEW --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* SALES ROW */}
                            <div className="bg-black text-white p-6 rounded-lg shadow-lg">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Vendas Hoje</p>
                                <p className="text-3xl font-bold mt-2">R$ {stats.todaySales.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Vendas Mês</p>
                                <p className="text-3xl font-bold mt-2 text-gray-900">R$ {stats.monthSales.toFixed(2)}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pedidos Pendentes</p>
                                <p className="text-[32px] font-bold mt-2 text-yellow-600 leading-none">{stats.pendingOrders}</p>
                            </div>

                            {/* INVENTORY ROW */}
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Produtos Cadastrados</p>
                                        <p className="text-3xl font-bold mt-2 text-gray-900">{stats.totalProducts}</p>
                                    </div>
                                    <Package className="text-gray-300" size={24} />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Alerta de Estoque</p>
                                        <p className={`text-3xl font-bold mt-2 ${stats.lowStock > 0 ? 'text-red-500' : 'text-green-500'}`}>{stats.lowStock}</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Itens com menos de 3 un.</p>
                                    </div>
                                    <span className={`w-3 h-3 rounded-full ${stats.lowStock > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Geral Vendas</p>
                                <p className="text-2xl font-bold mt-2 text-gray-900">R$ {stats.totalSales.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Recent Orders Table (Overview Version) */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><ShoppingBag size={18} /> Últimos Pedidos</h2>
                                <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-blue-600 hover:underline uppercase">Ver Todos</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Pedido</th>
                                            <th className="px-6 py-3">Cliente</th>
                                            <th className="px-6 py-3">Total</th>
                                            <th className="px-6 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-bold text-gray-700">#{order.order_number}</td>
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-gray-900">{order.customer_name}</div>
                                                    <div className="text-[10px] text-gray-400">{order.address_city}</div>
                                                </td>
                                                <td className="px-6 py-3 font-bold text-gray-900">R$ {order.total.toFixed(2)}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.payment_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {order.payment_status === 'approved' ? 'Pago' :
                                                            order.payment_status === 'pending' ? 'Pendente' : order.payment_status}
                                                    </span>
                                                    {order.payment_status === 'pending' && (
                                                        <button
                                                            onClick={() => sendWhatsApp(order)}
                                                            className="ml-2 text-green-600 hover:text-green-800"
                                                            title="Enviar cobrança no WhatsApp"
                                                        >
                                                            <MessageCircle size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400 text-xs">Sem pedidos recentes.</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* Critical Stock Alert Table */}
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    Estoque Crítico (Por Tamanho)
                                </h2>
                                <button onClick={() => setActiveTab('products')} className="text-xs font-bold text-blue-600 hover:underline uppercase">Gerenciar Produtos</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Produto</th>
                                            <th className="px-6 py-3">Situação do Estoque</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {products.filter(p => p.variants?.some(v => v.stock < 3)).slice(0, 10).map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative border">
                                                            {product.image_url ? (
                                                                <Image src={product.image_url} alt="" fill className="object-cover" sizes="40px" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">FOTO</div>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-gray-800">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.variants?.map(v => (
                                                            v.stock < 3 && (
                                                                <div key={v.id} title={`${v.stock} unidades restantes`} className={`flex items-center border rounded px-2 py-1 text-xs font-bold ${v.stock === 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
                                                                    <span className="mr-1">{v.size}:</span>
                                                                    <span>{v.stock} un.</span>
                                                                </div>
                                                            )
                                                        ))}
                                                        {product.variants?.filter(v => v.stock >= 3).length > 0 && (
                                                            <span className="text-[10px] text-gray-400 self-center ml-1">
                                                                (+{product.variants.filter(v => v.stock >= 3).length} ok)
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {products.filter(p => p.variants?.some(v => v.stock < 3)).length === 0 && (
                                            <tr><td colSpan={2} className="p-6 text-center text-gray-400 text-xs">Nenhum produto com estoque crítico! 🎉</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ORDERS --- */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Últimos Pedidos</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={clearPendingOrders}
                                    className="bg-red-500 text-white px-4 py-2 rounded text-xs font-bold hover:bg-red-600 flex items-center gap-2 transition-colors"
                                    title="Excluir todos os pedidos com status Pendente"
                                >
                                    <Trash2 size={14} /> LIMPAR PENDENTES
                                </button>
                                <button onClick={fetchOrders} className="text-sm text-blue-600 hover:underline px-2">Atualizar</button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-black text-white uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Pedido</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Total</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Itens</th>
                                        <th className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-bold">
                                                #{order.order_number}
                                                <div className="text-xs text-gray-500 font-normal">
                                                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold">{order.customer_name}</div>
                                                <div className="text-xs text-gray-400">{order.address_city}/{order.address_state}</div>
                                            </td>
                                            <td className="px-6 py-4 font-bold">R$ {order.total.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.payment_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {order.payment_status === 'approved' ? 'Aprovado' :
                                                        order.payment_status === 'pending' ? 'Pendente' :
                                                            order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">
                                                {order.items?.map((i: any) => `${i.quantity}x ${i.title}`).join(', ') || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {order.payment_status === 'pending' && (
                                                    <button
                                                        onClick={() => sendWhatsApp(order)}
                                                        className="flex items-center gap-1 bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-600 transition-colors"
                                                    >
                                                        <MessageCircle size={14} /> Enviar Msg
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Nenhum pedido encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- PRODUCTS --- */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
                            <button
                                onClick={() => {
                                    setEditingProduct({
                                        id: 0, name: '', description: '', price: 0, image_url: '', images: [],
                                        category: 'tops', discount_percent: 0, installments: '', pix_discount: 0, variants: [], is_coming_soon: false
                                    });
                                    setIsProductModalOpen(true);
                                }}
                                className="bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 flex items-center gap-2 text-sm font-bold"
                            >
                                <Plus size={16} /> NOVO PRODUTO
                            </button>
                        </div>

                        {/* Product Grid Clean */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map(p => (
                                <div key={p.id} className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                                    <div className="relative h-64 bg-gray-100 flex items-center justify-center border-b">
                                        {p.is_coming_soon && (
                                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase z-10 shadow-sm">
                                                Em Breve
                                            </div>
                                        )}
                                        {p.image_url ?
                                            <Image src={p.image_url} alt={p.name} fill className="object-cover" /> :
                                            <ImageIcon className="text-gray-300 w-12 h-12" />
                                        }
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-sm text-gray-900 line-clamp-1" title={p.name}>{p.name}</h3>
                                            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded uppercase">{p.category}</span>
                                        </div>
                                        {p.color && <span className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Cor: {p.color}</span>}
                                        <p className="font-bold text-lg text-gray-900 mb-3">R$ {p.price.toFixed(2)}</p>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {p.variants?.map(v => (
                                                <span key={v.id} className={`text-[10px] px-1.5 py-0.5 rounded border ${v.stock < 1 ? 'bg-red-50 border-red-200 text-red-500 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                    {v.size}: {v.stock}
                                                </span>
                                            ))}
                                            {!p.variants?.length && <span className="text-xs text-red-400">Sem estoque</span>}
                                        </div>

                                        <div className="mt-auto flex gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                                className="flex-1 bg-gray-100 text-gray-800 py-2 rounded text-sm font-bold hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Edit size={14} /> EDITAR
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(p.id)}
                                                className="w-10 bg-red-50 text-red-500 rounded flex justify-center items-center hover:bg-red-600 hover:text-white transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ORDER PRODUCTS --- */}
                {activeTab === 'order-products' && (
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800 mb-2">Ordenar Produtos na Home</h2>
                            <p className="text-sm text-gray-500">Arraste os produtos para definir a ordem de exibição na página inicial</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                {products
                                    .sort((a, b) => (a.display_order || 999) - (b.display_order || 999))
                                    .map((product, index) => (
                                        <div
                                            key={product.id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.effectAllowed = 'move';
                                                e.dataTransfer.setData('text/plain', product.id.toString());
                                                e.currentTarget.style.opacity = '0.5';
                                            }}
                                            onDragEnd={(e) => {
                                                e.currentTarget.style.opacity = '1';
                                            }}
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.dataTransfer.dropEffect = 'move';
                                            }}
                                            onDrop={async (e) => {
                                                e.preventDefault();
                                                const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
                                                const draggedProduct = products.find(p => p.id === draggedId);
                                                const targetProduct = product;

                                                if (!draggedProduct || draggedId === targetProduct.id) return;

                                                // Reorder logic
                                                const newProducts = [...products].sort((a, b) => (a.display_order || 999) - (b.display_order || 999));
                                                const draggedIndex = newProducts.findIndex(p => p.id === draggedId);
                                                const targetIndex = newProducts.findIndex(p => p.id === targetProduct.id);

                                                // Remove dragged item and insert at new position
                                                const [removed] = newProducts.splice(draggedIndex, 1);
                                                newProducts.splice(targetIndex, 0, removed);

                                                // Update display_order for all products
                                                const updates = newProducts.map((p, idx) => ({
                                                    id: p.id,
                                                    display_order: idx + 1
                                                }));

                                                // Save to database
                                                for (const update of updates) {
                                                    await supabase
                                                        .from('products')
                                                        .update({ display_order: update.display_order })
                                                        .eq('id', update.id);
                                                }

                                                // Refresh products
                                                await fetchProducts();
                                            }}
                                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 cursor-move transition-all"
                                        >
                                            <GripVertical className="text-gray-400" size={20} />
                                            <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                                                {product.image_url && (
                                                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm">{product.name}</h3>
                                                <p className="text-xs text-gray-500">R$ {product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="text-sm text-gray-500 font-mono">
                                                #{product.display_order || index + 1}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* --- REVIEWS --- */}
                {activeTab === 'reviews' && (
                    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden animate-fadeIn">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Avaliações de Clientes</h2>
                            <button onClick={fetchReviews} className="text-sm text-blue-600 hover:underline px-2">Atualizar</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-black text-white uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Produto</th>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-6 py-3">Nota</th>
                                        <th className="px-6 py-3">Comentário</th>
                                        <th className="px-6 py-3">Data</th>
                                        <th className="px-6 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reviews.map((review) => {
                                        const product = products.find(p => p.id === review.product_id);
                                        return (
                                            <tr key={review.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {product ? (
                                                            <>
                                                                <div className="w-8 h-8 relative rounded overflow-hidden flex-shrink-0">
                                                                    {product.image_url && <Image src={product.image_url} alt="" fill className="object-cover" />}
                                                                </div>
                                                                <span className="font-bold text-xs truncate max-w-[150px]" title={product.name}>{product.name}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">Produto Deletado</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold">{review.customer_name}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 max-w-xs">{review.comment}</td>
                                                <td className="px-6 py-4 text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => deleteReview(review.id)} className="text-red-500 hover:text-red-700">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {reviews.length === 0 && (
                                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Nenhuma avaliação encontrada.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'slides' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Banners Rotativos (Hero)</h2>
                            <button
                                onClick={() => {
                                    setEditingSlide({ id: 0, title: '', subtitle: '', image_url: '', link_url: '', button_text: 'Ver Agora', active: true, display_order: 0 });
                                    setIsSlideModalOpen(true);
                                }}
                                className="bg-black text-white px-5 py-2.5 rounded hover:bg-gray-800 flex items-center gap-2 text-sm font-bold"
                            >
                                <Plus size={16} /> NOVO SLIDE
                            </button>
                        </div>
                        <div className="space-y-4">
                            {heroSlides.map(slide => (
                                <div key={slide.id} className="bg-white p-4 rounded border flex gap-4 items-center">
                                    <div className="w-48 h-24 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                        {slide.image_url && <Image src={slide.image_url} alt="Slide" fill className="object-cover" sizes="192px" />}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{slide.title || 'Sem Título'}</h3>
                                        <p className="text-gray-500 text-sm">{slide.subtitle}</p>
                                        <a href={slide.link_url} className="text-blue-500 text-xs hover:underline mt-1 block">{slide.link_url}</a>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditingSlide(slide); setIsSlideModalOpen(true); }} className="p-2 hover:bg-gray-100 rounded"><Edit size={18} /></button>
                                        <button onClick={() => deleteSlide(slide.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                            ))}
                            {heroSlides.length === 0 && <p className="text-gray-500 italic">Nenhum slide cadastrado.</p>}
                        </div>
                    </div>
                )}

                {/* --- HOME CONTENT (Offers) --- */}
                {activeTab === 'offers' && (
                    <div className="space-y-12 pb-20">
                        {/* Header */}
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Conteúdo da Home</h2>
                            <p className="text-gray-500 text-sm">Gerencie os banners fixos de "Lançamentos" e "Promoção".</p>
                        </div>

                        {/* Text Top Bar */}
                        {(() => {
                            return (
                                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden mb-8">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">📢 Texto do Topo (Barra Preta)</h3>
                                        <button onClick={saveTopBarText} className="bg-black text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-800">SALVAR</button>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <input
                                                type="checkbox"
                                                id="topBarActive"
                                                checked={topBarActive}
                                                onChange={(e) => setTopBarActive(e.target.checked)}
                                                className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                                            />
                                            <label htmlFor="topBarActive" className="text-sm font-bold text-gray-700 select-none cursor-pointer">
                                                Exibir barra no site
                                            </label>
                                        </div>

                                        <label className="block text-xs font-bold uppercase mb-2">Texto Exibido</label>
                                        <input
                                            className="w-full p-2 border rounded"
                                            value={topBarText}
                                            onChange={e => setTopBarText(e.target.value)}
                                            placeholder="Ex: FRETE GRÁTIS PARA TODA MANAUS..."
                                        />
                                        <p className="text-gray-400 text-xs mt-2">Este texto aparece na barra preta no topo de todas as páginas.</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* BLOCK 1: NEW ARRIVALS (ID=2) */}
                        {(() => {
                            const item = homeContent.find(x => x.id === 2) || { id: 2, image_url: '', mobile_image_url: '', link_url: '/lancamentos' };
                            return (
                                <div className="bg-white rounded border border-blue-100 shadow-sm overflow-hidden">
                                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                        <h3 className="font-bold text-blue-900 flex items-center gap-2"><Images size={18} /> Banner Lançamentos (Azul)</h3>
                                        <button onClick={() => saveHomeContent(item)} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-blue-700">SALVAR</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">
                                                Imagem Desktop (Horizontal) <span className="text-gray-400 font-normal lowercase ml-1">(rec: 1920x600px)</span>
                                            </label>
                                            <div className="aspect-video bg-gray-100 rounded relative group overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                                                {item.image_url ? <Image src={item.image_url} alt="Desktop" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">Upload Desktop</div>}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { const url = await handleFileUpload(e, 'banners'); if (url) { setHomeContent(prev => { const others = prev.filter(x => x.id !== 2); return [...others, { ...item, image_url: url }] }) } }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">
                                                Imagem Mobile (Vertical) <span className="text-gray-400 font-normal lowercase ml-1">(rec: 600x800px)</span>
                                            </label>
                                            <div className="aspect-[3/4] w-1/2 bg-gray-100 rounded relative group overflow-hidden border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors">
                                                {item.mobile_image_url ? <Image src={item.mobile_image_url} alt="Mobile" fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">Upload Mobile</div>}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { const url = await handleFileUpload(e, 'banners'); if (url) { setHomeContent(prev => { const others = prev.filter(x => x.id !== 2); return [...others, { ...item, mobile_image_url: url }] }) } }} />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold uppercase mb-1">Link de Destino</label>
                                            <input className="w-full p-2 border rounded" value={item.link_url || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 2 ? { ...p, link_url: e.target.value } : p))} />
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.active !== false}
                                                    onChange={e => setHomeContent(prev => prev.map(p => p.id === 2 ? { ...p, active: e.target.checked } : p))}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                                <span className="font-bold text-sm">
                                                    {item.active !== false ? '✅ Banner Ativo (visível no site)' : '❌ Banner Desativado (oculto)'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}

                        {/* BLOCK 2: PROMO COMBO (ID=1) */}
                        {(() => {
                            const item = homeContent.find(x => x.id === 1) || { id: 1, title: 'COMBO TREINO', subtitle: 'COMPLETO', description: '', button_text: 'APROVEITAR', image_url: '' };
                            return (
                                <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><LayoutTemplate size={18} /> Banner Promoção (Preto)</h3>
                                        <button onClick={() => saveHomeContent(item)} className="bg-black text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-gray-800">SALVAR</button>
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-2">
                                                Imagem do Produto <span className="text-gray-400 font-normal lowercase ml-1">(rec: 800x800px)</span>
                                            </label>
                                            <div className="aspect-square w-2/3 bg-gray-100 rounded relative group overflow-hidden border-2 border-dashed border-gray-200 hover:border-gray-800 transition-colors">
                                                {item.image_url ? <Image src={item.image_url} alt="Promo" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" /> : <div className="flex items-center justify-center h-full text-gray-400 text-xs">Upload Imagem</div>}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { const url = await handleFileUpload(e, 'banners'); if (url) { setHomeContent(prev => { const others = prev.filter(x => x.id !== 1); return [...others, { ...item, image_url: url }] }) } }} />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Pré-Título (Rosa)</label>
                                                <input className="w-full p-2 border rounded" value={item.pre_title || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, pre_title: e.target.value } : p))} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Título</label>
                                                    <input className="w-full p-2 border rounded" value={item.title || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, title: e.target.value } : p))} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase mb-1">Subtítulo (Cinza)</label>
                                                    <input className="w-full p-2 border rounded" value={item.subtitle || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, subtitle: e.target.value } : p))} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Descrição</label>
                                                <textarea rows={3} className="w-full p-2 border rounded" value={item.description || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, description: e.target.value } : p))} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase mb-1">Texto Botão</label>
                                                <input className="w-full p-2 border rounded" value={item.button_text || ''} onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, button_text: e.target.value } : p))} />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 pt-4 border-t">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={item.active !== false}
                                                    onChange={e => setHomeContent(prev => prev.map(p => p.id === 1 ? { ...p, active: e.target.checked } : p))}
                                                    className="w-5 h-5 text-gray-800 rounded focus:ring-2 focus:ring-gray-500"
                                                />
                                                <span className="font-bold text-sm">
                                                    {item.active !== false ? '✅ Banner Ativo (visível no site)' : '❌ Banner Desativado (oculto)'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                )}

            </main>

            {/* --- MODALS --- */}

            {/* PRODUCT MODAL */}
            {isProductModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-lg">Editor de Produto (Completo)</h3>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={saveProduct} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left: Images */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold">Imagem Principal</label>
                                    <div className="aspect-square bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center relative hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden group">
                                        {editingProduct.image_url ?
                                            <Image src={editingProduct.image_url} alt="Preview" fill className="object-cover" /> :
                                            <div className="text-center p-4"><ImageIcon className="mx-auto mb-2 text-gray-300" /><span className="text-xs text-gray-400">Clique para upload</span></div>
                                        }
                                        <input type="file" onChange={async e => { const url = await handleFileUpload(e, 'products'); if (url) setEditingProduct({ ...editingProduct, image_url: url }) }} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>

                                    {/* Gallery Management */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold">Galeria de Fotos</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* Existing Images */}
                                            {editingProduct.images?.map((img, idx) => (
                                                <div key={idx} className="aspect-square relative rounded border overflow-hidden group">
                                                    <Image src={img} alt={`Foto ${idx}`} fill className="object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newImages = editingProduct.images?.filter((_, i) => i !== idx);
                                                            setEditingProduct({ ...editingProduct, images: newImages });
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Upload Button */}
                                            <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 relative">
                                                <Plus size={24} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-400 mt-1">Adicionar</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={async (e) => {
                                                        if (!e.target.files) return;
                                                        setUploading(true);
                                                        const newImages = [...(editingProduct.images || [])];

                                                        for (let i = 0; i < e.target.files.length; i++) {
                                                            const file = e.target.files[i];
                                                            const fileName = `gallery-${Date.now()}-${file.name}`;
                                                            const { error } = await supabase.storage.from('products').upload(fileName, file);

                                                            if (!error) {
                                                                const { data } = supabase.storage.from('products').getPublicUrl(fileName);
                                                                newImages.push(data.publicUrl);
                                                            }
                                                        }

                                                        setEditingProduct({ ...editingProduct, images: newImages });
                                                        setUploading(false);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400">Arraste ou clique para adicionar mais fotos.</p>
                                    </div>
                                </div>

                                {/* Right: Info */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold uppercase mb-1">Nome do Produto</label>
                                            <input className="w-full p-2 border rounded" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} required />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Preço (R$)</label>
                                            <input type="number" step="0.01" className="w-full p-2 border rounded font-mono" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} required />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Categoria</label>
                                            <select className="w-full p-2 border rounded" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}>
                                                <option value="Tops">Tops</option>
                                                <option value="Leggings">Leggings</option>
                                                <option value="Shorts">Shorts</option>
                                                <option value="Conjuntos">Conjuntos</option>
                                                <option value="Blusas e Regatas">Blusas e Regatas</option>
                                                <option value="Acessórios">Acessórios</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Cor Predominante</label>
                                            <select className="w-full p-2 border rounded" value={editingProduct.color || ''} onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })}>
                                                <option value="">Selecione...</option>
                                                <option value="Preto">Preto</option>
                                                <option value="Verde">Verde</option>
                                                <option value="Uva">Uva</option>
                                                <option value="Cinza">Cinza</option>
                                                <option value="Rosa Bebê">Rosa Bebê</option>
                                                <option value="Azul Bebê">Azul Bebê</option>
                                                <option value="Azul">Azul</option>
                                                <option value="Branco">Branco</option>
                                                <option value="Off White">Off White</option>
                                                <option value="Rosa">Rosa</option>
                                                <option value="Lilás">Lilás</option>
                                                <option value="Roxo">Roxo</option>
                                                <option value="Laranja">Laranja</option>
                                                <option value="Estampado">Estampado</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold uppercase mb-1">Descrição Detalhada</label>
                                            <textarea rows={4} className="w-full p-2 border rounded resize-y" value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} />
                                        </div>

                                        {/* Extra Fields */}
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Desconto Pix (%)</label>
                                            <input type="number" className="w-full p-2 border rounded" placeholder="Ex: 5" value={editingProduct.pix_discount || ''} onChange={e => setEditingProduct({ ...editingProduct, pix_discount: parseFloat(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase mb-1">Texto Parcelas</label>
                                            <input type="text" className="w-full p-2 border rounded" placeholder="Ex: 3x sem juros" value={editingProduct.installments || ''} onChange={e => setEditingProduct({ ...editingProduct, installments: e.target.value })} />
                                        </div>
                                    </div>

                                    {/* Stock Grid & Status */}
                                    <div className="border bg-gray-50 p-4 rounded mt-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold uppercase">Controle de Estoque</label>

                                            {/* Toggle Coming Soon */}
                                            <div className="flex flex-col items-end gap-1">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingProduct.is_coming_soon || false}
                                                        onChange={e => setEditingProduct({ ...editingProduct, is_coming_soon: e.target.checked })}
                                                        className="w-4 h-4 text-black rounded focus:ring-black"
                                                    />
                                                    <span className="text-xs font-bold text-orange-600">EM BREVE (Lançamento)</span>
                                                </label>
                                                {editingProduct.is_coming_soon && (
                                                    <input
                                                        type="text"
                                                        placeholder="Data (ex: 20/02)"
                                                        className="w-32 p-1 border rounded text-xs text-center border-orange-200 focus:border-orange-500 focus:outline-none"
                                                        value={editingProduct.launch_date || ''}
                                                        onChange={e => setEditingProduct({ ...editingProduct, launch_date: e.target.value })}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="w-full space-y-2">
                                                {editingProduct.variants?.sort((a, b) => (a.color || '').localeCompare(b.color || '')).map((v, i) => (
                                                    <div key={i} className="flex gap-2 items-end border-b pb-2">
                                                        <div className="flex-1">
                                                            <label className="text-[10px] font-bold uppercase text-gray-400">Cor</label>
                                                            <select className="w-full p-1 border rounded text-xs" value={v.color || ''} onChange={e => {
                                                                const newVars = [...(editingProduct.variants || [])];
                                                                newVars[i].color = e.target.value;
                                                                setEditingProduct({ ...editingProduct, variants: newVars });
                                                            }}>
                                                                <option value="">Selecione...</option>
                                                                <option value="Preto">Preto</option>
                                                                <option value="Verde">Verde</option>
                                                                <option value="Uva">Uva</option>
                                                                <option value="Cinza">Cinza</option>
                                                                <option value="Rosa Bebê">Rosa Bebê</option>
                                                                <option value="Azul Bebê">Azul Bebê</option>
                                                                <option value="Azul">Azul</option>
                                                                <option value="Branco">Branco</option>
                                                                <option value="Off White">Off White</option>
                                                                <option value="Rosa">Rosa</option>
                                                                <option value="Lilás">Lilás</option>
                                                                <option value="Roxo">Roxo</option>
                                                                <option value="Laranja">Laranja</option>
                                                                <option value="Estampado">Estampado</option>
                                                            </select>
                                                        </div>
                                                        <div className="w-20">
                                                            <label className="text-[10px] font-bold uppercase text-gray-400">Tam.</label>
                                                            <select className="w-full p-1 border rounded text-xs" value={v.size} onChange={e => {
                                                                const newVars = [...(editingProduct.variants || [])];
                                                                newVars[i].size = e.target.value;
                                                                setEditingProduct({ ...editingProduct, variants: newVars });
                                                            }}>
                                                                {['Único', 'P', 'M', 'G', 'GG', 'U'].map(s => <option key={s} value={s}>{s}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="w-20">
                                                            <label className="text-[10px] font-bold uppercase text-gray-400">Estoque</label>
                                                            <input type="number" className="w-full p-1 border rounded text-xs text-center" value={v.stock} onChange={e => {
                                                                const newVars = [...(editingProduct.variants || [])];
                                                                newVars[i].stock = parseInt(e.target.value) || 0;
                                                                setEditingProduct({ ...editingProduct, variants: newVars });
                                                            }} />
                                                        </div>
                                                        <div className="w-24">
                                                            <label className="text-[10px] font-bold uppercase text-gray-400">Preço (R$)</label>
                                                            <input type="number" step="0.01" placeholder="Padrão" className="w-full p-1 border rounded text-xs text-center" value={v.price || ''} onChange={e => {
                                                                const newVars = [...(editingProduct.variants || [])];
                                                                newVars[i].price = parseFloat(e.target.value);
                                                                setEditingProduct({ ...editingProduct, variants: newVars });
                                                            }} />
                                                        </div>
                                                        <button type="button" onClick={async () => {
                                                            if (v.id) {
                                                                if (!confirm('Excluir variante?')) return;
                                                                await supabase.from('product_variants').delete().eq('id', v.id);
                                                            }
                                                            const newVars = editingProduct.variants?.filter((_, idx) => idx !== i);
                                                            setEditingProduct({ ...editingProduct, variants: newVars });
                                                        }} className="p-1.5 bg-red-100 text-red-500 rounded hover:bg-red-200 mb-0.5"><Trash2 size={16} /></button>
                                                    </div>
                                                ))}

                                                <button type="button" className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded" onClick={() => {
                                                    setEditingProduct({
                                                        ...editingProduct,
                                                        variants: [...(editingProduct.variants || []), { size: 'P', stock: 1, color: editingProduct.color || '' }]
                                                    });
                                                }}>
                                                    <Plus size={16} /> ADICIONAR VARIAÇÃO
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sticky bottom-0 pt-4 bg-white border-t flex justify-end gap-2">
                                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-black">CANCELAR</button>
                                <button type="submit" disabled={loading} className="bg-black text-white px-8 py-2 rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50">
                                    {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SLIDE MODAL */}
            {isSlideModalOpen && editingSlide && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="font-bold mb-4">Editar Slide</h3>
                        <div className="space-y-4">
                            <div className="h-32 bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
                                {editingSlide.image_url && <Image src={editingSlide.image_url} alt="preview" fill className="object-cover" />}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={async e => { const url = await handleFileUpload(e, 'banners'); if (url) setEditingSlide({ ...editingSlide, image_url: url }) }} />
                                {!editingSlide.image_url && <span className="text-xs text-gray-500">Clique para upload da imagem</span>}
                            </div>
                            <input className="w-full p-2 border rounded" placeholder="Título (Ex: NOVA COLEÇÃO)" value={editingSlide.title} onChange={e => setEditingSlide({ ...editingSlide, title: e.target.value })} />
                            <input className="w-full p-2 border rounded" placeholder="Subtítulo (Ex: Treine com estilo)" value={editingSlide.subtitle} onChange={e => setEditingSlide({ ...editingSlide, subtitle: e.target.value })} />
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Link de Destino</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={editingSlide.link_url || ''}
                                    onChange={e => setEditingSlide({ ...editingSlide, link_url: e.target.value })}
                                >
                                    <option value="">Selecione uma Página...</option>
                                    <option value="/lancamentos">Lançamentos</option>
                                    <option value="/feminino/tops">Tops</option>
                                    <option value="/feminino/leggings">Leggings</option>
                                    <option value="/feminino/shorts">Shorts</option>
                                    <option value="/feminino/conjuntos">Conjuntos</option>
                                    <option value="/blusas-regatas">Blusas e Regatas</option>
                                    <option value="/combos">Combos</option>
                                </select>
                            </div>
                            <button onClick={saveSlide} className="w-full bg-black text-white py-2 rounded font-bold">SALVAR SLIDE</button>
                        </div>
                        <button onClick={() => setIsSlideModalOpen(false)} className="w-full mt-2 text-sm text-gray-500">Cancelar</button>
                    </div>
                </div>
            )}

        </div>
    );
}
