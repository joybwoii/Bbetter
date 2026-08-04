'use server';
import { adminDb } from '../firebase/admin';
import { Product, Category, Order } from '@/types';
import { unstable_noStore as noStore } from 'next/cache';

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const snapshot = await adminDb.collection('products').get();
    
    if (snapshot.empty) {
      return [];
    }

    let products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    products = products.filter(p => p.isActive !== false);

    if (category) {
      products = products.filter(p => p.category === category);
    }

    return products;
  } catch (error) {
    console.error("Firestore getProducts error:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection('products').doc(id).get();
    if (doc.exists) {
      const productData = doc.data();
      
      const reviewsSnapshot = await adminDb.collection('products').doc(id).collection('reviews').orderBy('createdAt', 'desc').get();
      const reviewsList = reviewsSnapshot.docs.map(reviewDoc => ({
        id: reviewDoc.id,
        ...reviewDoc.data()
      }));

      return {
        id: doc.id,
        ...productData,
        reviewsList
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error("Firestore getProductById error:", error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  noStore();
  try {
    const snapshot = await adminDb.collection('categories').get();
    
    if (snapshot.empty) {
      const defaultCategories = [
        { id: 'men', name: 'Men', description: 'Exclusive fragrances for Men' },
        { id: 'women', name: 'Women', description: 'Elegant perfumes for Women' }
      ];
      
      const batch = adminDb.batch();
      defaultCategories.forEach(cat => {
        const ref = adminDb.collection('categories').doc(cat.id);
        batch.set(ref, {
          ...cat,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      
      return defaultCategories as Category[];
    }

    let categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    categories = categories.filter(c => ['men', 'women'].includes(c.id.toLowerCase() || ''));

    if (categories.length === 0) {
      return [
        { id: 'men', name: 'Men', description: 'Exclusive fragrances for Men' },
        { id: 'women', name: 'Women', description: 'Elegant perfumes for Women' }
      ] as Category[];
    }

    return categories;
  } catch (error: unknown) {
    console.error("Firestore getCategories error:", error);
    return [
      { id: 'error', name: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, description: 'Debug error category' }
    ] as Category[];
  }
}

export async function getPublicOrderById(orderId: string, email: string): Promise<Order | null> {
  try {
    const doc = await adminDb.collection('orders').doc(orderId).get();
    if (!doc.exists) return null;
    
    const data = doc.data() as Partial<Order>;
    if (data?.shipping?.email !== email) {
      return null;
    }
    
    return {
      id: doc.id,
      ...data
    } as Order;
  } catch (error) {
    console.error("Firestore getPublicOrderById error:", error);
    return null;
  }
}

export async function getUserOrdersByEmail(email: string): Promise<Order[]> {
  try {
    const snapshot = await adminDb.collection('orders')
      .where('shipping.email', '==', email)
      .get();
      
    if (snapshot.empty) {
      return [];
    }

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order));

    orders.sort((a, b) => {
      const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdAt).getTime() || 0);
      const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdAt).getTime() || 0);
      return timeB - timeA;
    });

    return orders;
  } catch (error) {
    console.error("Firestore getUserOrdersByEmail error:", error);
    return [];
  }
}
