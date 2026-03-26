import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createRouteHandlerClient({ cookies });

    // TODO: Validar firma del webhook según el proveedor (Stripe/PayPal/MercadoPago)
    // const signature = req.headers.get('stripe-signature');

    const { quoteId, status, paymentId } = body;

    if (!quoteId || status !== 'paid') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Actualizar estado de la cotización
    const { error } = await supabase
      .from('cotizaciones')
      .update({ 
        estado: 'Pagado',
        actualizado_en: new Date().toISOString()
      })
      .eq('id', quoteId);

    if (error) {
      console.error('Error updating quote status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Quote ${quoteId} marked as paid (Ref: ${paymentId})` });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
