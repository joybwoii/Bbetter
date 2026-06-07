import { NextResponse } from 'next/server';
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

    const { orderDetails } = await request.json();

    if (!orderDetails || !orderDetails.items || !orderDetails.shipping) {
      return NextResponse.json({ error: 'Missing order details' }, { status: 400 });
    }

    // Create order in Firestore
    const orderRef = await adminDb.collection('orders').add({
      ...orderDetails,
      status: orderDetails.paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
      paymentStatus: 'Pending',
      createdAt: new Date(),
      orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    });

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
