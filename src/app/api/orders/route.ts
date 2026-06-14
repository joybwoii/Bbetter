import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { sendEmail, generateOrderPlacedEmailHtml } from '@/lib/email';

export async function POST(request: Request) {
  try {
    // Guest checkout enabled - no auth required

    const { orderDetails } = await request.json();

    if (!orderDetails || !orderDetails.items || !orderDetails.shipping) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    const orderData = {
      ...orderDetails,
      status: orderDetails.paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date(),
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    // Create order in Firestore
    const orderRef = await adminDb.collection('orders').add(orderData);

    // Send order confirmation email
    if (orderDetails.shipping?.email) {
      await sendEmail(
        orderDetails.shipping.email,
        `Order Confirmation: ${orderData.orderNumber}`,
        generateOrderPlacedEmailHtml(orderData)
      );
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderRef.id, 
      documentId: orderRef.id 
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
