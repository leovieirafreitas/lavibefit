"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Clock, Copy, ExternalLink } from 'lucide-react';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [countdown, setCountdown] = useState(5);
    const [copied, setCopied] = useState(false);

    const orderNumber = searchParams.get('order');

    useEffect(() => {
        // Clear cart
        clearCart();

        // Fetch order details
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    useEffect(() => {
        // Countdown only if payment is approved
        if (order && order.payment_status === 'approved' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (order && order.payment_status === 'approved' && countdown === 0) {
            redirectToWhatsApp();
        }
    }, [countdown, order]);

    const copyPix = () => {
        if (order?.qr_code) {
            navigator.clipboard.writeText(order.qr_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    async function fetchOrder() {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('order_number', orderNumber)
            .single();

        if (data) {
            setOrder(data);
        }
    }

    // Realtime subscription to listen for payment approval
    useEffect(() => {
        if (!orderNumber) return;

        const channel = supabase
            .channel(`order-${orderNumber}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'orders',
                    filter: `order_number=eq.${orderNumber}`
                },
                (payload: any) => {
                    console.log('Ordem atualizada!', payload);
                    if (payload.new) {
                        setOrder(payload.new);
                    }
                }
            )
            .subscribe();

        // Fallback polling every 5 seconds (just in case)
        const interval = setInterval(fetchOrder, 5000);

        return () => {
            supabase.removeChannel(channel);
            clearInterval(interval);
        };
    }, [orderNumber]);

    function redirectToWhatsApp() {
        if (!order) return;

        const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

        // Format items list
        const itemsList = order.items.map((item: any) =>
            `• ${item.quantity}x ${item.title} - R$ ${(item.unit_price * item.quantity).toFixed(2)}`
        ).join('\n');

        // Create WhatsApp message
        const message = `🎉 *PEDIDO CONFIRMADO!*

📦 *Pedido:* #${order.order_number}
👤 *Cliente:* ${order.customer_name}
📱 *Telefone:* ${order.customer_phone}

*ITENS DO PEDIDO:*
${itemsList}

💰 *Total:* R$ ${order.total.toFixed(2)}
✅ *Pagamento:* Aprovado (${order.payment_method || 'Cartão'})

📍 *Entrega:*
${order.address_street}, ${order.address_number}${order.address_complement ? ' - ' + order.address_complement : ''}
${order.address_neighborhood} - ${order.address_city}/${order.address_state}
CEP: ${order.address_zipcode}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.location.href = whatsappUrl;
    }

    if (!order) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                    <p>Carregando...</p>
                </div>
                <Footer />
            </main>
        );
    }

    const isApproved = order.payment_status === 'approved';
    const isPix = order.payment_method === 'pix';
    const isTicket = order.payment_method === 'bolbradesco' || order.payment_method === 'pec'; // Common ticket methods

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="pt-32 pb-12 container mx-auto px-6 max-w-2xl">
                <div className="text-center">
                    {isApproved ? (
                        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    ) : (
                        <Clock className="w-20 h-20 text-yellow-500 mx-auto mb-6" />
                    )}

                    <h1 className="text-3xl font-bold mb-4">
                        {isApproved ? 'Pagamento Confirmado!' : 'Pedido Realizado!'}
                    </h1>
                    <p className="text-gray-600 mb-2">Número do pedido: <strong>#{order.order_number}</strong></p>
                    <p className="text-gray-600 mb-8">
                        Obrigado pela sua compra, {order.customer_name}!
                    </p>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h2 className="font-bold text-lg mb-4">Resumo do Pedido</h2>
                        <div className="space-y-2 text-left">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between">
                                    <span>{item.quantity}x {item.title}</span>
                                    <span className="font-bold">R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total:</span>
                                <span>R$ {order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Show Auto-Redirect info ONLY if approved */}
                    {isApproved && (
                        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
                            <p className="font-bold text-green-700 mb-2">
                                Redirecionando para WhatsApp em {countdown} segundos...
                            </p>
                            <p className="text-sm text-gray-600">
                                Você será direcionado para confirmar os detalhes da entrega.
                            </p>
                        </div>
                    )}

                    {!isApproved && (
                        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-6">
                            <h3 className="font-bold text-yellow-800 text-lg mb-2">
                                Aguardando Pagamento
                            </h3>
                            <p className="text-sm text-gray-700 mb-4">
                                Seu pedido foi gerado. Realize o pagamento para confirmar.
                            </p>

                            {/* PIX Payment Info */}
                            {order.qr_code_base64 && (
                                <div className="bg-white p-4 rounded shadow-sm mb-4">
                                    <p className="text-sm font-bold mb-2 text-gray-800">Escaneie o QR Code PIX:</p>
                                    <img
                                        src={`data:image/png;base64,${order.qr_code_base64}`}
                                        alt="QR Code PIX"
                                        className="w-48 h-48 mx-auto mb-4 border"
                                    />
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            className="w-full text-xs p-2 bg-gray-100 border rounded h-20 resize-none font-mono"
                                            value={order.qr_code}
                                        />
                                        <button
                                            onClick={copyPix}
                                            className="mt-2 flex items-center justify-center gap-2 w-full bg-[#DD3468] text-white py-2 rounded font-bold hover:bg-[#c42d5c]"
                                        >
                                            <Copy size={16} />
                                            {copied ? 'Copiado!' : 'Copiar Código PIX'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Ticket / Link Payment Info */}
                            {order.ticket_url && !order.qr_code_base64 && (
                                <div className="mt-4">
                                    <a
                                        href={order.ticket_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full py-3 rounded font-bold hover:bg-blue-700"
                                    >
                                        <ExternalLink size={20} />
                                        Abrir Boleto / Link de Pagamento
                                    </a>
                                </div>
                            )}

                            {/* Fallback if no specific payment info but pending status */}
                            {!order.ticket_url && !order.qr_code_base64 && (
                                <p className="text-sm text-red-500 mt-2">
                                    Se você já realizou o pagamento, aguarde a confirmação.
                                </p>
                            )}
                        </div>
                    )}

                    {isApproved && (
                        <button
                            onClick={redirectToWhatsApp}
                            className="bg-green-500 text-white px-8 py-4 rounded-lg font-bold hover:bg-green-600 transition-colors"
                        >
                            Ir para WhatsApp Agora
                        </button>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={() => router.push('/')}
                            className="text-[#DD3468] hover:underline"
                        >
                            Voltar para a loja
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
