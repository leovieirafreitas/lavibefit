"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, AlertCircle, Package, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function MeusPedidosPage() {
    const router = useRouter();
    const [searchType, setSearchType] = useState<'cpf' | 'order_number'>('cpf');
    const [searchValue, setSearchValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;

        setLoading(true);
        setHasSearched(true);
        setOrders([]);

        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (searchType === 'cpf') {
            const cpfClean = searchValue.replace(/\D/g, '');
            query = query.eq('customer_cpf', cpfClean);
        } else {
            // Remove # if present
            const orderNum = searchValue.replace('#', '').trim();
            query = query.eq('order_number', orderNum);
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
        } else {
            setOrders(data || []);
            // Se buscou por numero do pedido e achou um, já redireciona direto
            if (searchType === 'order_number' && data && data.length === 1) {
                router.push(`/checkout/success?order=${data[0].order_number}`);
                return;
            }
        }
        setLoading(false);
    };

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    return (
        <main className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />

            <div className="flex-grow pt-32 pb-12 container mx-auto px-4 md:px-6 max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Acompanhar Meus Pedidos</h1>
                    <p className="text-gray-500">Digite seu CPF ou número do pedido para localizar.</p>
                </div>

                {/* Search Box */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <div className="flex gap-4 mb-4 justify-center">
                        <button
                            onClick={() => { setSearchType('cpf'); setSearchValue(''); setHasSearched(false); }}
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${searchType === 'cpf' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Buscar por CPF
                        </button>
                        <button
                            onClick={() => { setSearchType('order_number'); setSearchValue(''); setHasSearched(false); }}
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${searchType === 'order_number' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                        >
                            Buscar por Pedido
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder={searchType === 'cpf' ? "000.000.000-00" : "#123456789"}
                            className="flex-1 p-3 border rounded-lg focus:ring-1 focus:ring-black outline-none"
                            value={searchValue}
                            onChange={(e) => {
                                let val = e.target.value;
                                if (searchType === 'cpf') val = formatCPF(val);
                                setSearchValue(val);
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !searchValue}
                            className="bg-black text-white px-6 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Search />}
                            <span className="hidden md:inline">BUSCAR</span>
                        </button>
                    </form>
                </div>

                {/* Results */}
                {hasSearched && !loading && (
                    <div className="space-y-4">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Nenhum pedido encontrado.</p>
                                <p className="text-xs text-gray-400 mt-1">Verifique o número digitado e tente novamente.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-[#DD3468] transition-colors relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Pedido</p>
                                            <h3 className="text-lg font-bold">#{order.order_number}</h3>
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1
                                            ${order.payment_status === 'approved' ? 'bg-green-100 text-green-700' :
                                                order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'}`}>
                                            {order.payment_status === 'approved' ? <CheckCircle size={12} /> :
                                                order.payment_status === 'pending' ? <Clock size={12} /> :
                                                    <XCircle size={12} />}
                                            {order.payment_status === 'approved' ? 'Pago' :
                                                order.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-medium">{order.items.length} ite{order.items.length !== 1 ? 'ns' : 'm'}</p>
                                            <p className="font-bold">R$ {order.total.toFixed(2)}</p>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/checkout/success?order=${order.order_number}`)}
                                            className={`px-4 py-2 rounded text-sm font-bold transition-colors
                                                ${order.payment_status === 'pending'
                                                    ? 'bg-[#DD3468] text-white hover:bg-[#c42d5c]'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            {order.payment_status === 'pending' ? 'PAGAR AGORA' : 'VER DETALHES'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
