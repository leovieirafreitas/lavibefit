import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { supabase } from '@/lib/supabase';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { items, customer } = body;

        // Generate unique order number
        const orderNumber = `LA${Date.now()}`;

        // Calculate totals
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.unit_price * item.quantity), 0);
        const total = subtotal; // Add shipping, taxes later if needed

        // Create order in database
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                customer_cpf: customer.cpf,
                address_street: customer.address.street,
                address_number: customer.address.number,
                address_complement: customer.address.complement,
                address_neighborhood: customer.address.neighborhood,
                address_city: customer.address.city,
                address_state: customer.address.state,
                address_zipcode: customer.address.zipcode,
                items: items,
                subtotal: subtotal,
                discount: 0,
                total: total,
                payment_status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Create Mercado Pago preference
        const preference = new Preference(client);

        const preferenceData = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    title: item.title,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    currency_id: 'BRL'
                })),
                payer: {
                    name: customer.name,
                    email: customer.email,
                    phone: {
                        number: customer.phone
                    },
                    identification: {
                        type: 'CPF',
                        number: customer.cpf
                    }
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?order=${orderNumber}`,
                    failure: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/failure`,
                    pending: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/pending`
                },
                auto_return: 'approved',
                external_reference: orderNumber,
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/mercadopago/webhook`
            }
        });

        return NextResponse.json({
            init_point: preferenceData.init_point,
            order_number: orderNumber
        });

    } catch (error) {
        console.error('Error creating preference:', error);
        return NextResponse.json(
            { error: 'Failed to create payment preference' },
            { status: 500 }
        );
    }
}
