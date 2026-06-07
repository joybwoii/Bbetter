"use client";
import React from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAdding, setIsAdding] = React.useState(false);
  const [isBuying, setIsBuying] = React.useState(false);

  const handleAddToCart = async () => {
    if (isAdding || isBuying) return;
    setIsAdding(true);
    
    // Simulate premium network latency
    await new Promise(resolve => setTimeout(resolve, 650));

    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    };
    addToCart(item);
    setIsAdding(false);
  };

  const handleBuyNow = async () => {
    if (isAdding || isBuying) return;
    setIsBuying(true);

    // Simulate premium network latency
    await new Promise(resolve => setTimeout(resolve, 650));

    const item: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      category: product.category
    };
    addToCart(item);
    setIsBuying(false);
    router.push('/checkout');
  };

  return (
    <div className={styles.actions}>
      <button 
        className={`btn btn-primary ${styles.buyNowBtn}`}
        onClick={handleBuyNow}
        disabled={isAdding || isBuying}
      >
        {isBuying && <span className="spinner"></span>}
        {isBuying ? 'Processing...' : 'Buy Now'}
      </button>
      <button 
        className={`btn btn-outline ${styles.buyNowBtn}`} 
        style={{ borderColor: 'var(--border)' }}
        onClick={handleAddToCart}
        disabled={isAdding || isBuying}
      >
        {isAdding && <span className="spinner spinner-primary"></span>}
        {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
      </button>
    </div>
  );
}
