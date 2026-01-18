"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Clock, Copy, ExternalLink } from 'lucide-react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [countdown, setCountdown] = useState(5);
    const [copied, setCopied] = useState(false);

    const [whatsappMessage, setWhatsappMessage] = useState('');

    useEffect(() => {
        // Fetch custom whatsapp message
        async function fetchSettings() {
            const { data } = await supabase
                .from('global_settings')
                .select('value')
                .eq('key', 'whatsapp_client_message')
                .single();

            if (data?.value) {
                setWhatsappMessage(data.value);
            }
        }
        fetchSettings();
    }, []);

    const orderNumber = searchParams.get('order');

    useEffect(() => {
        // Clear cart
        clearCart();

        // Fetch order details
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    // ... (Mantendo os outros useEffects iguais, não preciso mexer)

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

    // Realtime subscription... (Mantendo igual)
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
        let message = '';

        // Prepare data strings
        const itemsListStr = order.items.map((item: any) =>
            `• ${item.quantity}x ${item.title} - R$ ${(item.unit_price * item.quantity).toFixed(2)}`
        ).join('\n');

        const addressStr = `${order.address_street}, ${order.address_number}${order.address_complement ? ' - ' + order.address_complement : ''}\n${order.address_neighborhood} - ${order.address_city}/${order.address_state}\nCEP: ${order.address_zipcode}`;

        const totalStr = `R$ ${order.total.toFixed(2)}`;

        if (whatsappMessage && whatsappMessage.trim() !== '' && !whatsappMessage.includes('\uFFFD')) {
            // Use custom message but inject data
            message = whatsappMessage
                .replace(/{order_number}/g, order.order_number)
                .replace(/{customer_name}/g, order.customer_name)
                .replace('#{order_number}', `#${order.order_number}`) // Fallback for fixed text
                .replace('(Lista de itens será inserida aqui)', itemsListStr)
                .replace('(Valor total)', totalStr)
                .replace('(Endereço será inserido aqui)', addressStr);
        } else {
            // Fallback to default clean message structure (No Emojis)
            message = `*PEDIDO CONFIRMADO!*\n\n*Pedido:* #${order.order_number}\n👤 *Cliente:* ${order.customer_name}\n\n*ITENS DO PEDIDO:*\n${itemsListStr}\n\n*Total:* ${totalStr}\n*Pagamento:* Aprovado\n\n*Entrega:*\n${addressStr}`;
        }

        // Final sanity check for encoding issues - Removing the specific "Diamond Question Mark" char
        // Using explicit unicode range removal for replacement characters
        message = message.replace(/\uFFFD/g, '');
        // Also removing generic "question mark box" often causes by encoding mismatch
        message = message.replace(/\uD83D\uFFFD/g, '');

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.location.href = whatsappUrl;
    }

    if (!order) {
        return (
            <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                <p>Carregando...</p>
            </div>
        );
    }

    const isApproved = order.payment_status === 'approved';

    return (
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
                {/* Show Success info ONLY if approved */}
                {isApproved && (
                    <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
                        <p className="font-bold text-green-700 mb-2">
                            Pagamento Aprovado com Sucesso!
                        </p>
                        <p className="text-sm text-gray-600">
                            Clique no botão abaixo para confirmar os detalhes da entrega no nosso WhatsApp.
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
    );
}

export default function SuccessPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <Suspense fallback={
                <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                    <p>Carregando informações do pedido...</p>
                </div>
            }>
                <SuccessContent />
            </Suspense>
            <Footer />
        </main>
    );
}
