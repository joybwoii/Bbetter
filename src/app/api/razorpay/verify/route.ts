import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebase/admin';
import { verifyUser } from '@/lib/actions/auth';

export async function POST(request: Request) {
  try {
    // Authenticate the user session
    let currentUser;
    try {
      currentUser = await verifyUser();
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message || 'Unauthorized' }, { status: 401 });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderDetails
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret || key_secret === 'mock_secret' || razorpay_order_id?.startsWith('mock_order_')) {
       // Mock verification
       if (razorpay_order_id?.startsWith('mock_order_') || key_secret === 'mock_secret') {
          // In mock mode, we just save the order to firestore
          const orderRef = await adminDb.collection('orders').add({
            ...orderDetails,
            paymentId: razorpay_payment_id || `mock_payment_${Date.now()}`,
            orderId: razorpay_order_id || `mock_order_${Date.now()}`,
            status: 'Paid',
            paymentStatus: 'Paid',
            createdAt: new Date(),
            orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
          });
          return NextResponse.json({ success: true, orderId: orderRef.id, documentId: orderRef.id });
       }
       return NextResponse.json({ error: 'Razorpay secret not found' }, { status: 500 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Save order to Firestore
      const orderRef = await adminDb.collection('orders').add({
        ...orderDetails,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        signature: razorpay_signature,
        status: 'Paid',
        paymentStatus: 'Paid',
        createdAt: new Date(),
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      });

      return NextResponse.json({ success: true, orderId: orderRef.id, documentId: orderRef.id });
    } else {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
