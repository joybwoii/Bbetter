import { getProducts, getCategories } from '@/lib/actions/firestore';
import { MOCK_CATEGORIES } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const categories = await getCategories();
  // Fall back to mock categories for any missing entries (e.g. not yet in Firestore)
  const allCategories = [...categories];
  for (const mock of MOCK_CATEGORIES) {
    if (!allCategories.find(c => c.id === mock.id)) {
      allCategories.push(mock as any);
    }
  }
  const categoryInfo = allCategories.find(c => c.id === id);

  if (!categoryInfo) {
    notFound();
  }

  const products = await getProducts(id);

  return (
    <div className={styles.categoryPage}>
      <div className={styles.header}>
        <h1 className={styles.title}>{categoryInfo.name}</h1>
        {categoryInfo.description && (
          <p className={styles.description}>{categoryInfo.description}</p>
        )}
      </div>

      {products.length > 0 ? (
        <div className={styles.productsGrid}>
          {products.map((product) => (
            <Link href={`/product/${product.id}`} key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {product.image ? (
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>No Image</div>
                )}
                {product.tag && (
                  <span style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, zIndex: 10 }}>
                    {product.tag}
                  </span>
                )}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <div className={styles.productRating}>
                  <span>★</span>
                  <span>{product.rating || '4.5'}</span>
                  <span className={styles.productReviews}>({product.reviews || '0'})</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.productPrice}>₹{product.price.toLocaleString('en-IN')}</span>
                  <button className="iconBtn" aria-label="View product" style={{ backgroundColor: 'var(--surface-hover)', borderRadius: '50%', padding: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.noProducts}>
          <p>We are currently restocking our amazing {categoryInfo.name.toLowerCase()} items. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
