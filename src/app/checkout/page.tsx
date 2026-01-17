"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

declare global {
    interface Window {
        MercadoPago: any;
        paymentBrickController: any;
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, getSubtotal, clearCart } = useCart();

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [complement, setComplement] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [loading, setLoading] = useState(false);
    const [paymentTab, setPaymentTab] = useState<'card' | 'pix'>('card');

    // Initial check for cart
    useEffect(() => {
        if (items.length === 0) {
            // Optional: Redirect logic here if needed
        }
    }, [items]);

    // CEP Mask function
    const maskCep = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1');
    };

    const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = maskCep(e.target.value);
        setZipcode(value);

        if (value.length === 9) {
            setLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${value.replace('-', '')}/json/`);
                const data = await response.json();

                if (!data.erro) {
                    setStreet(data.logradouro);
                    setNeighborhood(data.bairro);
                    setCity(data.localidade);
                    setState(data.uf);
                    setTimeout(() => document.getElementById('address-number')?.focus(), 100);
                } else {
                    alert('CEP não encontrado!');
                }
            } catch (error) {
                console.error('Error fetching CEP:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Helper to calculate Pix Total
    const getPixTotal = () => {
        return items.reduce((total, item) => {
            const price = item.pix_discount ? item.price * (1 - item.pix_discount / 100) : item.price;
            return total + (price * item.quantity);
        }, 0);
    };

    // Check if form is valid
    const isFormValid = name && email && phone && cpf && street && number && neighborhood && city && state && zipcode && zipcode.length >= 8;

    // Initialize Payment Brick
    useEffect(() => {
        if (items.length > 0 && typeof window !== 'undefined' && isFormValid) {
            console.log("Iniciando Payment Brick...", paymentTab);
            const script = document.createElement('script');
            script.src = 'https://sdk.mercadopago.com/js/v2';
            script.onload = () => {
                const mp = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
                const bricksBuilder = mp.bricks();

                const renderPaymentBrick = async (bricksBuilder: any) => {
                    const currentAmount = paymentTab === 'pix' ? getPixTotal() : getSubtotal();

                    const settings = {
                        initialization: {
                            amount: currentAmount,
                            payer: {
                                firstName: name.split(' ')[0] || '',
                                lastName: name.split(' ').slice(1).join(' ') || '',
                                email: email,
                            },
                        },
                        customization: {
                            paymentMethods: {
                                bankTransfer: paymentTab === 'pix' ? "all" : undefined,
                                creditCard: paymentTab === 'card' ? "all" : undefined,
                                debitCard: paymentTab === 'card' ? "all" : undefined,
                            },
                            visual: {
                                hidePaymentButton: false,
                                style: {
                                    theme: 'default',
                                }
                            }
                        },
                        callbacks: {
                            onReady: () => {
                                setLoading(false);
                                console.log("Brick Ready!");
                            },
                            onSubmit: async ({ selectedPaymentMethod, formData }: any) => {
                                setLoading(true);
                                try {
                                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

                                    // Prepare items with correct price based on tab
                                    const processedItems = items.map(item => {
                                        let finalPrice = item.price;
                                        if (paymentTab === 'pix' && item.pix_discount) {
                                            finalPrice = item.price * (1 - item.pix_discount / 100);
                                        }
                                        // Ensure 2 decimal places
                                        return {
                                            title: `${item.name} - Tamanho ${item.size}${item.color ? ` - Cor ${item.color}` : ''}`,
                                            quantity: item.quantity,
                                            unit_price: Number(finalPrice.toFixed(2)),
                                            product_id: item.productId,
                                            size: item.size,
                                            color: item.color
                                        };
                                    });

                                    // Validated total with rounding
                                    const transactionAmount = Number(
                                        processedItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0).toFixed(2)
                                    );

                                    // Ensure formData amount matches (it should, but we explicitly set it to be safe for backend)
                                    // Backend needs transaction_amount in payment_data to match sum of items
                                    const payment_data = {
                                        ...formData,
                                        transaction_amount: transactionAmount
                                    };

                                    const orderData = {
                                        items: processedItems,
                                        customer: {
                                            name, email, phone, cpf,
                                            address: { street, number, complement, neighborhood, city, state, zipcode }
                                        },
                                        payment_data
                                    };

                                    const response = await fetch(`${supabaseUrl}/functions/v1/process-payment`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                                        },
                                        body: JSON.stringify(orderData),
                                    });

                                    const result = await response.json();

                                    if (result.status === 'approved' || result.status === 'pending' || result.status === 'in_process') {
                                        window.location.href = `/checkout/success?order=${result.order_number}`;
                                    } else {
                                        console.error('Payment Error:', result);
                                        alert('Pagamento não aprovado. Verifique os dados e tente novamente.');
                                        setLoading(false);
                                    }

                                } catch (error) {
                                    console.error(error);
                                    alert('Erro ao processar pagamento. Tente novamente.');
                                    setLoading(false);
                                }
                            },
                            onError: (error: any) => {
                                console.error(error);
                            },
                        },
                    };

                    if (window.paymentBrickController) {
                        try {
                            window.paymentBrickController.unmount();
                        } catch (e) { console.error('Error unmounting', e); }
                    }

                    try {
                        window.paymentBrickController = await bricksBuilder.create(
                            'payment',
                            'paymentBrick_container',
                            settings
                        );
                    } catch (e) { console.error('Error creating brick', e); }
                };

                // Render brick immediately since isFormValid is true
                renderPaymentBrick(bricksBuilder);
            };
            document.body.appendChild(script);

            return () => {
                // script cleanup optional
            };
        }
    }, [isFormValid, items, paymentTab]); // Only re-run when form becomes valid or paymentTab changes

    if (items.length === 0) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 pb-12 container mx-auto px-6 text-center">
                    <h1 className="text-2xl font-bold mb-4">Carrinho Vazio</h1>
                    <p className="text-gray-600 mb-6">Adicione produtos ao carrinho para finalizar a compra.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#DD3468] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#c42d5c]"
                    >
                        Continuar Comprando
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="pt-24 pb-12 container mx-auto px-4 md:px-6">
                <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg shadow p-6 space-y-6">
                            {/* Personal Info */}
                            <div>
                                <h2 className="text-xl font-bold mb-4">Dados Pessoais</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Nome Completo *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full p-3 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full p-3 border rounded"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Telefone/WhatsApp *</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full p-3 border rounded"
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">CPF *</label>
                                        <input
                                            type="text"
                                            value={cpf}
                                            onChange={e => setCpf(e.target.value)}
                                            className="w-full p-3 border rounded"
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h2 className="text-xl font-bold mb-4">Endereço de Entrega</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-1">CEP *</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={zipcode}
                                                onChange={handleCepChange}
                                                maxLength={9}
                                                className="w-full md:w-1/3 p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                                                placeholder="00000-000"
                                                required
                                            />
                                            {loading && <span className="text-sm text-gray-500 self-center">Buscando endereço...</span>}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold mb-1">Rua *</label>
                                        <input
                                            type="text"
                                            value={street}
                                            onChange={e => setStreet(e.target.value)}
                                            className="w-full p-3 border rounded bg-gray-100"
                                            readOnly
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Número *</label>
                                        <input
                                            id="address-number"
                                            type="text"
                                            value={number}
                                            onChange={e => setNumber(e.target.value)}
                                            className="w-full p-3 border rounded focus:border-[#DD3468] focus:ring-1 focus:ring-[#DD3468]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Complemento</label>
                                        <input
                                            type="text"
                                            value={complement}
                                            onChange={e => setComplement(e.target.value)}
                                            className="w-full p-3 border rounded"
                                            placeholder="Ex: Apto 101"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Bairro *</label>
                                        <input
                                            type="text"
                                            value={neighborhood}
                                            onChange={e => setNeighborhood(e.target.value)}
                                            className="w-full p-3 border rounded bg-gray-100"
                                            readOnly
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Cidade *</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={e => setCity(e.target.value)}
                                            className="w-full p-3 border rounded bg-gray-100"
                                            readOnly
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Estado *</label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={e => setState(e.target.value)}
                                            className="w-full p-3 border rounded bg-gray-100"
                                            readOnly
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Section with Tabs */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold mb-4">Pagamento</h2>

                            {isFormValid ? (
                                <div>
                                    <div className="flex gap-4 mb-6 border-b">
                                        <button
                                            onClick={() => setPaymentTab('card')}
                                            className={`pb-2 px-1 font-bold transition-colors border-b-2 ${paymentTab === 'card' ? 'border-[#DD3468] text-[#DD3468]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            Cartão de Crédito
                                        </button>
                                        <button
                                            onClick={() => setPaymentTab('pix')}
                                            className={`pb-2 px-1 font-bold transition-colors border-b-2 ${paymentTab === 'pix' ? 'border-[#DD3468] text-[#DD3468]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                                }`}
                                        >
                                            PIX
                                        </button>
                                    </div>

                                    <div id="paymentBrick_container"></div>
                                </div>
                            ) : (
                                <div className="text-center p-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                                    <p className="text-gray-500">
                                        Preencha todos os dados acima (incluindo número e CPF) para liberar o pagamento.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>

                            <div className="space-y-3 mb-4">
                                {items.map(item => (
                                    <div key={`${item.productId}-${item.size}-${item.color || ''}`} className="flex gap-3">
                                        <div className="relative w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-500">Tamanho: {item.size} {item.color && `| Cor: ${item.color}`}</p>
                                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                            <p className="font-bold text-sm mt-1">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-bold">R$ {getSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Frete:</span>
                                    <span>Grátis</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total:</span>
                                    <span>R$ {getSubtotal().toFixed(2)}</span>
                                </div>
                                {items.some(i => i.pix_discount) && (
                                    <div className="flex justify-between text-base font-bold text-green-600">
                                        <span>Total no PIX:</span>
                                        <span>R$ {items.reduce((acc, item) => {
                                            const price = item.pix_discount ? item.price * (1 - item.pix_discount / 100) : item.price;
                                            return acc + (price * item.quantity);
                                        }, 0).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
