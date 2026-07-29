'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, Suspense } from 'react';

function FilterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || 'default';

  const handleSortChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === 'default') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.5rem' }}>
      <label htmlFor="sort-filter" style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>
        Sort by:
      </label>
      <select
        id="sort-filter"
        value={currentSort}
        onChange={handleSortChange}
        style={{
          padding: '0.5rem',
          borderRadius: '0.5rem',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
          fontSize: '0.9rem',
          outline: 'none',
          cursor: 'pointer'
        }}
      >
        <option value="default">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="most-selling">Most Selling</option>
      </select>
    </div>
  );
}

export default function ProductFilter() {
  return (
    <Suspense fallback={<div style={{ height: '40px', marginBottom: '1.5rem' }}></div>}>
      <FilterContent />
    </Suspense>
  );
}
