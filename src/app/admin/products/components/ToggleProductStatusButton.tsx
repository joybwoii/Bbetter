'use client';

import { toggleProductStatus } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ToggleProductStatusButton({ id, isActive }: { id: string, isActive: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const handleToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const result = await toggleProductStatus(id, isActive);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while updating the product status');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleToggle}>
      <button 
        type="submit" 
        className="btn btn-outline" 
        disabled={isPending}
        style={{ 
          padding: '0.25rem 0.75rem', 
          fontSize: '0.75rem',
          opacity: isPending ? 0.5 : 1
        }}
      >
        {isPending ? 'Updating...' : (isActive ? 'Deactivate' : 'Activate')}
      </button>
    </form>
  );
}
