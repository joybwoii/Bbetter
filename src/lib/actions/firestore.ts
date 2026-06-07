'use server';
import { adminDb } from '../firebase/admin';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../mock-data';

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
      // Database is completely empty, fallback to mock data for initial UI
      if (category) {
        return MOCK_PRODUCTS.filter(p => p.category === category) as Product[];
      }
      return MOCK_PRODUCTS as Product[];
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
    console.error("Firestore getProducts error, falling back to mock data:", error);
    if (category) {
      return MOCK_PRODUCTS.filter(p => p.category === category) as Product[];
    }
    return MOCK_PRODUCTS as Product[];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const doc = await adminDb.collection('products').doc(id).get();
    if (doc.exists) {
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    }
    
    // Graceful fallback to mock data if Firestore document is missing
    return (MOCK_PRODUCTS.find(p => p.id === id) as Product) || null;
  } catch (error) {
    console.error("Firestore getProductById error, falling back to mock:", error);
    return (MOCK_PRODUCTS.find(p => p.id === id) as Product) || null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await adminDb.collection('categories').get();
    
    if (snapshot.empty) {
      return MOCK_CATEGORIES as Category[];
    }

    const categories = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];

    return categories;
  } catch (error) {
    console.error("Firestore getCategories error, falling back to mock:", error);
    return MOCK_CATEGORIES as Category[];
  }
}
