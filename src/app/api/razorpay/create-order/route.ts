import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
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

    const { items, shippingData } = await request.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let calculatedTotal = 0;

    // Verify prices from Firestore
    for (const item of items) {
      const productDoc = await adminDb.collection('products').doc(item.id).get();
      if (!productDoc.exists) {
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 404 });
      }
      
      const productData = productDoc.data();
      const price = productData?.price || 0;
      calculatedTotal += price * item.quantity;
    }

    // Initialize Razorpay
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      // Mock mode if no keys are provided
      console.warn("Razorpay keys not found. Using mock order generation.");
      return NextResponse.json({
        orderId: `mock_order_${Date.now()}`,
        amount: calculatedTotal * 100,
        currency: 'INR',
        mock: true
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // Razorpay amount is in paise (multiply by 100)
    const amountInPaise = calculatedTotal * 100;

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
