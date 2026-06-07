'use client';
import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Ensure we have at least one image
  const galleryImages = images && images.length > 0 ? images : ['https://placehold.co/600x600?text=No+Image'];

  return (
    <div className={styles.mediaSection}>
      <div className={styles.mainMedia}>
        <Image 
          src={galleryImages[activeIndex]} 
          alt={name} 
          fill 
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div className={styles.thumbnails}>
        {galleryImages.map((img, idx) => (
          <div 
            key={idx} 
            className={`${styles.thumbnail} ${idx === activeIndex ? styles.active : ''}`}
            onClick={() => setActiveIndex(idx)}
          >
            <Image 
              src={img} 
              alt={`${name} thumbnail ${idx + 1}`} 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
