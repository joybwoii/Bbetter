'use server';

import { adminDb } from '../firebase/admin';
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_USERS } from '../mock-data';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from './auth';

export async function getDashboardStats() {
  await verifyAdmin();
  try {
    const productsSnap = await adminDb.collection('products').count().get();
    const usersSnap = await adminDb.collection('users').count().get();
    const ordersSnap = await adminDb.collection('orders').get();

    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const finalOrders = orders.length > 0 ? orders : MOCK_ORDERS;

    let totalSales = 0;
    let activeOrders = 0;
    
    finalOrders.forEach((order: any) => {
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
      totalCustomers: usersSnap.data()?.count || MOCK_USERS.length,
      lowStockItems: 3, 
      recentOrders: finalOrders.slice(0, 5),
    };
  } catch (error) {
    return {
      totalSales: MOCK_ORDERS.reduce((acc, curr) => acc + (curr.status !== 'CANCELLED' ? curr.total : 0), 0),
      activeOrders: MOCK_ORDERS.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.status)).length,
      totalCustomers: MOCK_USERS.length,
      lowStockItems: 3,
      recentOrders: MOCK_ORDERS.slice(0, 5),
    };
  }
}

export async function getProducts() {
  await verifyAdmin();
  try {
    const snap = await adminDb.collection('products').get();
    const products = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return products.length > 0 ? products : MOCK_PRODUCTS;
  } catch (error) {
    return MOCK_PRODUCTS;
  }
}

export async function getUsers() {
  await verifyAdmin();
  try {
    const snap = await adminDb.collection('users').get();
    const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return users.length > 0 ? users : MOCK_USERS;
  } catch (error) {
    return MOCK_USERS;
  }
}

export async function createProduct(data: any) {
  await verifyAdmin();
  try {
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
    return orders.length > 0 ? orders : MOCK_ORDERS;
  } catch (error) {
    return MOCK_ORDERS;
  }
}

export async function getOrderById(id: string) {
  await verifyAdmin();
  try {
    const doc = await adminDb.collection('orders').doc(id).get();
    if (!doc.exists) {
      return MOCK_ORDERS.find(o => o.id === id) || null;
    }
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    return MOCK_ORDERS.find(o => o.id === id) || null;
  }
}

export async function updateOrderStatus(id: string, status: string) {
  await verifyAdmin();
  try {
    await adminDb.collection('orders').doc(id).update({
      status,
      updatedAt: new Date().toISOString()
    });
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
