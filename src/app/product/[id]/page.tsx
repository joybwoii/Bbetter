import styles from './page.module.css';
import { getProductById } from '@/lib/actions/firestore';
import { notFound } from 'next/navigation';
import ProductActions from './ProductActions';
import ProductGallery from './ProductGallery';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || product.isActive === false) {
    notFound();
  }

  // Fallback values if some fields are missing in DB
  const price = product.price || 0;
  const mrp = product.mrp || Math.round(price * 1.5);
  const discount = Math.round(((mrp - price) / mrp) * 100);
  
  // Use images plural if available, fallback to single image
  const images = (product as any).images || (product.image ? [product.image] : []);

  const benefits = product.features && product.features.length > 0 
    ? product.features 
    : [
        "Premium quality materials used",
        "Airtight and durable design",
        "100% Satisfaction Guaranteed"
      ];

  return (
    <div className="container">
      <div className={styles.productPage}>
        <div className={styles.grid}>
          {/* Media Section */}
          <ProductGallery images={images} name={product.name} />

          {/* Info Section */}
          <div className={styles.infoSection}>
            {product.tag && <span className={styles.badge}>{product.tag}</span>}
            <h1 className={styles.title}>{product.name}</h1>
            
            <div className={styles.rating}>
              <span>★★★★★</span>
              <span style={{ color: 'var(--foreground)' }}>{product.rating || '4.8'}</span>
              <span className={styles.reviewsLink}>({product.reviews || Math.floor(Math.random() * 500) + 50} reviews)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>₹{price.toLocaleString('en-IN')}</span>
              {mrp > price && (
                <>
                  <span className={styles.mrp}>₹{mrp.toLocaleString('en-IN')}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{discount}% OFF</span>
                </>
              )}
            </div>

            {product.stock && product.stock < 10 && (
              <div className={styles.urgencyBox}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>Limited Stock! Only {product.stock} left.</span>
              </div>
            )}

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {product.description || 'No description available for this product.'}
            </p>

            <ul className={styles.benefitsList}>
              {benefits.map((benefit, idx) => (
                <li key={idx} className={styles.benefitItem}>
                  <svg className={styles.benefitIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <ProductActions product={{
              id: product.id,
              name: product.name,
              price: price,
              image: product.image,
              category: product.category
            }} />

            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <svg className={styles.trustIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                <span>Free Express Delivery</span>
              </div>
              <div className={styles.trustBadge}>
                <svg className={styles.trustIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <span>1 Year Warranty</span>
              </div>
              <div className={styles.trustBadge}>
                <svg className={styles.trustIcon} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <span>COD Available</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
