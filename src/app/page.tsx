import Link from "next/link";
import styles from "./page.module.css";
import { getProducts, getCategories } from "@/lib/actions/firestore";
import { MOCK_CATEGORIES } from "@/lib/mock-data";
import Image from "next/image";

// Category background images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  kitchen: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop",
  organization: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&q=80&auto=format&fit=crop",
  gadgets: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80&auto=format&fit=crop",
  beauty: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop",
  "home-gym": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop",
};

export default async function Home() {
  // Fetch data on the server
  const categoriesPromise = getCategories();
  const productsPromise = getProducts();

  const [categories, products] = await Promise.all([categoriesPromise, productsPromise]);

  // Merge with mock categories so all 5 always show
  const allCategories = [...categories];
  for (const mock of MOCK_CATEGORIES) {
    if (!allCategories.find((c: any) => c.id === mock.id)) {
      allCategories.push(mock as any);
    }
  }

  const displayCategories = allCategories;
  const displayProducts = products;

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <Image
          src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80&auto=format&fit=crop"
          alt="Modern lifestyle home interior"
          fill
          className={styles.heroImage}
          priority
          sizes="100vw"
        />
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={`${styles.heroTitle} animate-fade-in`}>
            Simplify Everyday. <br />
            <span className="text-gradient">Live Better.</span>
          </h1>
          <p className={`${styles.heroSubtitle} animate-fade-in`} style={{ animationDelay: '100ms' }}>
            Discover our curated collection of intelligent home gadgets and organization solutions designed for a modern, clutter-free lifestyle.
          </p>
          <div className={`${styles.heroActions} animate-fade-in`} style={{ animationDelay: '200ms' }}>
            <Link href="#categories" className="btn btn-primary">
              Shop Now
            </Link>
            <Link href="#trending" className="btn btn-outline">
              Trending
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Shop by Category</h2>
          <p className={styles.sectionSubtitle}>Find exactly what you need to upgrade every corner of your home.</p>
        </div>
        
        <div className={styles.categoriesGrid}>
          {displayCategories.map((category: any) => (
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
          {displayProducts.map((product: any) => (
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

