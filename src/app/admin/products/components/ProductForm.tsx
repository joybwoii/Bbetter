'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/actions/admin';
import styles from '../../admin.module.css';

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  isEdit?: boolean;
}

export default function ProductForm({ initialData, categories, isEdit = false }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    mrp: initialData?.mrp || '',
    stock: initialData?.stock || '',
    category: initialData?.category || categories[0]?.id || '',
    image: initialData?.image || '',
    tag: initialData?.tag || '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      ...formData,
      price: parseFloat(formData.price.toString()),
      mrp: parseFloat(formData.mrp.toString()),
      stock: parseInt(formData.stock.toString()),
    };

    let result;
    if (isEdit && initialData.id) {
      result = await updateProduct(initialData.id, data);
    } else {
      result = await createProduct(data);
    }

    setLoading(false);

    if (result.success) {
      router.push('/admin/products');
      router.refresh();
    } else {
      alert(result.error || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.panelCard} style={{ maxWidth: '800px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label className={styles.statLabel}>Product Name</label>
          <input 
            type="text" 
            name="name" 
            className="input" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Smart Spatula"
          />
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className={styles.statLabel}>Description</label>
          <textarea 
            name="description" 
            className="input" 
            rows={4} 
            value={formData.description} 
            onChange={handleChange} 
            placeholder="Detailed description of the product..."
          />
        </div>

        <div>
          <label className={styles.statLabel}>Price (₹)</label>
          <input 
            type="number" 
            name="price" 
            className="input" 
            value={formData.price} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className={styles.statLabel}>MRP (₹)</label>
          <input 
            type="number" 
            name="mrp" 
            className="input" 
            value={formData.mrp} 
            onChange={handleChange} 
          />
        </div>

        <div>
          <label className={styles.statLabel}>Stock Quantity</label>
          <input 
            type="number" 
            name="stock" 
            className="input" 
            value={formData.stock} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div>
          <label className={styles.statLabel}>Category</label>
          <select 
            name="category" 
            className="input" 
            value={formData.category} 
            onChange={handleChange} 
            required
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ gridColumn: 'span 2' }}>
          <label className={styles.statLabel}>Product Image</label>
          
          <div className="mediaSelectorTabs">
            <button 
              type="button" 
              className={`mediaTab ${imageSource === 'upload' ? 'active' : ''}`}
              onClick={() => setImageSource('upload')}
            >
              Upload from Gallery
            </button>
            <button 
              type="button" 
              className={`mediaTab ${imageSource === 'url' ? 'active' : ''}`}
              onClick={() => setImageSource('url')}
            >
              Image URL
            </button>
          </div>

          {imageSource === 'upload' ? (
            <div className="uploadZone" onClick={() => document.getElementById('fileInput')?.click()}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 0.5rem', display: 'block', color: 'var(--text-muted)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Click to select an image from gallery</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports PNG, JPG, JPEG, WEBP, SVG</p>
              <input 
                type="file" 
                id="fileInput" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange} 
              />
            </div>
          ) : (
            <input 
              type="text" 
              name="image" 
              className="input" 
              value={formData.image.startsWith('data:') ? '' : formData.image} 
              onChange={handleChange} 
              placeholder="https://example.com/image.jpg"
            />
          )}

          {formData.image && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Image Preview:</span>
              <div className="uploadPreview">
                <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className={styles.statLabel}>Tag (Optional)</label>
          <input 
            type="text" 
            name="tag" 
            className="input" 
            value={formData.tag} 
            onChange={handleChange} 
            placeholder="e.g. Best Seller"
          />
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
          {loading && <span className="spinner"></span>}
          {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
