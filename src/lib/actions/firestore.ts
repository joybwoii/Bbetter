'use server';
import { adminDb } from '../firebase/admin';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrp?: number;
  image?: string;
  category: string;
  tag?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  features?: string[];
  specs?: Record<string, string>;
  isActive?: boolean;
  isCODEnabled?: boolean;
  isOnlinePaymentEnabled?: boolean;
  reviewsList?: {
    id: string;
    rating: number;
    description: string;
    image?: string;
    createdAt: string;
  }[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export async function getProducts(category?: string): Promise<Product[]> {
  try {
    const snapshot = await adminDb.collection('products').get();
    
    if (snapshot.empty) {
      return [];
    }

    let products = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Filter in-memory to prevent complex composite index errors
    products = products.filter((p: any) => p.isActive !== false);

    if (category) {
      products = products.filter((p: any) => p.category === category);
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
      const productData = doc.data() as any;
      
      // Fetch reviews subcollection
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

import { unstable_noStore as noStore } from 'next/cache';

export async function getCategories(): Promise<Category[]> {
  noStore();
  try {
    const snapshot = await adminDb.collection('categories').get();
    
    if (snapshot.empty) {
      // Auto-seed default categories if empty
      const defaultCategories = [
        { id: 'kitchen', name: 'Kitchen', description: 'Smart kitchen utilities and gadgets' },
        { id: 'organization', name: 'Organization', description: 'Premium home organization solutions' },
        { id: 'gadgets', name: 'Gadgets', description: 'Innovative smart gadgets for daily use' },
        { id: 'beauty', name: 'Beauty', description: 'Advanced beauty and grooming products' },
        { id: 'home-gym', name: 'Home Gym', description: 'Compact and smart fitness equipment' }
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
      
      return defaultCategories;
    }

    const categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    return categories;
  } catch (error: any) {
    console.error("Firestore getCategories error:", error);
    return [
      { id: 'error', name: `Error: ${error.message || 'Unknown error'}`, description: 'Debug error category' }
    ];
  }
}

export async function getPublicOrderById(orderId: string, email: string) {
  try {
    const doc = await adminDb.collection('orders').doc(orderId).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    // Verify email matches to prevent unauthorized scraping
    if (data?.customer?.email !== email && data?.customerEmail !== email) {
      return null;
    }
    
    return {
      id: doc.id,
      ...data
    };
  } catch (error) {
    console.error("Firestore getPublicOrderById error:", error);
    return null;
  }
}

export async function getUserOrdersByEmail(email: string) {
  try {
    const snapshot = await adminDb.collection('orders')
      .where('shipping.email', '==', email)
      .orderBy('createdAt', 'desc')
      .get();
      
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Firestore getUserOrdersByEmail error:", error);
    return [];
  }
}
