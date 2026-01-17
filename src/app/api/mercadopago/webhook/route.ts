import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { supabase } from '@/lib/supabase';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Mercado Pago sends notifications for different events
        if (body.type === 'payment') {
            const paymentId = body.data.id;

            // Get payment details from Mercado Pago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            const orderNumber = paymentData.external_reference;
            const status = paymentData.status;

            // Update order in database
            const updateData: any = {
                payment_id: paymentId.toString(),
                payment_status: status,
                payment_method: paymentData.payment_type_id
            };

            if (status === 'approved') {
                updateData.paid_at = new Date().toISOString();
            }

            const { data: orderData, error: updateError } = await supabase
                .from('orders')
                .update(updateData)
                .eq('order_number', orderNumber)
                .select()
                .single();

            if (updateError) throw updateError;

            // If payment approved, reduce stock
            if (status === 'approved' && orderData) {
                await reduceStock(orderData);
            }

            return NextResponse.json({ received: true });
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

async function reduceStock(order: any) {
    try {
        const items = order.items;

        for (const item of items) {
            // Get current variant stock
            const { data: variant } = await supabase
                .from('product_variants')
                .select('stock')
                .eq('product_id', item.product_id)
                .eq('size', item.size)
                .single();

            if (variant) {
                const newStock = variant.stock - item.quantity;

                // Update stock
                await supabase
                    .from('product_variants')
                    .update({ stock: Math.max(0, newStock) })
                    .eq('product_id', item.product_id)
                    .eq('size', item.size);
            }
        }
    } catch (error) {
        console.error('Error reducing stock:', error);
    }
}
