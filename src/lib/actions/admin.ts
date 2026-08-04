'use server';

import { adminDb, adminStorage } from '../firebase/admin';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from './auth';
import { sendEmail, generateOrderStatusUpdateEmailHtml } from '../email';
import { Product, Order, UserProfile, Category } from '@/types';

export async function getDashboardStats() {
  try {
    await verifyAdmin();
    const productsSnap = await adminDb.collection('products').count().get();
    const usersSnap = await adminDb.collection('users').count().get();
    
    // Fetch all and sort in memory to avoid any index issues
    const allOrdersSnapTemp = await adminDb.collection('orders').get();
    let finalOrders = allOrdersSnapTemp.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    finalOrders.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return timeB - timeA;
    });
    
    const recentUsersSnapTemp = await adminDb.collection('users').get();
    let recentUsers = recentUsersSnapTemp.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    recentUsers.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return timeB - timeA;
    });

    finalOrders = finalOrders.slice(0, 5);
    recentUsers = recentUsers.slice(0, 5);

    const allOrdersSnap = await adminDb.collection('orders').get();
    const allOrders = allOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

    let totalSales = 0;
    let activeOrders = 0;
    
    allOrders.forEach((order) => {
      if (order.status !== 'Cancelled') {
        totalSales += order.total || 0;
      }
      if (['Pending', 'Processing', 'Shipped'].includes(order.status || '')) {
        activeOrders++;
      }
    });

    return {
      totalSales,
      activeOrders,
      totalCustomers: usersSnap.data().count || 0,
      totalProducts: productsSnap.data().count || 0,
      lowStockItems: 3, 
      recentOrders: finalOrders,
      recentUsers: recentUsers,
    };
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return {
      totalSales: 0,
      activeOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      lowStockItems: 0,
      recentOrders: [],
      recentUsers: [],
    };
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    await verifyAdmin();
    const snap = await adminDb.collection('products').get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    return products;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getUsers(): Promise<UserProfile[]> {
  try {
    await verifyAdmin();
    const snap = await adminDb.collection('users').get();
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
    return users;
  } catch (error) {
    console.error(error);
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
    return imageString;
  }
}

export async function createProduct(data: Partial<Product>) {
  try {
    await verifyAdmin();
    if (data.image) {
      data.image = await processImage(data.image);
    }

    const docRef = await adminDb.collection('products').add({
      ...data,
      isActive: true,
      createdAt: new Date().toISOString()
    });
    
    revalidatePath('/');
    if (data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath('/admin/products');
    
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    console.error('Error creating product:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create product' };
  }
}

export async function updateProduct(id: string, data: Partial<Product>) {
  try {
    await verifyAdmin();
    if (data.image) {
      data.image = await processImage(data.image);
    }

    await adminDb.collection('products').doc(id).update({
      ...data,
      updatedAt: new Date().toISOString()
    });
    
    revalidatePath('/');
    if (data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await verifyAdmin();
    const doc = await adminDb.collection('products').doc(id).get();
    const data = doc.data();
    
    await adminDb.collection('products').doc(id).delete();
    
    revalidatePath('/');
    if (data && data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');
    
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete product' };
  }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  try {
    await verifyAdmin();
    const doc = await adminDb.collection('products').doc(id).get();
    const data = doc.data();

    await adminDb.collection('products').doc(id).update({
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });

    revalidatePath('/');
    if (data && data.category) {
      revalidatePath(`/category/${data.category}`);
    }
    revalidatePath(`/product/${id}`);
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error: unknown) {
    console.error('Error toggling product status:', error);
    return { error: error instanceof Error ? error.message : 'Failed to toggle status' };
  }
}

export async function createCategory(data: Partial<Category>) {
  try {
    await verifyAdmin();
    const id = data.id || (data.name ? data.name.toLowerCase().replace(/\s+/g, '-') : '');
    await adminDb.collection('categories').doc(id).set({
      ...data,
      id,
      createdAt: new Date().toISOString()
    });
    
    revalidatePath('/', 'layout');
    
    return { success: true, id };
  } catch (error: unknown) {
    console.error('Error creating category:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create category' };
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    await verifyAdmin();
    const snap = await adminDb.collection('orders').get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return timeB - timeA;
    });
    return orders;
  } catch (error) {
    console.error("getOrders error:", error);
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | null> {
  try {
    await verifyAdmin();
    const doc = await adminDb.collection('orders').doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return { id: doc.id, ...doc.data() } as Order;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  try {
    await verifyAdmin();
    const docRef = adminDb.collection('orders').doc(id);
    await docRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    const doc = await docRef.get();
    if (doc.exists) {
      const order = { id: doc.id, ...doc.data() } as Order;
      if (order.shipping?.email) {
        await sendEmail(
          order.shipping.email,
          `Order Status Update: ${status}`,
          generateOrderStatusUpdateEmailHtml(order, status)
        );
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating order status:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update status' };
  }
}

export async function getSettings() {
  try {
    await verifyAdmin();
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
    console.error(error);
    return {
      storeName: 'Bbetter',
      supportEmail: 'support@bbetter.com',
      description: 'Premium problem-solving products for home and lifestyle.',
      currency: 'INR',
      gateway: 'razorpay'
    };
  }
}

export async function saveSettings(data: Record<string, unknown>) {
  try {
    await verifyAdmin();
    await adminDb.collection('settings').doc('store').set({
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error: unknown) {
    console.error('Error saving settings:', error);
    return { error: error instanceof Error ? error.message : 'Failed to save settings' };
  }
}

export async function addReviewToProduct(productId: string, reviewData: { rating: string, description: string, image?: string }) {
  try {
    await verifyAdmin();
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
    
    const totalReviews = reviewsList.length;
    const avgRating = reviewsList.reduce((acc: number, curr: { rating: number }) => acc + curr.rating, 0) / totalReviews;

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
  } catch (error: unknown) {
    console.error('Error adding review:', error);
    return { error: error instanceof Error ? error.message : 'Failed to add review' };
  }
}
