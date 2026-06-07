'use client';

import { deleteProduct } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          router.refresh();
        } else {
          alert(result.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error(error);
        alert('An error occurred while deleting the product');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <form onSubmit={handleDelete}>
      <button 
        type="submit" 
        className="btn btn-outline" 
        disabled={isDeleting}
        style={{ 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.75rem', 
          color: 'var(--danger)', 
          borderColor: 'var(--danger)',
          opacity: isDeleting ? 0.5 : 1
        }}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </form>
  );
}
