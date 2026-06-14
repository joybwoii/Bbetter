'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addReviewToProduct } from '@/lib/actions/admin';
import styles from '../../../admin.module.css';

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: '5',
    description: '',
    image: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await addReviewToProduct(productId, formData);
    
    setLoading(false);

    if (result.success) {
      alert('Review added successfully!');
      setFormData({ rating: '5', description: '', image: '' });
      router.refresh();
    } else {
      alert(result.error || 'Failed to add review');
    }
  };

  return (
    <div className={styles.panelCard} style={{ maxWidth: '800px', marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Add Dummy Review</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
        
        <div>
          <label className={styles.statLabel}>Rating</label>
          <select 
            name="rating" 
            className="input" 
            value={formData.rating} 
            onChange={handleChange} 
            required
          >
            <option value="5">5 Stars</option>
            <option value="4.5">4.5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3.5">3.5 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div>
          <label className={styles.statLabel}>Review Description</label>
          <textarea 
            name="description" 
            className="input" 
            rows={3} 
            value={formData.description} 
            onChange={handleChange} 
            required 
            placeholder="Great product! Highly recommend..."
          />
        </div>

        <div>
          <label className={styles.statLabel}>Review Image (Optional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            style={{ display: 'block', marginTop: '0.5rem' }}
          />
          {formData.image && (
            <div style={{ marginTop: '1rem' }}>
              <img src={formData.image} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            </div>
          )}
        </div>

        <div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {loading ? 'Adding...' : 'Add Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
