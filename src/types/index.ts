export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  role?: string;
  createdAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  description: string;
  image?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  mrp?: number;
  image?: string;
  category?: string;
  tag?: string;
  stock?: number;
  isActive?: boolean;
  features?: string[];
  rating?: number;
  reviews?: number;
  reviewsList?: Review[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
}

export interface OrderShipping {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  shipping: OrderShipping;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}