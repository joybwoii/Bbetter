import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      local_order_id // We should pass our firestore order ID to update it
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !local_order_id) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret not configured' }, { status: 500 });
    }

    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Update the order in Firestore as paid
    const orderRef = adminDb.collection('orders').doc(local_order_id);
    await orderRef.update({
      paymentStatus: 'Paid',
      status: 'Confirmed',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
