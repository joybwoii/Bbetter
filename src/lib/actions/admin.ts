'use server';

import { adminDb, adminStorage } from '../firebase/admin';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from './auth';
import { sendEmail, generateOrderStatusUpdateEmailHtml } from '../email';

export async function getDashboardStats() {
  await verifyAdmin();
  try {
    const productsSnap = await adminDb.collection('products').count().get();
    const usersSnap = await adminDb.collection('users').count().get();
    const ordersSnap = await adminDb.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    const recentUsersSnap = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(5).get();

    const finalOrders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const recentUsers = recentUsersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // For total sales and active orders, we'd ideally use an aggregation query, but for now we'll do a basic fetch or keep it simple.
    // Since we need total sales across ALL orders, let's fetch all orders (or implement an aggregation if possible).
    const allOrdersSnap = await adminDb.collection('orders').get();
    const allOrders = allOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    let totalSales = 0;
    let activeOrders = 0;
    
    allOrders.forEach((order: any) => {
      if (order.status !== 'CANCELLED') {
        totalSales += order.total || 0;
      }
      if (['PENDING', 'PROCESSING', 'SHIPPED'].includes(order.status?.toUpperCase())) {
        activeOrders++;
      }
    });

    return {
      totalSales,
      activeOrders,
      totalCustomers: usersSnap.data()?.count || 0,
      lowStockItems: 3, 
      recentOrders: finalOrders,
      recentUsers: recentUsers,
    };
  } catch (error) {
    return {
      totalSales: 0,
      activeOrders: 0,
      totalCustomers: 0,
      lowStockItems: 0,
      recentOrders: [],
      recentUsers: [],
    };
  }
}

export async function getProducts() {
  await verifyAdmin();
  try {
    const snap = await adminDb.collection('products').get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return products;
  } catch (error) {
    return [];
  }
}

export async function getUsers() {
  await verifyAdmin();
  try {
    const snap = await adminDb.collection('users').get();
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users;
  } catch (error) {
    return [];
  }
}

async function processImage(imageString: string): Promise<string> {
  if (!imageString || !imageString.startsWith('data:image/')) return imageString;

  try {
    const matches = imageString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return imageString;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    const extension = mimeType.split('/')[1] || 'jpg';
    const filename = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${extension}`;
    
    const bucket = adminStorage.bucket();
    const file = bucket.file(filename);
    
    await file.save(buffer, {
      metadata: { contentType: mimeType },
      public: true,
    });
    
    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
  } catch (err) {
    console.error('Error uploading image to storage:', err);
    // Fallback to base64 if storage is not configured properly
    return imageString;
  }
}

export async function createProduct(data: any) {
  await verifyAdmin();
  try {
    if (data.image) {
      data.image = await processImage(data.image);
    }

    const docRef = await adminDb.collection('products').add({
      ...data,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    // Instant cache invalidation
    revalidatePath('/');
    revalidatePath(`/category/${data.category}`);
    revalidatePath('/admin/products');
    
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating product:', error);
    return { error: error.message || 'Failed to create product' };
  }
}

export async function updateProduct(id: string, data: any) {
  await verifyAdmin();
  try {
    if (data.image) {
      data.image = await processImage(data.image);
    }

    await adminDb.collection('products').doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    // Instant cache invalidation
    revalidatePath('/');
    revalidatePath(`/category/${data.category}`);
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { error: error.message || 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  await verifyAdmin();
  try {
    const doc = await adminDb.collection('products').doc(id).get();
    const data = doc.data();
    
    await adminDb.collection('products').doc(id).delete();
    
    // Instant cache invalidation
    revalidatePath('/');
    if (data && data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { error: error.message || 'Failed to delete product' };
  }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  await verifyAdmin();
  try {
    const doc = await adminDb.collection('products').doc(id).get();
    const data = doc.data();

    await adminDb.collection('products').doc(id).update({
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });

    // Purge related route caches instantly
    revalidatePath('/');
    if (data && data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error toggling product status:', error);
    return { error: error.message || 'Failed to toggle status' };
  }
}

export async function createCategory(data: any) {
  await verifyAdmin();
  try {
    const id = data.id || data.name.toLowerCase().replace(/\s+/g, '-');
    await adminDb.collection('categories').doc(id).set({
      ...data,
      id,
      createdAt: new Date().toISOString()
    });
    
    // Invalidate entire layout cache so navbar and forms update
    revalidatePath('/', 'layout');
    
    return { success: true, id };
  } catch (error: any) {
    console.error('Error creating category:', error);
    return { error: error.message || 'Failed to create category' };
  }
}

export async function getOrders() {
  await verifyAdmin();
  try {
    const snap = await adminDb.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return orders;
  } catch (error) {
    return [];
  }
}

export async function getOrderById(id: string) {
  await verifyAdmin();
  try {
    const doc = await adminDb.collection('orders').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    return null;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  await verifyAdmin();
  try {
    const docRef = adminDb.collection('orders').doc(id);
    await docRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    // Fetch the order data to send email
    const doc = await docRef.get();
    if (doc.exists) {
      const order = { id: doc.id, ...doc.data() } as any;
      if (order.shipping?.email) {
        await sendEmail(
          order.shipping.email,
          `Order Status Update: ${status}`,
          generateOrderStatusUpdateEmailHtml(order, status)
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return { error: error.message || 'Failed to update status' };
  }
}

export async function getSettings() {
  await verifyAdmin();
  try {
    const doc = await adminDb.collection('settings').doc('store').get();
    if (doc.exists) return doc.data();
    return {
      storeName: 'Bbetter',
      supportEmail: 'support@bbetter.com',
      description: 'Premium problem-solving products for home and lifestyle.',
      currency: 'INR',
      gateway: 'razorpay'
    };
  } catch (error) {
    return {
      storeName: 'Bbetter',
      supportEmail: 'support@bbetter.com',
      description: 'Premium problem-solving products for home and lifestyle.',
      currency: 'INR',
      gateway: 'razorpay'
    };
  }
}

export async function saveSettings(data: any) {
  await verifyAdmin();
  try {
    await adminDb.collection('settings').doc('store').set({
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return { error: error.message || 'Failed to save settings' };
  }
}

export async function addReviewToProduct(productId: string, reviewData: any) {
  await verifyAdmin();
  try {
    const docRef = adminDb.collection('products').doc(productId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { error: 'Product not found' };
    }

    const data = doc.data();
    const reviewsList = data?.reviewsList || [];
    
    const newReview = {
      id: Math.random().toString(36).substring(2, 9),
      rating: parseFloat(reviewData.rating),
      description: reviewData.description,
      image: reviewData.image || null,
      createdAt: new Date().toISOString()
    };

    reviewsList.push(newReview);
    
    // Update total reviews and average rating
    const totalReviews = reviewsList.length;
    const avgRating = reviewsList.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews;

    await docRef.update({
      reviewsList,
      reviews: totalReviews,
      rating: Math.round(avgRating * 10) / 10
    });

    revalidatePath('/');
    if (data?.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${productId}`);
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error: any) {
    console.error('Error adding review:', error);
    return { error: error.message || 'Failed to add review' };
  }
}
