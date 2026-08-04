import Link from "next/link";
import styles from "./page.module.css";
import { getProducts, getCategories } from "@/lib/actions/firestore";
import Image from "next/image";

// Category background images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1610461888750-10bfc601b874?w=800&q=80&auto=format&fit=crop",
  women: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80&auto=format&fit=crop",
};

export default async function Home() {
  // Fetch data on the server
  const categoriesPromise = getCategories();
  const productsPromise = getProducts();

  const [categories, products] = await Promise.all([categoriesPromise, productsPromise]);

  const displayCategories = categories;
  const displayProducts = products;

  return (
    <div className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} animate-slide-up`}>
            Discover Your Signature Scent. <br />
            <span>Live Beautifully.</span>
          </h1>
          <p className={`${styles.heroSubtitle} animate-slide-up`} style={{ animationDelay: '100ms' }}>
            Explore our exclusive collection of premium fragrances crafted for an unforgettable presence and lasting impression.
          </p>
          <div className={`${styles.heroActions} animate-slide-up`} style={{ animationDelay: '200ms' }}>
            <Link href="#categories" className="btn btn-primary">
              Shop Now
            </Link>
            <Link href="#trending" className="btn btn-outline">
              Trending
            </Link>
          </div>
        </div>

        <div className={styles.heroImageContainer}>
          <Image
            src="/hero_perfume_black.png"
            alt="Élégance Noir perfume"
            fill
            style={{ objectFit: 'contain', objectPosition: 'center', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}
            priority
            sizes="(max-width: 900px) 100vw, 50vw"
            className="animate-fade-in"
          />
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>Find the perfect scent for every occasion.</p>
        </div>
        
        <div className={styles.categoriesGrid}>
          {displayCategories.map(category => (
            <Link href={`/category/${category.id}`} key={category.id} className={styles.categoryCard}>
              {CATEGORY_IMAGES[category.id] && (
                <Image
                  src={CATEGORY_IMAGES[category.id]}
                  alt={category.name}
                  fill
                  className={styles.bgImage}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className={styles.overlay}></div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryTitle}>{category.name}</h3>
                <p className={styles.categoryLink}>
                  Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Products */}
      <section id="trending" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Trending Now</h2>
          <p className={styles.sectionSubtitle}>Our community&apos;s all-time favorite problem-solving essentials.</p>
        </div>

        <div className={styles.productsGrid}>
          {displayProducts.map(product => (
            <Link href={`/product/${product.id}`} key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                {product.image && (
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
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
                  <span>{product.rating}</span>
                  <span className={styles.productReviews}>({product.reviews})</span>
                </div>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={styles.productPrice}>₹{product.price}</span>
                  <button className="iconBtn" aria-label="Add to cart" style={{ backgroundColor: 'var(--surface-hover)', borderRadius: '50%', padding: '0.5rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

